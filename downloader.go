package main

import (
	"context"
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

// defaultDownloadDir stores the user-specified download path
var defaultDownloadDir string = "./downloads"

// Global variable to track the current download process
var (
	currentDownloadCmd  *exec.Cmd
	downloadMutex       sync.Mutex
	downloadCache       map[string]string // Cache for download paths
	downloadCancelChan  chan struct{}     // Channel for graceful cancellation
	completedDownloads  map[string]bool   // Track completed downloads to prevent duplicates
	completionEmitted   bool              // Track if completion event was already emitted
	completionEmittedMu sync.Mutex        // Mutex to protect completionEmitted
)

// Initialize download cache
func init() {
	downloadCache = make(map[string]string)
	completedDownloads = make(map[string]bool)
	completionEmitted = false
}

// emitDownloadEvent safely emits a download completion/error/cancelled event
// ensuring only one such event is emitted per download
func emitDownloadEvent(ctx context.Context, eventType string, data ...interface{}) {
	completionEmittedMu.Lock()
	defer completionEmittedMu.Unlock()

	if completionEmitted {
		return // Already emitted a completion event for this download
	}

	// Mark as emitted for all terminal events (complete, error, cancelled)
	if eventType == "download-complete" || eventType == "download-error" || eventType == "download-cancelled" {
		completionEmitted = true
	}

	if len(data) > 0 {
		wailsRuntime.EventsEmit(ctx, eventType, data[0])
	} else {
		wailsRuntime.EventsEmit(ctx, eventType)
	}
}

// downloadVideoInternal downloads a video using the selected format ID
func (a *App) downloadVideoInternal(url, formatID, outputPath string) error {
	ytDlpPath := filepath.Join("./bin", a.getYtDlpBinaryName())

	// Initialize cancel channel for this download
	downloadCancelChan = make(chan struct{})

	// Reset completion flag for this download
	completionEmitted = false

	// Build command arguments based on settings
	args := []string{url, "-f", formatID, "-o", outputPath, "--newline", "--progress"}

	// Add JS runtime if enabled or if it's a YouTube URL (which requires it)
	if a.settings.UseJSRuntime || a.isYouTubeURL(url) {
		if a.isDenoAvailable() {
			args = append(args, "--js-runtimes", "deno:"+filepath.Join("./bin", a.getDenoBinaryName()))
		} else {
			// If deno is not available but JS runtime is required, try to download it
			wailsRuntime.LogInfof(a.ctx, "Deno not found, attempting to download...")
			err := a.downloadDenoWithProgress()
			if err != nil {
				wailsRuntime.LogErrorf(a.ctx, "Failed to download deno: %v", err)
				// Continue without JS runtime
			} else {
				args = append(args, "--js-runtimes", "deno:"+filepath.Join("./bin", a.getDenoBinaryName()))
			}
		}
	}

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

	wailsRuntime.LogInfof(a.ctx, "Download started for URL: %s, Format: %s", url, formatID)

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

	// Pre-compiled regex patterns - UPDATED for Rutube compatibility
	// Pattern handles: [download]   1.2% of ~   1.11GiB at  699.38KiB/s ETA 28:37 (frag 8/664)
	// Key changes: ([~≈]?\s*[\d\.]+\s*...) allows spaces after tilde
	reProgressMain := regexp.MustCompile(`\[download\]\s+([\d\.]+)%\s+of\s+([~≈]?\s*[\d\.]+\s*[kKmMgGtTpP]?i?B).*?at\s+([\d\.]+\s*[kKmMgGtTpP]?i?B/s|unknown)\s+ETA\s+([\d:]+|unknown)`)
	reProgressSimple := regexp.MustCompile(`\[download\][^0-9]*([\d\.]+)\s*%`)

	// Read stdout and stderr in real-time to get progress and errors
	go func() {
		buffer := make([]byte, 1024)

		// UPDATED: Store last known values to avoid "Calculating..."
		// Initialize with dashes instead of "Calculating..."
		var (
			lastProgress float64 = 0
			lastSize     string  = "--"
			lastSpeed    string  = "--"
			lastEta      string  = "--"
			trackerMu    sync.Mutex
		)

		for {
			n, err := stdout.Read(buffer)
			if n > 0 {
				output := string(buffer[:n])

				// Log the raw output for debugging
				if strings.Contains(output, "[download]") {
					wailsRuntime.LogInfof(a.ctx, "Raw download output: %s", output)
				}

				// Try main regex first
				matches := reProgressMain.FindStringSubmatch(output)

				var currentProgress float64 = -1

				trackerMu.Lock()

				if len(matches) >= 5 {
					// Parse data
					p, errParse := strconv.ParseFloat(matches[1], 64)
					if errParse == nil {
						currentProgress = p

						// Update metadata only if valid
						if matches[2] != "unknown" {
							// Clean up extra spaces in size
							lastSize = strings.Join(strings.Fields(matches[2]), " ")
						}
						if matches[3] != "unknown" {
							lastSpeed = matches[3]
						}
						if matches[4] != "unknown" {
							lastEta = matches[4]
						}
					}
				} else {
					// Fallback: try to find at least percentage
					matchesSimple := reProgressSimple.FindStringSubmatch(output)
					if len(matchesSimple) > 1 {
						p, errParse := strconv.ParseFloat(matchesSimple[1], 64)
						if errParse == nil {
							currentProgress = p
						}
					}
				}

				// UI UPDATE LOGIC
				if currentProgress >= 0 {
					// PROTECTION FROM BACKWARD JUMPS (70% -> 68%)
					// If new progress is less than previous, use old value

					// Exception: if we started new download (progress < 1), reset
					if currentProgress < 1 && lastProgress > 90 {
						lastProgress = 0
					}

					if currentProgress < lastProgress {
						// Progress dropped - use old visually
						currentProgress = lastProgress
					} else {
						lastProgress = currentProgress
					}

					// Emit event with last known data
					progressTracker.mu.Lock()
					if int(lastProgress) != progressTracker.previousProgress {
						progressTracker.previousProgress = int(lastProgress)
						progressTracker.mu.Unlock()

						wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
							"progress": int(lastProgress),
							"size":     lastSize,
							"speed":    lastSpeed,
							"eta":      lastEta,
						})
					} else {
						progressTracker.mu.Unlock()
					}
				}

				// Check for 100%
				if strings.Contains(output, "100%") && currentProgress >= 99.9 {
					if lastProgress < 100 {
						lastProgress = 100
						wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
							"progress": 100,
							"size":     lastSize,
							"speed":    "Done",
							"eta":      "00:00",
						})
					}
				}
				trackerMu.Unlock()
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

					wailsRuntime.LogInfof(a.ctx, "Cookies-related error detected during download: %s", stderrStr)

					// Kill the current process and try without cookies
					if cmd.Process != nil {
						wailsRuntime.LogInfof(a.ctx, "Killing current download process due to cookies error")
						cmd.Process.Kill()
					}

					// Clear the current download command
					downloadMutex.Lock()
					currentDownloadCmd = nil
					downloadMutex.Unlock()

					// Try downloading without cookies
					argsWithoutCookies := []string{url, "-f", formatID, "-o", outputPath, "--newline", "--progress"}

					// Add proxy settings if enabled (but no cookies)
					if a.settings.ProxyMode == "manual" && a.settings.ProxyAddress != "" {
						argsWithoutCookies = append(argsWithoutCookies, "--proxy", a.settings.ProxyAddress)
					} else if a.settings.ProxyMode == "system" {
						argsWithoutCookies = append(argsWithoutCookies, "--proxy", "system")
					}

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

					wailsRuntime.LogInfof(a.ctx, "Retry download started without cookies")

					// Read progress from the retry command
					go func() {
						buffer := make([]byte, 1024)

						// UPDATED: Variables for storing last known values in Retry block
						var (
							lastProgress float64 = 0
							lastSize     string  = "--"
							lastSpeed    string  = "--"
							lastEta      string  = "--"
							retryMu      sync.Mutex
						)

						for {
							n, err := stdoutWithoutCookies.Read(buffer)
							if n > 0 {
								output := string(buffer[:n])

								// Log the raw output for debugging
								if strings.Contains(output, "[download]") {
									wailsRuntime.LogInfof(a.ctx, "Raw retry download output: %s", output)
								}

								// Use the same updated regex for retry
								matches := reProgressMain.FindStringSubmatch(output)

								var currentProgress float64 = -1

								retryMu.Lock()

								if len(matches) >= 5 {
									// Parse data
									p, errParse := strconv.ParseFloat(matches[1], 64)
									if errParse == nil {
										currentProgress = p

										// Update metadata only if valid
										if matches[2] != "unknown" {
											lastSize = strings.Join(strings.Fields(matches[2]), " ")
										}
										if matches[3] != "unknown" {
											lastSpeed = matches[3]
										}
										if matches[4] != "unknown" {
											lastEta = matches[4]
										}
									}
								} else {
									// Fallback: try to find at least percentage
									matchesSimple := reProgressSimple.FindStringSubmatch(output)
									if len(matchesSimple) > 1 {
										p, errParse := strconv.ParseFloat(matchesSimple[1], 64)
										if errParse == nil {
											currentProgress = p
										}
									}
								}

								// UI UPDATE LOGIC with protection from backward jumps
								if currentProgress >= 0 {
									// Exception: if we started new download (progress < 1), reset
									if currentProgress < 1 && lastProgress > 90 {
										lastProgress = 0
									}

									if currentProgress < lastProgress {
										currentProgress = lastProgress
									} else {
										lastProgress = currentProgress
									}

									progressTracker.mu.Lock()
									if int(lastProgress) != progressTracker.previousProgress {
										progressTracker.previousProgress = int(lastProgress)
										progressTracker.mu.Unlock()

										wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
											"progress": int(lastProgress),
											"size":     lastSize,
											"speed":    lastSpeed,
											"eta":      lastEta,
										})
									} else {
										progressTracker.mu.Unlock()
									}
								}

								// Check for 100%
								if strings.Contains(output, "100%") && currentProgress >= 99.9 {
									if lastProgress < 100 {
										lastProgress = 100
										wailsRuntime.EventsEmit(a.ctx, "download-progress", map[string]interface{}{
											"progress": 100,
											"size":     lastSize,
											"speed":    "Done",
											"eta":      "00:00",
										})
									}
								}
								retryMu.Unlock()
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
							wailsRuntime.LogErrorf(a.ctx, "Download failed (retry): %v", waitErr)
							errorMsg := fmt.Sprintf("Download failed (retry): %v", waitErr)
							a.logDetailedError("DownloadVideo", url, formatID, waitErr)
							emitDownloadEvent(a.ctx, "download-error", errorMsg)
						} else {
							wailsRuntime.LogInfof(a.ctx, "Download completed successfully (retry) for URL: %s, Format: %s", url, formatID)

							// Wait longer for yt-dlp to finish all operations
							time.Sleep(2 * time.Second)

							// Check if download is actually complete (no .part files)
							outputPathWithoutExt := strings.TrimSuffix(outputPath, ".%(ext)s")
							sanitizedTitle := filepath.Base(outputPathWithoutExt)

							// Check for .part files (including fragment files)
							downloadsDir := a.getDownloadDirectoryInternal()
							partExtensions := []string{".mp4.part", ".webm.part", ".mkv.part", ".avi.part", ".mov.part", ".flv.part", ".m4v.part"}
							hasPartFile := false

							for _, ext := range partExtensions {
								partPath := filepath.Join(downloadsDir, sanitizedTitle+ext)
								if _, err := os.Stat(partPath); err == nil {
									hasPartFile = true
									wailsRuntime.LogWarningf(a.ctx, "Found .part file after retry download completion: %s", partPath)
									break
								}

								// Check for fragment files (e.g., .part-Frag21.part)
								fragmentPattern := filepath.Join(downloadsDir, sanitizedTitle+ext+"-*")
								if matches, _ := filepath.Glob(fragmentPattern); len(matches) > 0 {
									hasPartFile = true
									wailsRuntime.LogWarningf(a.ctx, "Found fragment files after retry download completion: %v", matches)
									break
								}
							}

							// Check for .ytdl files
							ytdlPath := filepath.Join(downloadsDir, sanitizedTitle+".ytdl")
							hasYtdlFile := false
							if _, err := os.Stat(ytdlPath); err == nil {
								hasYtdlFile = true
								wailsRuntime.LogWarningf(a.ctx, "Found .ytdl file after retry download completion: %s", ytdlPath)
							}

							// Additional check: try to find the actual completed file
							completedFileFound := false
							extensions := []string{".mp4", ".webm", ".mkv", ".avi", ".mov", ".flv", ".m4v"}

							for _, ext := range extensions {
								potentialPath := filepath.Join(downloadsDir, sanitizedTitle+ext)
								if fileInfo, err := os.Stat(potentialPath); err == nil {
									// Check if file is not empty and was modified recently (indicating it's complete)
									if fileInfo.Size() > 0 && time.Since(fileInfo.ModTime()) < 10*time.Second {
										completedFileFound = true
										wailsRuntime.LogInfof(a.ctx, "Found completed file: %s (size: %d bytes)", potentialPath, fileInfo.Size())
										break
									}
								}
							}

							// Only emit download-complete if no .part or .ytdl files exist AND we found a completed file
							if !hasPartFile && !hasYtdlFile && completedFileFound {
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
								emitDownloadEvent(a.ctx, "download-complete")
							} else if hasPartFile || hasYtdlFile {
								// Download is incomplete, emit error
								wailsRuntime.LogErrorf(a.ctx, "Download incomplete (retry): .part or .ytdl files still present")
								emitDownloadEvent(a.ctx, "download-error", "Download incomplete: File is still being processed")
							} else {
								// No completed file found, wait a bit more and retry
								wailsRuntime.LogWarningf(a.ctx, "No completed file found after retry download, waiting additional time...")
								time.Sleep(3 * time.Second)

								// Retry check for completed file
								for _, ext := range extensions {
									potentialPath := filepath.Join(downloadsDir, sanitizedTitle+ext)
									if fileInfo, err := os.Stat(potentialPath); err == nil && fileInfo.Size() > 0 {
										completedFileFound = true
										wailsRuntime.LogInfof(a.ctx, "Found completed file on retry: %s (size: %d bytes)", potentialPath, fileInfo.Size())
										break
									}
								}

								if completedFileFound {
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
									emitDownloadEvent(a.ctx, "download-complete")
								} else {
									wailsRuntime.LogErrorf(a.ctx, "Download failed (retry): No completed file found after extended wait")
									emitDownloadEvent(a.ctx, "download-error", "Download failed: No completed file found")
								}
							}
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
			wailsRuntime.LogErrorf(a.ctx, "Download failed: %v", waitErr)
			a.logDetailedError("DownloadVideo", url, formatID, waitErr)
			emitDownloadEvent(a.ctx, "download-error", fmt.Sprintf("Download failed: %v", waitErr))
		} else {
			wailsRuntime.LogInfof(a.ctx, "Download completed successfully for URL: %s, Format: %s", url, formatID)

			// Wait longer for yt-dlp to finish all operations (renaming, merging, etc.)
			time.Sleep(2 * time.Second)

			// Check if the download is actually complete (no .part files)
			// Extract title from outputPath for checking
			outputPathWithoutExt := strings.TrimSuffix(outputPath, ".%(ext)s")
			sanitizedTitle := filepath.Base(outputPathWithoutExt)

			// Check for .part files (including fragment files)
			downloadsDir := a.getDownloadDirectoryInternal()
			partExtensions := []string{".mp4.part", ".webm.part", ".mkv.part", ".avi.part", ".mov.part", ".flv.part", ".m4v.part"}
			hasPartFile := false

			for _, ext := range partExtensions {
				partPath := filepath.Join(downloadsDir, sanitizedTitle+ext)
				if _, err := os.Stat(partPath); err == nil {
					hasPartFile = true
					wailsRuntime.LogWarningf(a.ctx, "Found .part file after download completion: %s", partPath)
					break
				}

				// Check for fragment files (e.g., .part-Frag21.part)
				fragmentPattern := filepath.Join(downloadsDir, sanitizedTitle+ext+"-*")
				if matches, _ := filepath.Glob(fragmentPattern); len(matches) > 0 {
					hasPartFile = true
					wailsRuntime.LogWarningf(a.ctx, "Found fragment files after download completion: %v", matches)
					break
				}
			}

			// Check for .ytdl files
			ytdlPath := filepath.Join(downloadsDir, sanitizedTitle+".ytdl")
			hasYtdlFile := false
			if _, err := os.Stat(ytdlPath); err == nil {
				hasYtdlFile = true
				wailsRuntime.LogWarningf(a.ctx, "Found .ytdl file after download completion: %s", ytdlPath)
			}

			// Additional check: try to find the actual completed file
			completedFileFound := false
			extensions := []string{".mp4", ".webm", ".mkv", ".avi", ".mov", ".flv", ".m4v"}

			for _, ext := range extensions {
				potentialPath := filepath.Join(downloadsDir, sanitizedTitle+ext)
				if fileInfo, err := os.Stat(potentialPath); err == nil {
					// Check if file is not empty and was modified recently (indicating it's complete)
					if fileInfo.Size() > 0 && time.Since(fileInfo.ModTime()) < 10*time.Second {
						completedFileFound = true
						wailsRuntime.LogInfof(a.ctx, "Found completed file: %s (size: %d bytes)", potentialPath, fileInfo.Size())
						break
					}
				}
			}

			// Only emit download-complete if no .part or .ytdl files exist AND we found a completed file
			if !hasPartFile && !hasYtdlFile && completedFileFound {
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
				emitDownloadEvent(a.ctx, "download-complete")
			} else if hasPartFile || hasYtdlFile {
				// Download is incomplete, emit error
				wailsRuntime.LogErrorf(a.ctx, "Download incomplete: .part or .ytdl files still present")
				emitDownloadEvent(a.ctx, "download-error", "Download incomplete: File is still being processed")
			} else {
				// No completed file found, wait a bit more and retry
				wailsRuntime.LogWarningf(a.ctx, "No completed file found after download, waiting additional time...")
				time.Sleep(3 * time.Second)

				// Retry check for completed file
				for _, ext := range extensions {
					potentialPath := filepath.Join(downloadsDir, sanitizedTitle+ext)
					if fileInfo, err := os.Stat(potentialPath); err == nil && fileInfo.Size() > 0 {
						completedFileFound = true
						wailsRuntime.LogInfof(a.ctx, "Found completed file on retry: %s (size: %d bytes)", potentialPath, fileInfo.Size())
						break
					}
				}

				if completedFileFound {
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
					emitDownloadEvent(a.ctx, "download-complete")
				} else {
					wailsRuntime.LogErrorf(a.ctx, "Download failed: No completed file found after extended wait")
					emitDownloadEvent(a.ctx, "download-error", "Download failed: No completed file found")
				}
			}
		}
	}()

	return nil
}

