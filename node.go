package main

import (
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

// isNodeAvailable checks if node.js is available in the system
func (a *App) isNodeAvailable() bool {
	// First check if node is available in PATH
	cmd := exec.Command("node", "--version")
	err := cmd.Run()
	if err == nil {
		return true
	}

	// Check if node exists in bin directory
	binDir := "./bin"
	nodePath := filepath.Join(binDir, a.getNodeBinaryName())

	// Check if node binary exists in bin directory
	if _, err := os.Stat(nodePath); os.IsNotExist(err) {
		return false
	}

	// Try to run node --version to make sure it's functional
	cmd = exec.Command(nodePath, "--version")
	err = cmd.Run()
	return err == nil
}

// getNodeVersion returns the current node.js version
func (a *App) getNodeVersion() (string, error) {
	// First try system node
	cmd := exec.Command("node", "--version")
	output, err := cmd.Output()
	if err == nil {
		version := strings.TrimSpace(string(output))
		return strings.TrimPrefix(version, "v"), nil
	}

	// Try local node
	binDir := "./bin"
	nodePath := filepath.Join(binDir, a.getNodeBinaryName())

	if _, err := os.Stat(nodePath); os.IsNotExist(err) {
		return "", fmt.Errorf("node.js not found")
	}

	cmd = exec.Command(nodePath, "--version")
	output, err = cmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to get node version: %w", err)
	}

	version := strings.TrimSpace(string(output))
	return strings.TrimPrefix(version, "v"), nil
}

// getNodeBinaryName returns the node binary name for the current OS
func (a *App) getNodeBinaryName() string {
	if runtime.GOOS == "windows" {
		return "node.exe"
	}
	return "node"
}

// getNodeDownloadURL returns the appropriate download URL for node.js based on OS and architecture
func (a *App) getNodeDownloadURL() string {
	goos := runtime.GOOS
	arch := runtime.GOARCH

	// Map to node.js release filename format
	var filename string

	switch goos {
	case "windows":
		if arch == "arm64" {
			filename = "node-vlatest-win-arm64.zip"
		} else {
			filename = "node-vlatest-win-x64.zip"
		}
	case "darwin":
		if arch == "arm64" {
			filename = "node-vlatest-darwin-arm64.tar.gz"
		} else {
			filename = "node-vlatest-darwin-x64.tar.gz"
		}
	case "linux":
		if arch == "arm64" {
			filename = "node-vlatest-linux-arm64.tar.gz"
		} else if arch == "arm" {
			filename = "node-vlatest-linux-armv7l.tar.gz"
		} else {
			filename = "node-vlatest-linux-x64.tar.gz"
		}
	default:
		return ""
	}

	// Return the node.js release URL
	return fmt.Sprintf("https://nodejs.org/dist/latest/%s", filename)
}

