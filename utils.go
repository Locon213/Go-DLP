package main

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// formatFileSizeHuman converts bytes to a human-readable format (e.g., MB, GB)
func formatFileSizeHuman(bytes float64) string {
	const (
		KB = 1024
		MB = KB * 1024
		GB = MB * 1024
		TB = GB * 1024
	)

	switch {
	case bytes >= TB:
		return fmt.Sprintf("%.2f TB", bytes/TB)
	case bytes >= GB:
		return fmt.Sprintf("%.2f GB", bytes/GB)
	case bytes >= MB:
		return fmt.Sprintf("%.2f MB", bytes/MB)
	case bytes >= KB:
		return fmt.Sprintf("%.2f KB", bytes/KB)
	default:
		return fmt.Sprintf("%.2f B", bytes)
	}
}

// logError writes error messages to a log file
func (a *App) logError(message string) {
	logFile := "./error.log"

	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to open log file: %v", err)
		return
	}
	defer file.Close()

	timestamp := time.Now().Format("2006-01-02 15:04:05")
	_, err = file.WriteString(fmt.Sprintf("[%s] %s\n", timestamp, message))
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to write to log file: %v", err)
	}
}

// logDetailedError writes detailed error messages with context to a log file
func (a *App) logDetailedError(operation string, url string, formatID string, err error) {
	logFile := "./error.log"

	file, fileErr := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if fileErr != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to open log file: %v", fileErr)
		return
	}
	defer file.Close()

	timestamp := time.Now().Format("2006-01-02 15:04:05")

	var details string
	if url != "" {
		details += fmt.Sprintf(" URL: %s", url)
	}
	if formatID != "" {
		details += fmt.Sprintf(" Format: %s", formatID)
	}

	logMessage := fmt.Sprintf("[%s] Operation: %s%s, Error: %v", timestamp, operation, details, err)

	_, writeErr := file.WriteString(logMessage + "\n")
	if writeErr != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to write to log file: %v", writeErr)
	}
}

// getYtDlpBinaryName returns the appropriate binary name based on OS
func (a *App) getYtDlpBinaryName() string {
	switch runtime.GOOS {
	case "windows":
		return "yt-dlp.exe"
	case "darwin":
		return "yt-dlp_macos"
	default:
		return "yt-dlp_linux"
	}
}

// getFfmpegBinaryName returns the appropriate ffmpeg binary name based on OS
func (a *App) getFfmpegBinaryName() string {
	switch runtime.GOOS {
	case "windows":
		return "ffmpeg.exe"
	default:
		return "ffmpeg"
	}
}

// isCommandAvailable checks if a command is available in the system
func (a *App) isCommandAvailable(name string) bool {
	// First try to run the command with --version
	cmd := exec.Command(name, "--version")
	err := cmd.Run()
	if err == nil {
		return true
	}

	// On Windows, sometimes the command might not support --version
	// So we try to run just the command name
	cmd = exec.Command(name)
	err = cmd.Run()
	return err == nil || err.Error() != fmt.Sprintf("exec: %q: executable file not found in %s", name, os.Getenv("PATH"))
}

// formatDuration formats duration in seconds to HH:MM:SS format
func formatDuration(seconds float64) string {
	hours := int(seconds) / 3600
	minutes := int(seconds) % 3600 / 60
	secs := int(seconds) % 60

	if hours > 0 {
		return fmt.Sprintf("%d:%02d:%02d", hours, minutes, secs)
	}
	return fmt.Sprintf("%d:%02d", minutes, secs)
}

// formatFileSize formats file size in bytes to a human-readable format
func formatFileSize(bytes interface{}) string {
	var size float64

	switch v := bytes.(type) {
	case float64:
		size = v
	case int64:
		size = float64(v)
	case int:
		size = float64(v)
	case string:
		if v == "" {
			return "Unknown"
		}
		// Handle strings like "~ 80.69MiB" or "80.69MiB"
		// These are already human-readable, return as-is
		if strings.Contains(v, "iB") || strings.Contains(v, "B") {
			// Check if it's a human-readable format like "~ 80.69MiB"
			if strings.ContainsAny(v, "KMGT") {
				return v
			}
		}
		parsed, err := strconv.ParseFloat(v, 64)
		if err != nil {
			return "Unknown"
		}
		size = parsed
	default:
		return "Unknown"
	}

	if size <= 0 {
		return "Unknown"
	}

	const (
		KB = 1024.0
		MB = KB * 1024.0
		GB = MB * 1024.0
		TB = GB * 1024.0
	)

	switch {
	case size >= TB:
		return fmt.Sprintf("%.2f TB", size/TB)
	case size >= GB:
		return fmt.Sprintf("%.2f GB", size/GB)
	case size >= MB:
		return fmt.Sprintf("%.2f MB", size/MB)
	case size >= KB:
		return fmt.Sprintf("%.2f KB", size/KB)
	default:
		return fmt.Sprintf("%.2f B", size)
	}
}

