package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// SetupDependencies checks for yt-dlp and ffmpeg binaries, downloads if missing
func (a *App) SetupDependencies() {
	// Show setup modal
	wailsRuntime.LogInfo(a.ctx, "Emitting setup-started event")
	wailsRuntime.EventsEmit(a.ctx, "setup-started")

	binDir := "./bin"
	if err := os.MkdirAll(binDir, 0755); err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to create bin directory: %v", err)
		wailsRuntime.EventsEmit(a.ctx, "setup-error", fmt.Sprintf("Failed to create bin directory: %v", err))
		return
	}

	// Check for yt-dlp
	ytDlpPath := filepath.Join(binDir, a.getYtDlpBinaryName())
	if _, err := os.Stat(ytDlpPath); os.IsNotExist(err) {
		wailsRuntime.LogInfo(a.ctx, "yt-dlp binary not found, downloading...")
		err := a.downloadYtDlp(ytDlpPath)
		if err != nil {
			wailsRuntime.LogErrorf(a.ctx, "Failed to download yt-dlp: %v", err)
			a.logDetailedError("SetupDependencies", "", "", err)
			wailsRuntime.EventsEmit(a.ctx, "setup-error", fmt.Sprintf("Failed to download yt-dlp: %v", err))
			return
		}
		wailsRuntime.LogInfo(a.ctx, "yt-dlp downloaded successfully")
	} else {
		wailsRuntime.LogInfo(a.ctx, "yt-dlp binary found")
	}

	// Check for ffmpeg - improved detection
	ffmpegFound := false

	// Check if ffmpeg is available globally first
	if a.isCommandAvailable("ffmpeg") {
		wailsRuntime.LogInfo(a.ctx, "ffmpeg found globally")
		ffmpegFound = true
	} else {
		// Check for local ffmpeg binary
		ffmpegPath := filepath.Join(binDir, a.getFfmpegBinaryName())
		if _, err := os.Stat(ffmpegPath); err == nil {
			wailsRuntime.LogInfo(a.ctx, "ffmpeg binary found locally")
			ffmpegFound = true
		}
	}

	if !ffmpegFound {
		// Send warning but don't stop the setup process
		wailsRuntime.LogInfo(a.ctx, "ffmpeg not found, sending warning")
		wailsRuntime.EventsEmit(a.ctx, "ffmpeg-warning", "FFmpeg not found. Some features may not work properly.")
	}

	// Убедимся, что setup-complete отправляется с небольшой задержкой
	// чтобы дать возможность другим событиям обработаться
	go func() {
		time.Sleep(300 * time.Millisecond) // Немного уменьшили задержку для ускорения
		wailsRuntime.LogInfo(a.ctx, "Emitting setup-complete event")
		wailsRuntime.EventsEmit(a.ctx, "setup-complete")
	}()
}

// downloadYtDlp downloads the appropriate yt-dlp binary for the current OS
func (a *App) downloadYtDlp(destPath string) error {
	var downloadURL string

	switch runtime.GOOS {
	case "windows":
		downloadURL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
	case "darwin":
		downloadURL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
	case "linux":
		downloadURL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux"
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}

	wailsRuntime.LogInfof(a.ctx, "Downloading yt-dlp from: %s", downloadURL)

	// Create HTTP request
	resp, err := http.Get(downloadURL)
	if err != nil {
		return fmt.Errorf("failed to download yt-dlp: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status: %d", resp.StatusCode)
	}

	// Create destination file
	out, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer out.Close()

	// Copy with progress reporting
	total := resp.ContentLength
	var downloaded int64

	buf := make([]byte, 32*1024)
	for {
		n, err := resp.Body.Read(buf)
		if n > 0 {
			_, writeErr := out.Write(buf[:n])
			if writeErr != nil {
				return fmt.Errorf("failed to write file: %w", writeErr)
			}

			downloaded += int64(n)

			// Calculate progress percentage
			progress := 0
			if total > 0 {
				progress = int((float64(downloaded) / float64(total)) * 100)
			}

			// Emit progress event for both setup and update
			wailsRuntime.EventsEmit(a.ctx, "setup-progress", map[string]interface{}{
				"downloaded": downloaded,
				"total":      total,
				"percentage": progress,
			})
			wailsRuntime.EventsEmit(a.ctx, "yt-dlp-update-progress", map[string]interface{}{
				"downloaded": downloaded,
				"total":      total,
				"percentage": progress,
			})
		}

		if err == io.EOF {
			break
		}

		if err != nil {
			return fmt.Errorf("error reading download stream: %w", err)
		}
	}

	// Make executable on Unix systems
	if runtime.GOOS != "windows" {
		if err := os.Chmod(destPath, 0755); err != nil {
			return fmt.Errorf("failed to make executable: %w", err)
		}
	}

	return nil
}

