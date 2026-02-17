package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// Global variable to track the current conversion process
var (
	currentConvertCmd *exec.Cmd
	convertMutex      sync.Mutex
)

// convertVideoInternal converts a video file to a different format using FFmpeg
func (a *App) convertVideoInternal(sourcePath, targetFormat string) error {
	// Check if source file exists
	if _, err := os.Stat(sourcePath); os.IsNotExist(err) {
		return fmt.Errorf("source file does not exist: %s", sourcePath)
	}

	// Get the directory and filename without extension
	dir := filepath.Dir(sourcePath)
	filename := filepath.Base(sourcePath)
	ext := filepath.Ext(filename)
	nameWithoutExt := strings.TrimSuffix(filename, ext)

	// Create target path
	targetPath := filepath.Join(dir, nameWithoutExt+"."+targetFormat)

	// Check if FFmpeg is available
	ffmpegPath := filepath.Join("./bin", "ffmpeg"+getExecutableExtension())
	if _, err := os.Stat(ffmpegPath); os.IsNotExist(err) {
		// Try to use system FFmpeg
		ffmpegPath = "ffmpeg"
	}

	// Check if this is an audio-only format
	audioOnlyFormats := map[string]bool{
		"mp3":  true,
		"m4a":  true,
		"opus": true,
		"wav":  true,
		"flac": true,
		"aac":  true,
		"ogg":  true,
	}

	isAudioOnly := audioOnlyFormats[targetFormat]

	// Build FFmpeg command arguments
	var args []string

	if isAudioOnly {
		// Audio-only conversion with metadata preservation
		args = []string{
			"-i", sourcePath,
			"-vn", // No video
			"-map_metadata", "0", // Preserve all metadata
			"-y", // Overwrite output file if it exists
		}

		// Add format-specific audio codec settings
		switch targetFormat {
		case "mp3":
			args = append(args,
				"-c:a", "libmp3lame",
				"-b:a", "320k",
				"-q:a", "2",
			)
		case "m4a":
			args = append(args,
				"-c:a", "aac",
				"-b:a", "256k",
				"-movflags", "+faststart",
			)
		case "opus":
			args = append(args,
				"-c:a", "libopus",
				"-b:a", "256k",
			)
		case "wav":
			args = append(args,
				"-c:a", "pcm_s16le",
				"-ar", "44100",
			)
		case "flac":
			args = append(args,
				"-c:a", "flac",
				"-compression_level", "12",
			)
		case "aac":
			args = append(args,
				"-c:a", "aac",
				"-b:a", "256k",
			)
		case "ogg":
			args = append(args,
				"-c:a", "libvorbis",
				"-b:a", "320k",
			)
		}

		args = append(args, targetPath)
	} else {
		// Video conversion
		args = []string{
			"-i", sourcePath,
			"-c:v", "libx264",
			"-preset", "medium",
			"-crf", "23",
			"-c:a", "aac",
			"-b:a", "128k",
			"-movflags", "+faststart",
			"-map_metadata", "0", // Preserve metadata
			"-y", // Overwrite output file if it exists
			targetPath,
		}
	}

	// Hide console window on Windows
	cmd := exec.Command(ffmpegPath, args...)
	setHideWindow(cmd)

	// Store the current conversion command for cancellation
	convertMutex.Lock()
	currentConvertCmd = cmd
	convertMutex.Unlock()

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start conversion: %w", err)
	}

	wailsRuntime.LogInfof(a.ctx, "Conversion started: %s -> %s", sourcePath, targetPath)

	// Read stderr to get progress information
	go func() {
		buffer := make([]byte, 4096)
		var duration float64
		var currentTime float64

		for {
			n, err := stderr.Read(buffer)
			if n > 0 {
				output := string(buffer[:n])

				// Parse duration from FFmpeg output
				// Duration: 00:02:30.45, start: 0.000000, bitrate: 1500 kb/s
				if strings.Contains(output, "Duration:") {
					parts := strings.Split(output, "Duration:")
					if len(parts) > 1 {
						durationStr := strings.TrimSpace(strings.Split(parts[1], ",")[0])
						duration = parseFFmpegTime(durationStr)
					}
				}

				// Parse current time from FFmpeg output
				// frame=  123 fps= 30 q=28.0 size=    1234kB time=00:01:15.23 bitrate=1234.5kbits/s speed=1.2x
				if strings.Contains(output, "time=") {
					parts := strings.Split(output, "time=")
					if len(parts) > 1 {
						timeStr := strings.TrimSpace(strings.Split(parts[1], " ")[0])
						currentTime = parseFFmpegTime(timeStr)

						// Calculate progress
						if duration > 0 {
							progress := (currentTime / duration) * 100
							if progress > 100 {
								progress = 100
							}
							wailsRuntime.EventsEmit(a.ctx, "conversion-progress", map[string]interface{}{
								"progress": int(progress),
							})
						}
					}
				}
			}

			if err != nil {
				break
			}
		}
	}()

	// Read stdout (usually empty for FFmpeg)
	go func() {
		buffer := make([]byte, 1024)
		for {
			_, err := stdout.Read(buffer)
			if err != nil {
				break
			}
		}
	}()

	// Wait for the command to finish
	go func() {
		waitErr := cmd.Wait()
		// Clear the current conversion command
		convertMutex.Lock()
		currentConvertCmd = nil
		convertMutex.Unlock()

		if waitErr != nil {
			wailsRuntime.LogErrorf(a.ctx, "Conversion failed: %v", waitErr)
			wailsRuntime.EventsEmit(a.ctx, "conversion-error", fmt.Sprintf("Conversion failed: %v", waitErr))
		} else {
			wailsRuntime.LogInfof(a.ctx, "Conversion completed successfully: %s", targetPath)
			wailsRuntime.EventsEmit(a.ctx, "conversion-complete", map[string]interface{}{
				"targetPath": targetPath,
			})
		}
	}()

	return nil
}