// getDenoBinaryName returns the appropriate deno binary name based on OS
func (a *App) getDenoBinaryName() string {
	switch runtime.GOOS {
	case "windows":
		return "deno.exe"
	default:
		return "deno"
	}
}

// isDenoAvailable checks if deno is available in the bin directory
func (a *App) isDenoAvailable() bool {
	binDir := "./bin"
	denoPath := filepath.Join(binDir, a.getDenoBinaryName())

	// Check if deno binary exists in bin directory
	if _, err := os.Stat(denoPath); os.IsNotExist(err) {
		return false
	}

	// Try to run deno --version to make sure it's functional
	cmd := exec.Command(denoPath, "--version")
	err := cmd.Run()
	return err == nil
}

// getDenoDownloadURL returns the appropriate download URL for deno based on OS and architecture
// Supported platforms: windows amd64, linux amd64, darwin arm64, darwin amd64
func (a *App) getDenoDownloadURL() string {
	// Determine OS and architecture
	goos := runtime.GOOS
	arch := runtime.GOARCH

	// Map to deno's release filename format
	// Format: deno-{arch}-{os}.{extension}
	var filename string

	switch goos {
	case "windows":
		// Windows only supports amd64 (x86_64)
		filename = "deno-x86_64-pc-windows-msvc.zip"
	case "darwin":
		// macOS supports both arm64 (aarch64) and amd64 (x86_64)
		if arch == "arm64" {
			filename = "deno-aarch64-apple-darwin.zip"
		} else {
			filename = "deno-x86_64-apple-darwin.zip"
		}
	case "linux":
		// Linux only supports amd64 (x86_64)
		filename = "deno-x86_64-unknown-linux-gnu.zip"
	default:
		// Fallback for unsupported OS
		filename = fmt.Sprintf("deno-%s-%s.zip", arch, goos)
	}

	// Return the GitHub release URL (using the latest release)
	return fmt.Sprintf("https://github.com/denoland/deno/releases/latest/download/%s", filename)
}

// downloadDeno downloads deno from GitHub and extracts it to the bin directory
func (a *App) downloadDeno() error {
	downloadURL := a.getDenoDownloadURL()
	binDir := "./bin"

	// Create bin directory if it doesn't exist
	if err := os.MkdirAll(binDir, 0755); err != nil {
		return fmt.Errorf("failed to create bin directory: %w", err)
	}

	// Download the zip file
	resp, err := http.Get(downloadURL)
	if err != nil {
		return fmt.Errorf("failed to download deno: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to download deno: status code %d", resp.StatusCode)
	}

	// Create temporary file for the zip
	tempZipFile, err := os.CreateTemp("", "deno-*.zip")
	if err != nil {
		return fmt.Errorf("failed to create temporary file: %w", err)
	}
	defer os.Remove(tempZipFile.Name()) // Clean up the temp file
	defer tempZipFile.Close()

	// Copy the response body to the temp file
	_, err = io.Copy(tempZipFile, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to save downloaded file: %w", err)
	}

	// Extract the zip file to bin directory
	err = a.extractDenoZip(tempZipFile.Name(), binDir)
	if err != nil {
		return fmt.Errorf("failed to extract deno: %w", err)
	}

	return nil
}

// isYouTubeURL checks if the given URL is a YouTube URL
func (a *App) isYouTubeURL(url string) bool {
	// Check if URL contains youtube.com or youtu.be
	return strings.Contains(url, "youtube.com") || strings.Contains(url, "youtu.be")
}

// extractDenoZip extracts the deno binary from the zip file to the destination directory
func (a *App) extractDenoZip(zipPath, destDir string) error {
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return fmt.Errorf("failed to open zip file: %w", err)
	}
	defer reader.Close()

	for _, file := range reader.File {
		// Only extract the deno binary
		if strings.EqualFold(filepath.Base(file.Name), "deno") || strings.EqualFold(filepath.Base(file.Name), "deno.exe") {
			rc, err := file.Open()
			if err != nil {
				return fmt.Errorf("failed to open file in zip: %w", err)
			}
			defer rc.Close()

			destPath := filepath.Join(destDir, a.getDenoBinaryName())

			// Create the destination file
			outFile, err := os.OpenFile(destPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0755)
			if err != nil {
				return fmt.Errorf("failed to create output file: %w", err)
			}
			defer outFile.Close()

			// Copy the file contents
			_, err = io.Copy(outFile, rc)
			if err != nil {
				return fmt.Errorf("failed to copy file: %w", err)
			}

			// On Unix systems, make sure the file is executable
			if runtime.GOOS != "windows" {
				err = os.Chmod(destPath, 0755)
				if err != nil {
					return fmt.Errorf("failed to make file executable: %w", err)
				}
			}

			break // We only need the deno binary
		}
	}

	return nil
}