// cancelDownloadInternal cancels the current download gracefully
func (a *App) cancelDownloadInternal() error {
	downloadMutex.Lock()

	if currentDownloadCmd != nil {
		// Signal cancellation through channel first
		if downloadCancelChan != nil {
			close(downloadCancelChan)
			downloadCancelChan = nil
		}

		// Then try to kill the process if it's still running
		if currentDownloadCmd.Process != nil {
			wailsRuntime.LogInfof(a.ctx, "Cancelling download...")
			err := currentDownloadCmd.Process.Kill()
			if err != nil {
				wailsRuntime.LogErrorf(a.ctx, "Failed to cancel download: %v", err)
				downloadMutex.Unlock()
				return fmt.Errorf("failed to cancel download: %w", err)
			}
		}
		currentDownloadCmd = nil
		wailsRuntime.LogInfof(a.ctx, "Download cancelled successfully")
		emitDownloadEvent(a.ctx, "download-cancelled")
		downloadMutex.Unlock()
		return nil
	}

	downloadMutex.Unlock()
	wailsRuntime.LogInfof(a.ctx, "No active download to cancel")
	return fmt.Errorf("no active download to cancel")
}

// getDownloadPathInternal returns a suggested download path
func (a *App) getDownloadPathInternal(title string) string {
	// Check cache first
	if cachedPath, exists := downloadCache[title]; exists {
		return cachedPath
	}

	// Sanitize title for filename
	sanitizedTitle := strings.ReplaceAll(title, " ", "_")
	sanitizedTitle = strings.ReplaceAll(sanitizedTitle, "/", "_")
	sanitizedTitle = strings.ReplaceAll(sanitizedTitle, "\\", "_")
	sanitizedTitle = strings.ReplaceAll(sanitizedTitle, ":", "_")
	sanitizedTitle = strings.ReplaceAll(sanitizedTitle, "*", "_")
	sanitizedTitle = strings.ReplaceAll(sanitizedTitle, "?", "_")
	sanitizedTitle = strings.ReplaceAll(sanitizedTitle, "\"", "_")
	sanitizedTitle = strings.ReplaceAll(sanitizedTitle, "<", "_")
	sanitizedTitle = strings.ReplaceAll(sanitizedTitle, ">", "_")
	sanitizedTitle = strings.ReplaceAll(sanitizedTitle, "|", "_")

	// Create downloads directory if it doesn't exist
	os.MkdirAll(defaultDownloadDir, 0755)

	path := filepath.Join(defaultDownloadDir, sanitizedTitle+".%(ext)s")

	// Cache the path
	downloadCache[title] = path

	return path
}

