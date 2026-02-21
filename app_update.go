package main

import (
	"archive/zip"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type appUpdateProgress struct {
	Downloaded int64   `json:"downloaded"`
	Total      int64   `json:"total"`
	Percentage float64 `json:"percentage"`
	Status     string  `json:"status"`
}

type appUpdateComplete struct {
	Message string `json:"message"`
}

func (a *App) applyAppUpdate() error {
	current := GetVersion()
	if current == "dev" {
		return fmt.Errorf("running development version, auto update is disabled")
	}

	release, err := getLatestReleaseInfo()
	if err != nil {
		a.emitAppUpdateError(err)
		return err
	}

	latest := strings.TrimPrefix(release.TagName, "v")
	if !isVersionNewer(current, latest) {
		return fmt.Errorf("you already have the latest version (%s)", current)
	}

	downloadURL, assetName, err := getUpdateAssetForPlatform(release)
	if err != nil {
		a.emitAppUpdateError(err)
		return err
	}

	wailsRuntime.EventsEmit(a.ctx, "app-update-start", nil)

	tmpDir, err := os.MkdirTemp("", "go-dlp-update-*")
	if err != nil {
		a.emitAppUpdateError(err)
		return fmt.Errorf("failed to create temp directory: %w", err)
	}

	archivePath := filepath.Join(tmpDir, assetName)
	if err := a.downloadUpdateFile(downloadURL, archivePath); err != nil {
		a.emitAppUpdateError(err)
		return err
	}

	newBinaryPath, err := extractBinaryFromZip(archivePath, tmpDir)
	if err != nil {
		a.emitAppUpdateError(err)
		return err
	}

	executablePath, err := os.Executable()
	if err != nil {
		a.emitAppUpdateError(err)
		return fmt.Errorf("failed to get current executable path: %w", err)
	}

	switch runtime.GOOS {
	case "windows":
		if err := applyUpdateWindows(newBinaryPath, executablePath); err != nil {
			a.emitAppUpdateError(err)
			return err
		}
		wailsRuntime.EventsEmit(a.ctx, "app-update-complete", appUpdateComplete{
			Message: "Update installed. Restarting app...",
		})
		wailsRuntime.Quit(a.ctx)
		return nil
	case "linux":
		if err := applyUpdateLinux(newBinaryPath, executablePath); err != nil {
			a.emitAppUpdateError(err)
			return err
		}
		wailsRuntime.EventsEmit(a.ctx, "app-update-complete", appUpdateComplete{
			Message: "Update installed successfully. Restart the app to use the new version.",
		})
		return nil
	default:
		err := fmt.Errorf("auto update is not supported on %s yet", runtime.GOOS)
		a.emitAppUpdateError(err)
		return err
	}
}

func (a *App) downloadUpdateFile(downloadURL, destinationPath string) error {
	req, err := http.NewRequest(http.MethodGet, downloadURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create download request: %w", err)
	}
	req.Header.Set("User-Agent", "Go-DLP-Updater")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to download update: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("update download returned status %d", resp.StatusCode)
	}

	out, err := os.Create(destinationPath)
	if err != nil {
		return fmt.Errorf("failed to create update file: %w", err)
	}
	defer out.Close()

	total := resp.ContentLength
	var downloaded int64
	buffer := make([]byte, 32*1024)

	for {
		n, readErr := resp.Body.Read(buffer)
		if n > 0 {
			if _, writeErr := out.Write(buffer[:n]); writeErr != nil {
				return fmt.Errorf("failed to write update file: %w", writeErr)
			}
			downloaded += int64(n)

			percentage := 0.0
			if total > 0 {
				percentage = (float64(downloaded) / float64(total)) * 100
			}
			wailsRuntime.EventsEmit(a.ctx, "app-update-progress", appUpdateProgress{
				Downloaded: downloaded,
				Total:      total,
				Percentage: percentage,
				Status:     "downloading",
			})
		}

		if readErr == io.EOF {
			break
		}
		if readErr != nil {
			return fmt.Errorf("failed to read update stream: %w", readErr)
		}
	}

	wailsRuntime.EventsEmit(a.ctx, "app-update-progress", appUpdateProgress{
		Downloaded: downloaded,
		Total:      total,
		Percentage: 100,
		Status:     "extracting",
	})

	return nil
}

