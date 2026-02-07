package main

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strconv"
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