// downloadDenoWithProgress downloads deno from GitHub with progress reporting
func (a *App) downloadDenoWithProgress() error {
	downloadURL := a.getDenoDownloadURL()
	binDir := "./bin"

	// Create bin directory if it doesn't exist
	if err := os.MkdirAll(binDir, 0755); err != nil {
		return fmt.Errorf("failed to create bin directory: %w", err)
	}

	// Emit start event
	wailsRuntime.EventsEmit(a.ctx, "deno-download-start", nil)

	// Create HTTP request
	req, err := http.NewRequest("GET", downloadURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to download deno: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to download deno: status code %d", resp.StatusCode)
	}

	// Get the total size
	totalSize := resp.ContentLength

	// Create temporary file for the zip
	tempZipFile, err := os.CreateTemp("", "deno-*.zip")
	if err != nil {
		return fmt.Errorf("failed to create temporary file: %w", err)
	}
	defer os.Remove(tempZipFile.Name()) // Clean up the temp file
	defer tempZipFile.Close()

	// Copy with progress reporting
	var downloaded int64
	buf := make([]byte, 32*1024) // 32KB buffer

	for {
		n, err := resp.Body.Read(buf)
		if n > 0 {
			_, writeErr := tempZipFile.Write(buf[:n])
			if writeErr != nil {
				wailsRuntime.EventsEmit(a.ctx, "deno-download-error", writeErr.Error())
				return fmt.Errorf("failed to write to temp file: %w", writeErr)
			}

			downloaded += int64(n)

			// Calculate progress percentage
			if totalSize > 0 {
				progress := int((downloaded * 100) / totalSize)

				// Emit progress event to the frontend
				wailsRuntime.EventsEmit(a.ctx, "deno-download-progress", map[string]interface{}{
					"progress":   progress,
					"downloaded": downloaded,
					"total":      totalSize,
				})
			}
		}

		if err == io.EOF {
			break
		}

		if err != nil {
			wailsRuntime.EventsEmit(a.ctx, "deno-download-error", err.Error())
			return fmt.Errorf("error during download: %w", err)
		}
	}

	// Emit extraction start event
	wailsRuntime.EventsEmit(a.ctx, "deno-download-progress", map[string]interface{}{
		"progress":   100,
		"downloaded": downloaded,
		"total":      totalSize,
		"status":     "extracting",
	})

	// Extract the zip file to bin directory
	err = a.extractDenoZip(tempZipFile.Name(), binDir)
	if err != nil {
		wailsRuntime.EventsEmit(a.ctx, "deno-download-error", err.Error())
		return fmt.Errorf("failed to extract deno: %w", err)
	}

	// Emit completion event
	wailsRuntime.EventsEmit(a.ctx, "deno-download-complete", nil)

	return nil
}

// getDenoVersion returns the current version of deno
func (a *App) getDenoVersion() (string, error) {
	denoPath := filepath.Join("./bin", a.getDenoBinaryName())

	// Check if deno exists
	if _, err := os.Stat(denoPath); os.IsNotExist(err) {
		return "", fmt.Errorf("deno not found")
	}

	// Run deno --version
	cmd := exec.Command(denoPath, "--version")
	setHideWindow(cmd)

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to get deno version: %w", err)
	}

	// Parse version from output (format: "deno X.X.X\n...")
	lines := strings.Split(string(output), "\n")
	if len(lines) > 0 {
		parts := strings.Fields(lines[0])
		if len(parts) >= 2 {
			return parts[1], nil
		}
	}

	return strings.TrimSpace(string(output)), nil
}

// getLatestDenoVersion returns the latest version of deno from GitHub API
func (a *App) getLatestDenoVersion() (string, error) {
	// GitHub API endpoint for latest release
	resp, err := http.Get("https://api.github.com/repos/denoland/deno/releases/latest")
	if err != nil {
		return "", fmt.Errorf("failed to fetch latest version: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("GitHub API returned status: %d", resp.StatusCode)
	}

	// Parse JSON response
	var release struct {
		TagName string `json:"tag_name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	// Remove 'v' prefix if present
	version := release.TagName
	if strings.HasPrefix(version, "v") {
		version = version[1:]
	}

	return version, nil
}

// installDeno downloads and installs deno
func (a *App) installDeno() error {
	return a.downloadDenoWithProgress()
}

// updateDeno updates deno to the latest version
func (a *App) updateDeno() error {
	denoPath := filepath.Join("./bin", a.getDenoBinaryName())

	// Check if deno exists
	if _, err := os.Stat(denoPath); os.IsNotExist(err) {
		return fmt.Errorf("deno not found, please install first")
	}

	wailsRuntime.LogInfo(a.ctx, "Starting deno update...")

	// Download the latest version
	err := a.downloadDenoWithProgress()
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to update deno: %v", err)
		return fmt.Errorf("failed to update deno: %w", err)
	}

	wailsRuntime.LogInfo(a.ctx, "Deno updated successfully")
	return nil
}
