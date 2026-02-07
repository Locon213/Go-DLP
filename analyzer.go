package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// analyzeURLInternal analyzes a YouTube URL and returns video information
func (a *App) analyzeURLInternal(url string) (string, error) {
	ytDlpPath := filepath.Join("./bin", a.getYtDlpBinaryName())

	// Build command arguments based on settings - ensure we only get info, not download
	// Updated to get all available formats without restrictions
	args := []string{"--print-json", "--simulate", url, "--no-warnings",
		"--extractor-args", "youtube:player-client=web,mobile,android,ios"}

	// Add proxy settings if enabled
	if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
		args = append(args, "--proxy", a.settings.ProxyAddress)
	}
	// Note: When ProxyMode is "system", yt-dlp automatically uses system proxy settings
	// We don't need to add --proxy argument for system mode

	// Add cookies settings if enabled
	if a.settings.CookiesMode == "browser" {
		cookiesArg := fmt.Sprintf("--cookies-from-browser=%s", a.settings.CookiesBrowser)
		args = append(args, cookiesArg)
	} else if a.settings.CookiesMode == "file" && a.settings.CookiesFile != "" {
		// Check if the cookies file exists before using it
		if _, err := os.Stat(a.settings.CookiesFile); err == nil {
			args = append(args, "--cookies", a.settings.CookiesFile)
		} else {
			wailsRuntime.LogInfof(a.ctx, "Cookies file does not exist: %s, proceeding without cookies", a.settings.CookiesFile)
		}
	}

	// Hide console window on Windows
	cmd := exec.Command(ytDlpPath, args...)
	setHideWindow(cmd)

	output, err := cmd.Output()
	if err != nil {
		// Log stderr output if available
		if exitError, ok := err.(*exec.ExitError); ok {
			stderrStr := string(exitError.Stderr)
			wailsRuntime.LogInfof(a.ctx, "First attempt failed with stderr: %s", stderrStr)

			// Check if the error is related to cookies or format availability
			isCookiesError := strings.Contains(stderrStr, "cookies") ||
				strings.Contains(stderrStr, "Sign in to confirm") ||
				strings.Contains(stderrStr, "authentication")
			isFormatError := strings.Contains(stderrStr, "Requested format is not available")

			// If cookies are enabled and we get a format error, try without cookies
			if (isCookiesError || isFormatError) && (a.settings.CookiesMode == "browser" || a.settings.CookiesMode == "file") {
				wailsRuntime.LogInfof(a.ctx, "Cookies-related error detected, trying without cookies...")

				// Try without cookies
				argsWithoutCookies := []string{"--print-json", "--simulate", url, "--no-warnings",
					"--extractor-args", "youtube:player-client=web,mobile,android,ios"}

				// Add proxy settings if enabled (but no cookies)
				if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
					argsWithoutCookies = append(argsWithoutCookies, "--proxy", a.settings.ProxyAddress)
				}
				// Note: When ProxyMode is "system", yt-dlp automatically uses system proxy settings

				cmdWithoutCookies := exec.Command(ytDlpPath, argsWithoutCookies...)
				setHideWindow(cmdWithoutCookies)

				output, err = cmdWithoutCookies.Output()
				if err == nil {
					wailsRuntime.LogInfof(a.ctx, "Successfully retrieved info without cookies")
				} else {
					wailsRuntime.LogInfof(a.ctx, "Attempt without cookies also failed")
				}
			}

			// If still have error, check if it's format availability issue
			if err != nil && isFormatError {
				// If format is not available, try without specifying format restrictions
				fallbackArgs := []string{"--print-json", "--simulate", url, "--no-warnings",
					"--extractor-args", "youtube:player-client=web,mobile,android,ios"}

				// Add proxy settings if enabled
				if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
					fallbackArgs = append(fallbackArgs, "--proxy", a.settings.ProxyAddress)
				}
				// Note: When ProxyMode is "system", yt-dlp automatically uses system proxy settings

				// Add cookies settings if enabled
				if a.settings.CookiesMode == "browser" {
					cookiesArg := fmt.Sprintf("--cookies-from-browser=%s", a.settings.CookiesBrowser)
					fallbackArgs = append(fallbackArgs, cookiesArg)
				} else if a.settings.CookiesMode == "file" && a.settings.CookiesFile != "" {
					// Check if the cookies file exists before using it
					if _, err := os.Stat(a.settings.CookiesFile); err == nil {
						fallbackArgs = append(fallbackArgs, "--cookies", a.settings.CookiesFile)
					} else {
						wailsRuntime.LogInfof(a.ctx, "Cookies file does not exist: %s, proceeding without cookies", a.settings.CookiesFile)
					}
				}

				fallbackCmd := exec.Command(ytDlpPath, fallbackArgs...)
				setHideWindow(fallbackCmd)

				output, err = fallbackCmd.Output()
				if err != nil {
					// If fallback also fails, log the error but try one more approach
					wailsRuntime.LogInfof(a.ctx, "Fallback attempt also failed with stderr: %s", string(exitError.Stderr))

					// Try with minimal arguments to get basic info
					minimalArgs := []string{"--print-json", "--simulate", url,
						"--extractor-args", "youtube:player-client=web,mobile,android,ios"}

					// Add proxy settings if enabled
					if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
						minimalArgs = append(minimalArgs, "--proxy", a.settings.ProxyAddress)
					}
					// Note: When ProxyMode is "system", yt-dlp automatically uses system proxy settings

					// Add cookies settings if enabled
					if a.settings.CookiesMode == "browser" {
						cookiesArg := fmt.Sprintf("--cookies-from-browser=%s", a.settings.CookiesBrowser)
						minimalArgs = append(minimalArgs, cookiesArg)
					} else if a.settings.CookiesMode == "file" && a.settings.CookiesFile != "" {
						// Check if the cookies file exists before using it
						if _, err := os.Stat(a.settings.CookiesFile); err == nil {
							minimalArgs = append(minimalArgs, "--cookies", a.settings.CookiesFile)
						} else {
							wailsRuntime.LogInfof(a.ctx, "Cookies file does not exist: %s, proceeding without cookies", a.settings.CookiesFile)
						}
					}

					minimalCmd := exec.Command(ytDlpPath, minimalArgs...)
					setHideWindow(minimalCmd)

					output, err = minimalCmd.Output()
					if err != nil {
						// If even minimal attempt fails, try with --list-formats to see what's available
						// and then try to get basic info without format restrictions
						listArgs := []string{"--list-formats", "--simulate", url, "--no-warnings",
							"--extractor-args", "youtube:player-client=web,mobile,android,ios"}

						// Add proxy settings if enabled
						if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
							listArgs = append(listArgs, "--proxy", a.settings.ProxyAddress)
						}
						// Note: When ProxyMode is "system", yt-dlp automatically uses system proxy settings

						// Add cookies settings if enabled
						if a.settings.CookiesMode == "browser" {
							cookiesArg := fmt.Sprintf("--cookies-from-browser=%s", a.settings.CookiesBrowser)
							listArgs = append(listArgs, cookiesArg)
						} else if a.settings.CookiesMode == "file" && a.settings.CookiesFile != "" {
							// Check if the cookies file exists before using it
							if _, err := os.Stat(a.settings.CookiesFile); err == nil {
								listArgs = append(listArgs, "--cookies", a.settings.CookiesFile)
							} else {
								wailsRuntime.LogInfof(a.ctx, "Cookies file does not exist: %s, proceeding without cookies", a.settings.CookiesFile)
							}
						}

						listCmd := exec.Command(ytDlpPath, listArgs...)
						setHideWindow(listCmd)

						listOutput, listErr := listCmd.CombinedOutput()
						if listErr != nil {
							wailsRuntime.LogInfof(a.ctx, "Format listing failed: %v, output: %s", listErr, string(listOutput))
						} else {
							wailsRuntime.LogInfof(a.ctx, "Available formats: %s", string(listOutput))
						}
					}
				}
			} else if err != nil && !isFormatError {
				a.logDetailedError("AnalyzeURL", url, "", fmt.Errorf("exit status: %v, stderr: %s", exitError.ExitCode(), stderrStr))
			}
		} else {
			a.logDetailedError("AnalyzeURL", url, "", err)
		}

		if err != nil {
			// Try with the older flag if --print-json fails
			args = []string{"--dump-single-json", "--simulate", url, "--no-warnings",
				"--extractor-args", "youtube:player-client=web,mobile,android,ios"}

			// Add proxy settings if enabled
			if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
				args = append(args, "--proxy", a.settings.ProxyAddress)
			}
			// Note: When ProxyMode is "system", yt-dlp automatically uses system proxy settings

			// Add cookies settings if enabled
			if a.settings.CookiesMode == "browser" {
				cookiesArg := fmt.Sprintf("--cookies-from-browser=%s", a.settings.CookiesBrowser)
				args = append(args, cookiesArg)
			} else if a.settings.CookiesMode == "file" && a.settings.CookiesFile != "" {
				// Check if the cookies file exists before using it
				if _, err := os.Stat(a.settings.CookiesFile); err == nil {
					args = append(args, "--cookies", a.settings.CookiesFile)
				} else {
					wailsRuntime.LogInfof(a.ctx, "Cookies file does not exist: %s, proceeding without cookies", a.settings.CookiesFile)
				}
			}

			cmd = exec.Command(ytDlpPath, args...)
			setHideWindow(cmd)

			output, err = cmd.Output()
			if err != nil {
				if exitError, ok := err.(*exec.ExitError); ok {
					a.logDetailedError("AnalyzeURL", url, "", fmt.Errorf("failed to analyze URL: exit status: %v, stderr: %s", exitError.ExitCode(), string(exitError.Stderr)))
					return "", fmt.Errorf("failed to analyze URL: exit status: %v, stderr: %s", exitError.ExitCode(), string(exitError.Stderr))
				} else {
					a.logDetailedError("AnalyzeURL", url, "", err)
					return "", fmt.Errorf("failed to analyze URL: %v", err)
				}
			}
		}
	}

	// Validate that we have valid JSON
	var videoInfo VideoInfo
	if err := json.Unmarshal(output, &videoInfo); err != nil {
		a.logDetailedError("ParseVideoInfo", url, "", err)
		return "", fmt.Errorf("failed to parse video info JSON: %v", err)
	}

	// Skip format enrichment to speed up analysis
	// The basic info from yt-dlp is sufficient for most use cases
	// videoInfo.Formats = a.enrichFormatInfo(ytDlpPath, url, videoInfo.Formats)

	// Return the JSON as string
	return string(output), nil
}