// downloadNode downloads node.js and extracts it to the bin directory
func (a *App) downloadNode() error {
	downloadURL := a.getNodeDownloadURL()
	binDir := "./bin"

	if downloadURL == "" {
		return fmt.Errorf("unsupported platform: %s/%s", runtime.GOOS, runtime.GOARCH)
	}

	// Create bin directory if it doesn't exist
	if err := os.MkdirAll(binDir, 0755); err != nil {
		return fmt.Errorf("failed to create bin directory: %w", err)
	}

	wailsRuntime.LogInfof(a.ctx, "Downloading node.js from: %s", downloadURL)

	// Download the archive
	resp, err := http.Get(downloadURL)
	if err != nil {
		return fmt.Errorf("failed to download node.js: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to download node.js: status code %d", resp.StatusCode)
	}

	// Create temporary file
	tempFile, err := os.CreateTemp("", "node-*.archive")
	if err != nil {
		return fmt.Errorf("failed to create temporary file: %w", err)
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	// Copy the response body to the temp file
	_, err = io.Copy(tempFile, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to save downloaded file: %w", err)
	}

	// Extract the archive to bin directory
	isZip := strings.HasSuffix(downloadURL, ".zip")
	if isZip {
		err = a.extractNodeZip(tempFile.Name(), binDir)
	} else {
		err = a.extractNodeTarGz(tempFile.Name(), binDir)
	}

	if err != nil {
		return fmt.Errorf("failed to extract node.js: %w", err)
	}

	return nil
}

// extractNodeZip extracts a zip file to the destination directory
func (a *App) extractNodeZip(zipFile, destDir string) error {
	// For Windows, we'll use a simple approach
	// In production, you might want to use a proper zip library
	cmd := exec.Command("powershell", "-Command",
		fmt.Sprintf("Expand-Archive -Path '%s' -DestinationPath '%s' -Force", zipFile, destDir))
	err := cmd.Run()
	if err != nil {
		return fmt.Errorf("failed to extract zip: %w", err)
	}

	// Find the extracted directory and move node.exe to bin
	entries, err := os.ReadDir(destDir)
	if err != nil {
		return fmt.Errorf("failed to read destination directory: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() && strings.HasPrefix(entry.Name(), "node-v") {
			nodePath := filepath.Join(destDir, entry.Name(), "node.exe")
			if _, err := os.Stat(nodePath); err == nil {
				destPath := filepath.Join(destDir, "node.exe")
				if err := os.Rename(nodePath, destPath); err != nil {
					return fmt.Errorf("failed to move node.exe: %w", err)
				}
				// Clean up the extracted directory
				os.RemoveAll(filepath.Join(destDir, entry.Name()))
				break
			}
		}
	}

	return nil
}

// extractNodeTarGz extracts a tar.gz file to the destination directory
func (a *App) extractNodeTarGz(tarGzFile, destDir string) error {
	// Use system tar command
	cmd := exec.Command("tar", "-xzf", tarGzFile, "-C", destDir)
	err := cmd.Run()
	if err != nil {
		return fmt.Errorf("failed to extract tar.gz: %w", err)
	}

	// Find the extracted directory and move node to bin
	entries, err := os.ReadDir(destDir)
	if err != nil {
		return fmt.Errorf("failed to read destination directory: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() && strings.HasPrefix(entry.Name(), "node-v") {
			nodePath := filepath.Join(destDir, entry.Name(), "bin", "node")
			if _, err := os.Stat(nodePath); err == nil {
				destPath := filepath.Join(destDir, "node")
				if err := os.Rename(nodePath, destPath); err != nil {
					return fmt.Errorf("failed to move node: %w", err)
				}
				// Clean up the extracted directory
				os.RemoveAll(filepath.Join(destDir, entry.Name()))
				break
			}
		}
	}

	return nil
}

// getLatestNodeVersion returns the latest node.js version from nodejs.org
func (a *App) getLatestNodeVersion() (string, error) {
	resp, err := http.Get("https://nodejs.org/dist/latest/SHASUMS256.txt")
	if err != nil {
		return "", fmt.Errorf("failed to fetch latest version: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("nodejs.org returned status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	// Parse version from SHASUMS file (first line contains version)
	lines := strings.Split(string(body), "\n")
	if len(lines) > 0 {
		parts := strings.Split(lines[0], "-")
		if len(parts) > 1 {
			version := strings.TrimPrefix(parts[1], "v")
			return version, nil
		}
	}

	return "", fmt.Errorf("failed to parse version from SHASUMS file")
}

// installNode installs the latest version of node.js
func (a *App) installNode() error {
	wailsRuntime.LogInfo(a.ctx, "Starting node.js installation...")

	wailsRuntime.EventsEmit(a.ctx, "node-install-start", nil)

	// Download and install node
	err := a.downloadNode()
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to install node.js: %v", err)
		wailsRuntime.EventsEmit(a.ctx, "node-install-error", err.Error())
		return fmt.Errorf("failed to install node.js: %w", err)
	}

	wailsRuntime.LogInfo(a.ctx, "node.js installed successfully")
	wailsRuntime.EventsEmit(a.ctx, "node-install-complete", nil)
	return nil
}

// updateNode updates node.js to the latest version
func (a *App) updateNode() error {
	wailsRuntime.LogInfo(a.ctx, "Starting node.js update...")

	wailsRuntime.EventsEmit(a.ctx, "node-update-start", nil)

	// Download and install latest node
	err := a.downloadNode()
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to update node.js: %v", err)
		wailsRuntime.EventsEmit(a.ctx, "node-update-error", err.Error())
		return fmt.Errorf("failed to update node.js: %w", err)
	}

	wailsRuntime.LogInfo(a.ctx, "node.js updated successfully")
	wailsRuntime.EventsEmit(a.ctx, "node-update-complete", nil)
	return nil
}

// getJSRuntimeCommand returns the appropriate JS runtime command based on settings
func (a *App) getJSRuntimeCommand() string {
	if !a.settings.UseJSRuntime {
		return ""
	}

	if a.settings.JSRuntimeType == "node" {
		// Check if node is available
		if a.isNodeAvailable() {
			return "node"
		}
		// Fallback to deno if node is not available
		return "deno:" + filepath.Join("./bin", a.getDenoBinaryName())
	}

	// Default to deno
	if a.isDenoAvailable() {
		return "deno:" + filepath.Join("./bin", a.getDenoBinaryName())
	}

	return ""
}