// getYtDlpVersionInternal returns the current version of yt-dlp
func (a *App) getYtDlpVersionInternal() (string, error) {
	ytDlpPath := filepath.Join("./bin", a.getYtDlpBinaryName())

	// Check if yt-dlp exists
	if _, err := os.Stat(ytDlpPath); os.IsNotExist(err) {
		return "", fmt.Errorf("yt-dlp not found")
	}

	// Run yt-dlp --version
	cmd := exec.Command(ytDlpPath, "--version")
	if runtime.GOOS == "windows" {
		cmd.SysProcAttr = &syscall.SysProcAttr{
			HideWindow: true,
		}
	}

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to get yt-dlp version: %w", err)
	}

	version := strings.TrimSpace(string(output))
	return version, nil
}

// getLatestYtDlpVersionInternal returns the latest version of yt-dlp from GitHub API
func (a *App) getLatestYtDlpVersionInternal() (string, error) {
	// GitHub API endpoint for latest release
	resp, err := http.Get("https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest")
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

	return release.TagName, nil
}

// updateYtDlpInternal updates yt-dlp to the latest version
func (a *App) updateYtDlpInternal() error {
	ytDlpPath := filepath.Join("./bin", a.getYtDlpBinaryName())

	// Check if yt-dlp exists
	if _, err := os.Stat(ytDlpPath); os.IsNotExist(err) {
		return fmt.Errorf("yt-dlp not found, please run setup first")
	}

	wailsRuntime.LogInfo(a.ctx, "Starting yt-dlp update...")

	// Emit update start event
	wailsRuntime.EventsEmit(a.ctx, "yt-dlp-update-start", nil)

	// Download the latest version
	err := a.downloadYtDlp(ytDlpPath)
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to update yt-dlp: %v", err)
		wailsRuntime.EventsEmit(a.ctx, "yt-dlp-update-error", err.Error())
		return fmt.Errorf("failed to update yt-dlp: %w", err)
	}

	wailsRuntime.LogInfo(a.ctx, "yt-dlp updated successfully")
	wailsRuntime.EventsEmit(a.ctx, "yt-dlp-update-complete", nil)
	return nil
}

// downloadFfmpeg downloads the appropriate ffmpeg binary for the current OS
func (a *App) downloadFfmpeg(destPath string) error {
	var downloadURL string

	switch runtime.GOOS {
	case "windows":
		// For Windows, we'll provide instructions to install manually since automatic download is complex
		wailsRuntime.EventsEmit(a.ctx, "ffmpeg-warning", "FFmpeg automatic download is complex on Windows. Please install FFmpeg manually from https://www.gyan.dev/ffmpeg/builds/")
		return fmt.Errorf("automatic ffmpeg download not supported on Windows")
	case "darwin":
		downloadURL = "https://evermeet.cx/ffmpeg/getrelease/zip"
	case "linux":
		// For Linux, we'll provide instructions to install via package manager
		wailsRuntime.EventsEmit(a.ctx, "ffmpeg-warning", "Please install FFmpeg using your distribution's package manager (e.g., sudo apt install ffmpeg)")
		return fmt.Errorf("automatic ffmpeg download not supported on Linux")
	default:
		return fmt.Errorf("unsupported platform for ffmpeg: %s", runtime.GOOS)
	}

	wailsRuntime.LogInfof(a.ctx, "Downloading ffmpeg from: %s", downloadURL)

	// Create HTTP request
	resp, err := http.Get(downloadURL)
	if err != nil {
		return fmt.Errorf("failed to download ffmpeg: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status: %d", resp.StatusCode)
	}

	// Create destination file
	out, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer out.Close()

	// Copy with progress reporting
	total := resp.ContentLength
	var downloaded int64

	buf := make([]byte, 32*1024)
	for {
		n, err := resp.Body.Read(buf)
		if n > 0 {
			_, writeErr := out.Write(buf[:n])
			if writeErr != nil {
				return fmt.Errorf("failed to write file: %w", writeErr)
			}

			downloaded += int64(n)

			// Calculate progress percentage
			progress := 0
			if total > 0 {
				progress = int((float64(downloaded) / float64(total)) * 100)
			}

			// Emit progress event
			wailsRuntime.EventsEmit(a.ctx, "setup-progress", map[string]interface{}{
				"downloaded": downloaded,
				"total":      total,
				"percentage": progress,
			})
		}

		if err == io.EOF {
			break
		}

		if err != nil {
			return fmt.Errorf("error reading download stream: %w", err)
		}
	}

	// Make executable on Unix systems
	if runtime.GOOS != "windows" {
		if err := os.Chmod(destPath, 0755); err != nil {
			return fmt.Errorf("failed to make executable: %w", err)
		}
	}

	return nil
}