// enrichFormatInfo attempts to get more detailed information for formats, especially file sizes
func (a *App) enrichFormatInfo(ytDlpPath, url string, formats []Format) []Format {
	enrichedFormats := make([]Format, len(formats))
	copy(enrichedFormats, formats)

	// For each format, try to get more detailed info if filesize is missing
	for i, format := range enrichedFormats {
		// Check if filesize is missing or invalid
		if format.FileSize == nil || format.FileSize == 0 {
			// Try to get detailed info for this specific format
			args := []string{"--print-json", "--simulate", "-f", format.FormatID, url, "--no-warnings"}

			// Add proxy settings if enabled
			if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
				args = append(args, "--proxy", a.settings.ProxyAddress)
			}
			// Note: When ProxyMode is "system", yt-dlp automatically uses system proxy settings

			// Add cookies settings if enabled
			if a.settings.CookiesMode == "browser" {
				cookiesArg := fmt.Sprintf("--cookies-from-browser=%s", a.settings.CookiesBrowser)
				args = append(args, cookiesArg)
			} else if a.settings.CookiesMode == "file" && a.settings.CookiesFile != "" {
				// Check if the cookies file exists before using it
				if _, err := os.Stat(a.settings.CookiesFile); err == nil {
					args = append(args, "--cookies", a.settings.CookiesFile)
				} else {
					wailsRuntime.LogInfof(a.ctx, "Cookies file does not exist: %s, proceeding without cookies", a.settings.CookiesFile)
				}
			}

			cmd := exec.Command(ytDlpPath, args...)
			setHideWindow(cmd)

			output, err := cmd.Output()
			if err == nil {
				// Parse the detailed info
				var detailedInfo VideoInfo
				if err := json.Unmarshal(output, &detailedInfo); err == nil && len(detailedInfo.Formats) > 0 {
					detailedFormat := detailedInfo.Formats[0]

					// Update the format with detailed info if available
					if detailedFormat.FileSize != nil && detailedFormat.FileSize != 0 {
						enrichedFormats[i].FileSize = detailedFormat.FileSize
					}
					if detailedFormat.FileSizeApprox != nil {
						enrichedFormats[i].FileSizeApprox = detailedFormat.FileSizeApprox
					}
				}
			} else {
				// Check if the error is related to cookies
				if exitError, ok := err.(*exec.ExitError); ok {
					stderrStr := string(exitError.Stderr)
					isCookiesError := strings.Contains(stderrStr, "cookies") ||
						strings.Contains(stderrStr, "Sign in to confirm") ||
						strings.Contains(stderrStr, "authentication")
					isFormatError := strings.Contains(stderrStr, "Requested format is not available")

					// If cookies are enabled and we get a format error, try without cookies
					if (isCookiesError || isFormatError) && (a.settings.CookiesMode == "browser" || a.settings.CookiesMode == "file") {
						// Try without cookies
						argsWithoutCookies := []string{"--print-json", "--simulate", "-f", format.FormatID, url, "--no-warnings"}

						// Add proxy settings if enabled (but no cookies)
						if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
							argsWithoutCookies = append(argsWithoutCookies, "--proxy", a.settings.ProxyAddress)
						}
						// Note: When ProxyMode is "system", yt-dlp automatically uses system proxy settings

						cmdWithoutCookies := exec.Command(ytDlpPath, argsWithoutCookies...)
						setHideWindow(cmdWithoutCookies)

						outputWithoutCookies, errWithoutCookies := cmdWithoutCookies.Output()
						if errWithoutCookies == nil {
							// Parse the detailed info
							var detailedInfo VideoInfo
							if err := json.Unmarshal(outputWithoutCookies, &detailedInfo); err == nil && len(detailedInfo.Formats) > 0 {
								detailedFormat := detailedInfo.Formats[0]

								// Update the format with detailed info if available
								if detailedFormat.FileSize != nil && detailedFormat.FileSize != 0 {
									enrichedFormats[i].FileSize = detailedFormat.FileSize
								}
								if detailedFormat.FileSizeApprox != nil {
									enrichedFormats[i].FileSizeApprox = detailedFormat.FileSizeApprox
								}
							}
						} else {
							// Log the error but continue processing other formats
							wailsRuntime.LogInfof(a.ctx, "Failed to enrich format %s (with and without cookies): %s", format.FormatID, stderrStr)
						}
					} else {
						// Log the error but continue processing other formats
						wailsRuntime.LogInfof(a.ctx, "Failed to enrich format %s: %s", format.FormatID, stderrStr)
					}
				} else {
					// Log the error but continue processing other formats
					wailsRuntime.LogInfof(a.ctx, "Failed to enrich format %s: %v", format.FormatID, err)
				}
			}
		}

		// Convert numeric file size to human-readable format
		if fileSize, ok := enrichedFormats[i].FileSize.(float64); ok && fileSize > 0 {
			enrichedFormats[i].FileSizeHuman = formatFileSizeHuman(fileSize)
		} else if fileSize, ok := enrichedFormats[i].FileSizeApprox.(float64); ok && fileSize > 0 {
			enrichedFormats[i].FileSizeHuman = formatFileSizeHuman(fileSize)
		} else if fileSize, ok := enrichedFormats[i].FileSizeApprox.(string); ok && fileSize != "" {
			if fileSizeFloat, err := strconv.ParseFloat(fileSize, 64); err == nil && fileSizeFloat > 0 {
				enrichedFormats[i].FileSizeHuman = formatFileSizeHuman(fileSizeFloat)
			}
		}
	}

	return enrichedFormats
}