// selectDownloadDirectoryInternal opens a dialog to select the download directory
func (a *App) selectDownloadDirectoryInternal() (string, error) {
	selectedPath, err := wailsRuntime.OpenDirectoryDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Select Download Directory",
	})
	if err != nil {
		return "", fmt.Errorf("failed to open directory dialog: %w", err)
	}

	if selectedPath == "" {
		return "", fmt.Errorf("no directory selected")
	}

	// Update the default download directory
	defaultDownloadDir = selectedPath
	wailsRuntime.LogInfof(a.ctx, "Download directory changed to: %s", selectedPath)

	return selectedPath, nil
}

// getDownloadDirectoryInternal returns the current download directory
func (a *App) getDownloadDirectoryInternal() string {
	return defaultDownloadDir
}

// setDownloadDirectoryInternal sets the download directory programmatically
func (a *App) setDownloadDirectoryInternal(path string) error {
	if path == "" {
		return fmt.Errorf("path cannot be empty")
	}

	// Check if the directory exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		// Try to create it
		if err := os.MkdirAll(path, 0755); err != nil {
			return fmt.Errorf("failed to create directory: %w", err)
		}
	}

	defaultDownloadDir = path
	wailsRuntime.LogInfof(a.ctx, "Download directory set to: %s", path)
	return nil
}