// CancelConversion cancels the current conversion
//
//export CancelConversion
func (a *App) CancelConversion() error {
	convertMutex.Lock()
	defer convertMutex.Unlock()

	if currentConvertCmd != nil && currentConvertCmd.Process != nil {
		wailsRuntime.LogInfof(a.ctx, "Cancelling conversion...")
		err := currentConvertCmd.Process.Kill()
		if err != nil {
			wailsRuntime.LogErrorf(a.ctx, "Failed to cancel conversion: %v", err)
			return fmt.Errorf("failed to cancel conversion: %w", err)
		}
		currentConvertCmd = nil
		wailsRuntime.LogInfof(a.ctx, "Conversion cancelled successfully")
		wailsRuntime.EventsEmit(a.ctx, "conversion-cancelled")
		return nil
	}

	wailsRuntime.LogInfof(a.ctx, "No active conversion to cancel")
	return fmt.Errorf("no active conversion to cancel")
}

// openInExplorerInternal opens the file explorer at the specified path
func (a *App) openInExplorerInternal(path string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("explorer", "/select,"+path)
	case "darwin":
		cmd = exec.Command("open", "-R", path)
	case "linux":
		// Try different file managers
		fileManagers := []string{"nautilus", "dolphin", "thunar", "pcmanfm", "caja"}
		for _, fm := range fileManagers {
			if _, err := exec.LookPath(fm); err == nil {
				cmd = exec.Command(fm, path)
				break
			}
		}
		// Fallback to xdg-open
		if cmd == nil {
			cmd = exec.Command("xdg-open", filepath.Dir(path))
		}
	default:
		return fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to open explorer: %w", err)
	}

	wailsRuntime.LogInfof(a.ctx, "Opened explorer at: %s", path)
	return nil
}

// GetExecutableExtension returns the executable extension for the current OS
func getExecutableExtension() string {
	if runtime.GOOS == "windows" {
		return ".exe"
	}
	return ""
}