// analyzePlaylistInternal analyzes a playlist URL and returns playlist information
func (a *App) analyzePlaylistInternal(url string) (string, error) {
	ytDlpPath := filepath.Join("./bin", a.getYtDlpBinaryName())

	// Build command arguments for playlist info - use --flat-playlist to get just the playlist metadata
	args := []string{"--print-json", "--flat-playlist", "--simulate", url, "--no-warnings",
		"--extractor-args", "youtube:player-client=web,mobile,android,ios"}

	// Add proxy settings if enabled
	if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
		args = append(args, "--proxy", a.settings.ProxyAddress)
	}

	// Add cookies settings if enabled
	if a.settings.CookiesMode == "browser" {
		cookiesArg := fmt.Sprintf("--cookies-from-browser=%s", a.settings.CookiesBrowser)
		args = append(args, cookiesArg)
	} else if a.settings.CookiesMode == "file" && a.settings.CookiesFile != "" {
		if _, err := os.Stat(a.settings.CookiesFile); err == nil {
			args = append(args, "--cookies", a.settings.CookiesFile)
		}
	}

	// Hide console window on Windows
	cmd := exec.Command(ytDlpPath, args...)
	setHideWindow(cmd)

	output, err := cmd.Output()
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			stderrStr := string(exitError.Stderr)
			wailsRuntime.LogInfof(a.ctx, "Playlist analysis failed: %s", stderrStr)

			// Try fallback without cookies if needed
			if strings.Contains(stderrStr, "cookies") || strings.Contains(stderrStr, "Sign in") {
				fallbackArgs := []string{"--print-json", "--flat-playlist", "--simulate", url, "--no-warnings"}

				if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
					fallbackArgs = append(fallbackArgs, "--proxy", a.settings.ProxyAddress)
				}

				cmd = exec.Command(ytDlpPath, fallbackArgs...)
				setHideWindow(cmd)

				output, err = cmd.Output()
			}
		}

		if err != nil {
			a.logDetailedError("AnalyzePlaylist", url, "", err)
			return "", fmt.Errorf("failed to analyze playlist: %v", err)
		}
	}

	// Parse the output to get playlist info
	var playlistData map[string]interface{}
	if err := json.Unmarshal(output, &playlistData); err != nil {
		return "", fmt.Errorf("failed to parse playlist info JSON: %v", err)
	}

	// Create a PlaylistInfo struct from the data
	playlistInfo := PlaylistInfo{
		ID:          getStringValue(playlistData["id"]),
		Title:       getStringValue(playlistData["title"]),
		Description: getStringValue(playlistData["description"]),
		EntryCount:  getIntValue(playlistData["playlist_count"]),
	}

	// If we have entries in the data, populate them
	if entries, ok := playlistData["entries"].([]interface{}); ok {
		for _, entry := range entries {
			if entryMap, ok := entry.(map[string]interface{}); ok {
				playlistEntry := PlaylistEntry{
					ID:        getStringValue(entryMap["id"]),
					Title:     getStringValue(entryMap["title"]),
					Thumbnail: getStringValue(entryMap["thumbnail"]),
					URL:       getStringValue(entryMap["url"]),
					Duration:  getFloatValue(entryMap["duration"]),
				}
				playlistInfo.Entries = append(playlistInfo.Entries, playlistEntry)
			}
		}
	}

	// Convert back to JSON for return
	result, err := json.Marshal(playlistInfo)
	if err != nil {
		return "", fmt.Errorf("failed to marshal playlist info: %v", err)
	}

	return string(result), nil
}