func (a *App) emitAppUpdateError(err error) {
	wailsRuntime.EventsEmit(a.ctx, "app-update-error", err.Error())
}

func getUpdateAssetForPlatform(release *ReleaseInfo) (string, string, error) {
	platform := runtime.GOOS
	arch := runtime.GOARCH

	containsAll := func(name string, required ...string) bool {
		lower := strings.ToLower(name)
		for _, part := range required {
			if !strings.Contains(lower, strings.ToLower(part)) {
				return false
			}
		}
		return true
	}

	for _, asset := range release.Assets {
		name := asset.Name
		if platform == "windows" && containsAll(name, platform, arch, ".zip") {
			return asset.DownloadUrl, name, nil
		}
		if platform == "linux" && containsAll(name, platform, arch, ".zip") {
			return asset.DownloadUrl, name, nil
		}
	}

	return "", "", fmt.Errorf("no compatible update asset found for %s/%s", platform, arch)
}

func extractBinaryFromZip(zipPath, destinationDir string) (string, error) {
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return "", fmt.Errorf("failed to open update archive: %w", err)
	}
	defer reader.Close()

	for _, file := range reader.File {
		if file.FileInfo().IsDir() {
			continue
		}

		base := filepath.Base(file.Name)
		if runtime.GOOS == "windows" {
			if !strings.EqualFold(filepath.Ext(base), ".exe") {
				continue
			}
		}

		target := filepath.Join(destinationDir, base)
		if err := extractZipFile(file, target); err != nil {
			return "", err
		}
		return target, nil
	}

	return "", fmt.Errorf("failed to find executable in archive")
}

func extractZipFile(file *zip.File, targetPath string) error {
	rc, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open file in archive: %w", err)
	}
	defer rc.Close()

	out, err := os.Create(targetPath)
	if err != nil {
		return fmt.Errorf("failed to create extracted file: %w", err)
	}
	defer out.Close()

	if _, err := io.Copy(out, rc); err != nil {
		return fmt.Errorf("failed to extract file: %w", err)
	}

	if err := out.Chmod(0755); err != nil && runtime.GOOS != "windows" {
		return fmt.Errorf("failed to set executable permission: %w", err)
	}

	return nil
}

func applyUpdateLinux(newBinaryPath, currentBinaryPath string) error {
	targetDir := filepath.Dir(currentBinaryPath)
	newPath := filepath.Join(targetDir, ".go-dlp-new-binary")

	src, err := os.Open(newBinaryPath)
	if err != nil {
		return fmt.Errorf("failed to open new binary: %w", err)
	}
	defer src.Close()

	dst, err := os.OpenFile(newPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0755)
	if err != nil {
		return fmt.Errorf("failed to create target binary: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("failed to copy new binary: %w", err)
	}

	if err := os.Rename(newPath, currentBinaryPath); err != nil {
		return fmt.Errorf("failed to replace current binary: %w", err)
	}

	return nil
}

func applyUpdateWindows(newBinaryPath, currentBinaryPath string) error {
	tmpDir := filepath.Dir(newBinaryPath)
	scriptPath := filepath.Join(tmpDir, "go-dlp-update.bat")

	script := fmt.Sprintf(`@echo off
setlocal
set "PID=%d"
set "SOURCE=%s"
set "TARGET=%s"

for /l %%%%i in (1,1,90) do (
  tasklist /FI "PID eq %%PID%%" | find "%%PID%%" >nul
  if errorlevel 1 goto replace
  timeout /t 1 /nobreak >nul
)

:replace
copy /Y "%%SOURCE%%" "%%TARGET%%" >nul
start "" "%%TARGET%%"
del /f /q "%%SOURCE%%" >nul 2>&1
del /f /q "%%~f0" >nul 2>&1
`, os.Getpid(), escapeBatchPath(newBinaryPath), escapeBatchPath(currentBinaryPath))

	if err := os.WriteFile(scriptPath, []byte(script), 0644); err != nil {
		return fmt.Errorf("failed to write updater script: %w", err)
	}

	cmd := exec.Command("cmd", "/C", "start", "", scriptPath)
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start updater script: %w", err)
	}

	return nil
}

func escapeBatchPath(path string) string {
	return strings.ReplaceAll(path, `"`, `""`)
}