// parseFFmpegTime parses time string from FFmpeg output (e.g., "00:01:30.45")
func parseFFmpegTime(timeStr string) float64 {
	parts := strings.Split(timeStr, ":")
	if len(parts) != 3 {
		return 0
	}

	var hours, minutes, seconds float64
	fmt.Sscanf(parts[0], "%f", &hours)
	fmt.Sscanf(parts[1], "%f", &minutes)
	fmt.Sscanf(parts[2], "%f", &seconds)

	return hours*3600 + minutes*60 + seconds
}

// getActualDownloadPathInternal returns the actual path of the downloaded file
// This is needed because yt-dlp uses %(ext)s placeholder
func (a *App) getActualDownloadPathInternal(title string) (string, error) {
	// Sanitize title
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

	// Use the current download directory (which may be user-selected)
	downloadsDir := a.GetDownloadDirectory()

	// First, check for .part files (incomplete downloads)
	// This indicates the download is still in progress or was interrupted
	partExtensions := []string{".mp4.part", ".webm.part", ".mkv.part", ".avi.part", ".mov.part", ".flv.part", ".m4v.part"}
	hasPartFile := false
	for _, ext := range partExtensions {
		path := filepath.Join(downloadsDir, sanitizedTitle+ext)
		if _, err := os.Stat(path); err == nil {
			hasPartFile = true
			wailsRuntime.LogWarningf(a.ctx, "Found .part file, download may be incomplete: %s", path)
			break
		}

		// Check for fragment files (e.g., .part-Frag21.part)
		fragmentPattern := filepath.Join(downloadsDir, sanitizedTitle+ext+"-*")
		if matches, _ := filepath.Glob(fragmentPattern); len(matches) > 0 {
			hasPartFile = true
			wailsRuntime.LogWarningf(a.ctx, "Found fragment files, download may be incomplete: %v", matches)
			break
		}
	}

	// Check for .ytdl files (another indicator of incomplete downloads)
	ytdlPath := filepath.Join(downloadsDir, sanitizedTitle+".ytdl")
	hasYtdlFile := false
	if _, err := os.Stat(ytdlPath); err == nil {
		hasYtdlFile = true
		wailsRuntime.LogWarningf(a.ctx, "Found .ytdl file, download may be incomplete: %s", ytdlPath)
	}

	// Try to find the file with common extensions
	extensions := []string{".mp4", ".webm", ".mkv", ".avi", ".mov", ".flv", ".m4v"}
	var foundPath string
	var foundSize int64

	for _, ext := range extensions {
		path := filepath.Join(downloadsDir, sanitizedTitle+ext)
		if fileInfo, err := os.Stat(path); err == nil {
			// Prefer the largest file (in case there are multiple)
			if fileInfo.Size() > foundSize {
				foundPath = path
				foundSize = fileInfo.Size()
			}
		}
	}

	if foundPath != "" {
		// Check if the file is reasonably large (not empty or too small)
		if foundSize < 1024 {
			// File is too small, likely incomplete
			if hasPartFile || hasYtdlFile {
				return "", fmt.Errorf("download incomplete: file too small (%d bytes) and temporary files present", foundSize)
			}
			wailsRuntime.LogWarningf(a.ctx, "Found file but it's very small: %s (%d bytes)", foundPath, foundSize)
		}

		// Get absolute path
		absPath, err := filepath.Abs(foundPath)
		if err != nil {
			return foundPath, nil
		}

		// Log what we found
		if hasPartFile || hasYtdlFile {
			wailsRuntime.LogWarningf(a.ctx, "Returning file path despite temporary files: %s (size: %d bytes)", absPath, foundSize)
		} else {
			wailsRuntime.LogInfof(a.ctx, "Found completed file: %s (size: %d bytes)", absPath, foundSize)
		}

		return absPath, nil
	}

	// If no file found but we have temporary files, it's definitely incomplete
	if hasPartFile || hasYtdlFile {
		return "", fmt.Errorf("download incomplete: temporary files present but no completed file found")
	}

	// If not found, return the default path (this might happen for new downloads)
	defaultPath := filepath.Join(downloadsDir, sanitizedTitle+".mp4")
	wailsRuntime.LogInfof(a.ctx, "No completed file found, returning default path: %s", defaultPath)
	return defaultPath, nil
}