// getPlaylistItemsInternal returns a list of video entries from a playlist
func (a *App) getPlaylistItemsInternal(url string) (string, error) {
	ytDlpPath := filepath.Join("./bin", a.getYtDlpBinaryName())

	// Use --dump-json with --flat-playlist to get just the entries without full video info
	args := []string{"--dump-json", "--flat-playlist", "--simulate", url, "--no-warnings"}

	// Add proxy settings if enabled
	if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
		args = append(args, "--proxy", a.settings.ProxyAddress)
	}

	// Add cookies settings if enabled
	if a.settings.CookiesMode == "browser" {
		cookiesArg := fmt.Sprintf("--cookies-from-browser=%s", a.settings.CookiesBrowser)
		args = append(args, cookiesArg)
	} else if a.settings.CookiesMode == "file" && a.settings.CookiesFile != "" {
		if _, err := os.Stat(a.settings.CookiesFile); err == nil {
			args = append(args, "--cookies", a.settings.CookiesFile)
		}
	}

	// Hide console window on Windows
	cmd := exec.Command(ytDlpPath, args...)
	setHideWindow(cmd)

	output, err := cmd.Output()
	if err != nil {
		// Log the error but try to continue with fallback
		if exitError, ok := err.(*exec.ExitError); ok {
			stderrStr := string(exitError.Stderr)
			wailsRuntime.LogInfof(a.ctx, "GetPlaylistItems failed: %s", stderrStr)

			// Try fallback without cookies if needed
			if strings.Contains(stderrStr, "cookies") || strings.Contains(stderrStr, "Sign in") {
				fallbackArgs := []string{"--dump-json", "--flat-playlist", "--simulate", url, "--no-warnings"}

				if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
					fallbackArgs = append(fallbackArgs, "--proxy", a.settings.ProxyAddress)
				}

				cmd = exec.Command(ytDlpPath, fallbackArgs...)
				setHideWindow(cmd)

				output, err = cmd.Output()
			}
		}

		if err != nil {
			return "", fmt.Errorf("failed to get playlist items: %w", err)
		}
	}

	// Process the output to create an array of PlaylistEntry
	lines := strings.Split(string(output), "\n")
	var entries []PlaylistEntry

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		var entryData map[string]interface{}
		if err := json.Unmarshal([]byte(line), &entryData); err != nil {
			continue // Skip invalid lines
		}

		entry := PlaylistEntry{
			ID:        getStringValue(entryData["id"]),
			Title:     getStringValue(entryData["title"]),
			Thumbnail: getStringValue(entryData["thumbnail"]),
			URL:       getStringValue(entryData["url"]),
			Duration:  getFloatValue(entryData["duration"]),
		}
		entries = append(entries, entry)
	}

	// Create a PlaylistInfo-like structure with just the entries
	playlistItems := struct {
		Entries []PlaylistEntry `json:"entries"`
	}{Entries: entries}

	result, err := json.Marshal(playlistItems)
	if err != nil {
		return "", fmt.Errorf("failed to marshal playlist items: %v", err)
	}

	return string(result), nil
}

// Helper functions to safely extract values from interface{}
func getStringValue(value interface{}) string {
	if str, ok := value.(string); ok {
		return str
	}
	return ""
}

func getIntValue(value interface{}) int {
	if num, ok := value.(float64); ok {
		return int(num)
	}
	if num, ok := value.(int); ok {
		return num
	}
	return 0
}

func getFloatValue(value interface{}) float64 {
	if num, ok := value.(float64); ok {
		return num
	}
	if num, ok := value.(int); ok {
		return float64(num)
	}
	return 0.0
}

// downloadPlaylistInternal downloads an entire playlist
func (a *App) downloadPlaylistInternal(url, formatID, outputPath string, startItem, endItem int) error {
	ytDlpPath := filepath.Join("./bin", a.getYtDlpBinaryName())

	// Build command arguments for playlist download
	args := []string{url, "-f", formatID, "-o", outputPath, "--newline", "--progress", "--ignore-errors"}

	// Add playlist range if specified
	if startItem > 0 {
		if endItem > 0 {
			args = append(args, "--playlist-items", fmt.Sprintf("%d-%d", startItem, endItem))
		} else {
			args = append(args, "--playlist-items", fmt.Sprintf("%d-", startItem))
		}
	}

	// Add proxy settings if enabled
	if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
		args = append(args, "--proxy", a.settings.ProxyAddress)
	}

	// Add cookies settings if enabled
	if a.settings.CookiesMode == "browser" {
		cookiesArg := fmt.Sprintf("--cookies-from-browser=%s", a.settings.CookiesBrowser)
		args = append(args, cookiesArg)
	} else if a.settings.CookiesMode == "file" && a.settings.CookiesFile != "" {
		if _, err := os.Stat(a.settings.CookiesFile); err == nil {
			args = append(args, "--cookies", a.settings.CookiesFile)
		}
	}

	// Add extractor args for YouTube
	args = append(args, "--extractor-args", "youtube:player-client=web,mobile,android,ios")

	// Hide console window on Windows
	cmd := exec.Command(ytDlpPath, args...)
	setHideWindow(cmd)

	// Store the current download command for cancellation
	downloadMutex.Lock()
	currentDownloadCmd = cmd
	downloadMutex.Unlock()

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start download: %w", err)
	}

	wailsRuntime.LogInfof(a.ctx, "Playlist download started for URL: %s", url)

	// Use a shared progress tracker with optimized parsing
	// Pre-compile regex patterns for better performance
	progressTracker := struct {
		mu               sync.Mutex
		previousProgress int
		maxProgress      int
		lastUpdateTime   time.Time
	}{
		previousProgress: -1,
		maxProgress:      -1,
		lastUpdateTime:   time.Time{},
	}

	// Pre-compiled regex patterns for playlist progress
	reProgressMain := regexp.MustCompile(`\[download\]\s+([0-9]{1,3}(?:\.[0-9]+)?)%\s+of\s+(~?[0-9.]+\s*[KMGT]?i?B)\s+at\s+([0-9.]+\s*[KMGT]?i?B/s|unknown)\s+ETA\s+([0-9:]+|unknown)`)
	reProgressFlexible := regexp.MustCompile(`\[download\]\s+([0-9]{1,3}(?:\.[0-9]+)?)%.*?of\s+([0-9.]+\s*[KMGT]?i?B).*?at\s+([0-9.]+\s*[KMGT]?i?B/s).*?ETA\s+([0-9:]+)`)
	reProgressSimple := regexp.MustCompile(`\[download\][^0-9]*([0-9]{1,3})\.?[0-9]*%`)

	// Read stdout and stderr in real-time to get progress and errors
	go func() {
		buffer := make([]byte, 1024)

		for {
			n, err := stdout.Read(buffer)
			if n > 0 {
				output := string(buffer[:n])

				// Log the raw output for debugging
				if strings.Contains(output, "[download]") {
					wailsRuntime.LogInfof(a.ctx, "Raw playlist download output: %s", output)
				}

				// Look for progress indicators in the output
				matches := reProgressMain.FindStringSubmatch(output)

				// If the main pattern doesn't match, try a more flexible one
				if len(matches) < 5 {
					matches = reProgressFlexible.FindStringSubmatch(output)
				}

				if len(matches) >= 5 {
					progress, convErr := strconv.ParseFloat(matches[1], 64)
					if convErr == nil && progress >= 0 && progress <= 100 {
						// Only emit progress if it's different from the previous value
						// Also prevent progress from going backwards
						progressTracker.mu.Lock()
						if int(progress) > progressTracker.maxProgress {
							progressTracker.maxProgress = int(progress)
						}
						// Throttle progress updates to once every 100ms
						shouldEmit := int(progress) != progressTracker.previousProgress &&
							int(progress) >= progressTracker.maxProgress &&
							time.Since(progressTracker.lastUpdateTime) > 100*time.Millisecond

						if shouldEmit {
							progressTracker.previousProgress = int(progress)
							progressTracker.lastUpdateTime = time.Now()
							progressTracker.mu.Unlock()

							// Handle "unknown" values
							size := matches[2]
							speed := matches[3]
							eta := matches[4]

							if speed == "unknown" {
								speed = "Calculating..."
							}
							if eta == "unknown" {
								eta = "Calculating..."
							}

							// Emit progress event with additional information
							wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
								"progress": int(progress),
								"size":     size,
								"speed":    speed,
								"eta":      eta,
							})
						} else {
							progressTracker.mu.Unlock()
						}
					}
				} else {
					// Fallback to simpler pattern: [download]  XX.X%
					matchesSimple := reProgressSimple.FindStringSubmatch(output)
					if len(matchesSimple) > 1 {
						progress, convErr := strconv.Atoi(matchesSimple[1])
						if convErr == nil && progress >= 0 && progress <= 100 {
							// Only emit progress if it's different from the previous value
							progressTracker.mu.Lock()
							if progress != progressTracker.previousProgress {
								progressTracker.previousProgress = progress
								progressTracker.mu.Unlock()

								// Emit progress event with basic information
								wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
									"progress": progress,
									"size":     "Calculating...",
									"speed":    "Calculating...",
									"eta":      "Calculating...",
								})
							} else {
								progressTracker.mu.Unlock()
							}
						}
					}
				}

				// Also check for 100% completion in case the pattern is slightly different
				if strings.Contains(output, "[download]") && strings.Contains(output, "100%") {
					progressTracker.mu.Lock()
					if progressTracker.previousProgress != 100 {
						progressTracker.previousProgress = 100
						progressTracker.mu.Unlock()
						wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
							"progress": 100,
						})
					} else {
						progressTracker.mu.Unlock()
					}
				}
			}

			if err == io.EOF {
				break
			}

			if err != nil {
				wailsRuntime.LogErrorf(a.ctx, "Error reading stdout: %v", err)
				break
			}
		}
	}()

	// Read stderr to check for cookies-related errors
	go func() {
		buffer := make([]byte, 4096)
		var stderrContent strings.Builder

		for {
			n, err := stderr.Read(buffer)
			if n > 0 {
				stderrContent.Write(buffer[:n])
				stderrStr := stderrContent.String()

				// Check for cookies-related errors
				if strings.Contains(stderrStr, "cookies") ||
					strings.Contains(stderrStr, "Sign in to confirm") ||
					strings.Contains(stderrStr, "authentication") ||
					strings.Contains(stderrStr, "Requested format is not available") {

					wailsRuntime.LogInfof(a.ctx, "Cookies-related error detected during playlist download: %s", stderrStr)

					// Kill the current process and try without cookies
					if cmd.Process != nil {
						wailsRuntime.LogInfof(a.ctx, "Killing current playlist download process due to cookies error")
						cmd.Process.Kill()
					}

					// Clear the current download command
					downloadMutex.Lock()
					currentDownloadCmd = nil
					downloadMutex.Unlock()

					// Try downloading without cookies
					argsWithoutCookies := []string{url, "-f", formatID, "-o", outputPath, "--newline", "--progress", "--ignore-errors"}

					// Add playlist range if specified
					if startItem > 0 {
						if endItem > 0 {
							argsWithoutCookies = append(argsWithoutCookies, "--playlist-items", fmt.Sprintf("%d-%d", startItem, endItem))
						} else {
							argsWithoutCookies = append(argsWithoutCookies, "--playlist-items", fmt.Sprintf("%d-", startItem))
						}
					}

					// Add proxy settings if enabled (but no cookies)
					if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
						argsWithoutCookies = append(argsWithoutCookies, "--proxy", a.settings.ProxyAddress)
					} else if a.settings.ProxyMode == "system" {
						argsWithoutCookies = append(argsWithoutCookies, "--proxy", "system")
					}

					// Add extractor args for YouTube
					argsWithoutCookies = append(argsWithoutCookies, "--extractor-args", "youtube:player-client=web,mobile,android,ios")

					cmdWithoutCookies := exec.Command(ytDlpPath, argsWithoutCookies...)
					setHideWindow(cmdWithoutCookies)

					// Store the retry download command
					downloadMutex.Lock()
					currentDownloadCmd = cmdWithoutCookies
					downloadMutex.Unlock()

					stdoutWithoutCookies, err := cmdWithoutCookies.StdoutPipe()
					if err != nil {
						wailsRuntime.LogErrorf(a.ctx, "Failed to create stdout pipe for retry: %v", err)
						return
					}

					if err := cmdWithoutCookies.Start(); err != nil {
						wailsRuntime.LogErrorf(a.ctx, "Failed to start retry download: %v", err)
						return
					}

					wailsRuntime.LogInfof(a.ctx, "Retry playlist download started without cookies")

					// Read progress from the retry command
					go func() {
						buffer := make([]byte, 1024)

						for {
							n, err := stdoutWithoutCookies.Read(buffer)
							if n > 0 {
								output := string(buffer[:n])

								// Log the raw output for debugging
								if strings.Contains(output, "[download]") {
									wailsRuntime.LogInfof(a.ctx, "Raw retry playlist download output: %s", output)
								}

								// Look for progress indicators in the output
								// More flexible pattern to handle various yt-dlp output formats
								re := regexp.MustCompile(`\[download\]\s+([0-9]{1,3}(?:\.[0-9]+)?)%\s+of\s+(~?[0-9.]+\s*[KMGT]?i?B)\s+at\s+([0-9.]+\s*[KMGT]?i?B/s|unknown)\s+ETA\s+([0-9:]+|unknown)`)
								matches := re.FindStringSubmatch(output)

								// If the main pattern doesn't match, try a more flexible one
								if len(matches) < 5 {
									reFlexible := regexp.MustCompile(`\[download\]\s+([0-9]{1,3}(?:\.[0-9]+)?)%.*?of\s+([0-9.]+\s*[KMGT]?i?B).*?at\s+([0-9.]+\s*[KMGT]?i?B/s).*?ETA\s+([0-9:]+)`)
									matches = reFlexible.FindStringSubmatch(output)
								}

								if len(matches) >= 5 {
									progress, convErr := strconv.ParseFloat(matches[1], 64)
									if convErr == nil && progress >= 0 && progress <= 100 {
										// Only emit progress if it's different from the previous value
										// Also prevent progress from going backwards
										progressTracker.mu.Lock()
										if int(progress) > progressTracker.maxProgress {
											progressTracker.maxProgress = int(progress)
										}
										if int(progress) != progressTracker.previousProgress && int(progress) >= progressTracker.maxProgress {
											progressTracker.previousProgress = int(progress)
											progressTracker.mu.Unlock()

											// Handle "unknown" values
											size := matches[2]
											speed := matches[3]
											eta := matches[4]

											if speed == "unknown" {
												speed = "Calculating..."
											}
											if eta == "unknown" {
												eta = "Calculating..."
											}

											wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
												"progress": int(progress),
												"size":     size,
												"speed":    speed,
												"eta":      eta,
											})
										} else {
											progressTracker.mu.Unlock()
										}
									}
								} else {
									reSimple := regexp.MustCompile(`\[download\][^0-9]*([0-9]{1,3})\.?[0-9]*%`)
									matchesSimple := reSimple.FindStringSubmatch(output)
									if len(matchesSimple) > 1 {
										progress, convErr := strconv.Atoi(matchesSimple[1])
										if convErr == nil && progress >= 0 && progress <= 100 {
											progressTracker.mu.Lock()
											if progress != progressTracker.previousProgress {
												progressTracker.previousProgress = progress
												progressTracker.mu.Unlock()
												wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
													"progress": progress,
													"size":     "Calculating...",
													"speed":    "Calculating...",
													"eta":      "Calculating...",
												})
											} else {
												progressTracker.mu.Unlock()
											}
										}
									}
								}

								if strings.Contains(output, "[download]") && strings.Contains(output, "100%") {
									progressTracker.mu.Lock()
									if progressTracker.previousProgress != 100 {
										progressTracker.previousProgress = 100
										progressTracker.mu.Unlock()
										wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
											"progress": 100,
										})
									} else {
										progressTracker.mu.Unlock()
									}
								}
							}

							if err == io.EOF {
								break
							}

							if err != nil {
								wailsRuntime.LogErrorf(a.ctx, "Error reading stdout (retry): %v", err)
								break
							}
						}

						waitErr := cmdWithoutCookies.Wait()
						// Clear the current download command
						downloadMutex.Lock()
						currentDownloadCmd = nil
						downloadMutex.Unlock()

						if waitErr != nil {
							wailsRuntime.LogErrorf(a.ctx, "Playlist download failed (retry): %v", waitErr)
							errorMsg := fmt.Sprintf("Playlist download failed (retry): %v", waitErr)
							a.logDetailedError("DownloadPlaylist", url, formatID, waitErr)
							wailsRuntime.EventsEmit(a.ctx, "download-error", errorMsg)
						} else {
							wailsRuntime.LogInfof(a.ctx, "Playlist download completed successfully (retry) for URL: %s, Format: %s", url, formatID)
							progressTracker.mu.Lock()
							if progressTracker.previousProgress != 100 {
								wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
									"progress": 100,
									"size":     "Complete",
									"speed":    "0",
									"eta":      "00:00",
								})
							}
							progressTracker.mu.Unlock()
							wailsRuntime.EventsEmit(a.ctx, "download-complete")
						}
					}()

					return
				}
			}

			if err == io.EOF {
				break
			}

			if err != nil {
				wailsRuntime.LogErrorf(a.ctx, "Error reading stderr: %v", err)
				break
			}
		}
	}()

	// Wait for the command to finish
	go func() {
		waitErr := cmd.Wait()
		// Clear the current download command
		downloadMutex.Lock()
		currentDownloadCmd = nil
		downloadMutex.Unlock()

		if waitErr != nil {
			wailsRuntime.LogErrorf(a.ctx, "Playlist download failed: %v", waitErr)
			a.logDetailedError("DownloadPlaylist", url, formatID, waitErr)
			wailsRuntime.EventsEmit(a.ctx, "download-error", fmt.Sprintf("Playlist download failed: %v", waitErr))
		} else {
			wailsRuntime.LogInfof(a.ctx, "Playlist download completed successfully for URL: %s, Format: %s", url, formatID)
			// Ensure we emit 100% progress when download completes
			progressTracker.mu.Lock()
			if progressTracker.previousProgress != 100 {
				wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
					"progress": 100,
					"size":     "Complete",
					"speed":    "0",
					"eta":      "00:00",
				})
			}
			progressTracker.mu.Unlock()
			wailsRuntime.EventsEmit(a.ctx, "download-complete")
		}
	}()

	return nil
}
