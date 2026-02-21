package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"runtime"
	"strconv"
	"strings"
)

// Version information - set at build time via ldflags
var (
	version = "dev"
	commit  = ""
	date    = ""
)

// GetVersion returns the current application version
func GetVersion() string {
	return version
}

// GetFullVersion returns full version info
func GetFullVersion() string {
	if version == "dev" {
		return fmt.Sprintf("dev (Go %s)", runtime.Version())
	}
	info := fmt.Sprintf("v%s", version)
	if commit != "" && len(commit) >= 8 {
		info += fmt.Sprintf("-%s", commit[:8])
	}
	if date != "" {
		info += fmt.Sprintf(" (%s)", date)
	}
	info += fmt.Sprintf(" [Go %s]", runtime.Version())
	return info
}

// ReleaseInfo represents GitHub release information
type ReleaseInfo struct {
	TagName string `json:"tag_name"`
	Url     string `json:"html_url"`
	Body    string `json:"body"`
	Assets  []struct {
		Name        string `json:"name"`
		DownloadUrl string `json:"browser_download_url"`
	} `json:"assets"`
}

// getLatestReleaseInfo fetches the latest release info from GitHub
func getLatestReleaseInfo() (*ReleaseInfo, error) {
	req, err := http.NewRequest(http.MethodGet, "https://api.github.com/repos/Locon213/Go-DLP/releases/latest", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "Go-DLP-Updater")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch latest release: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status: %d", resp.StatusCode)
	}

	var release ReleaseInfo
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &release, nil
}

// GetCurrentVersion returns the current app version
func GetCurrentVersion() string {
	return GetVersion()
}

// GetLatestVersion returns the latest version from GitHub
func GetLatestVersion() (string, error) {
	release, err := getLatestReleaseInfo()
	if err != nil {
		return "", err
	}
	return strings.TrimPrefix(release.TagName, "v"), nil
}

// GetLatestVersionUrl returns the URL to the latest release
func GetLatestVersionUrl() (string, error) {
	release, err := getLatestReleaseInfo()
	if err != nil {
		return "", err
	}
	return release.Url, nil
}

// CheckForUpdate checks if a newer version is available
func CheckForUpdate() (string, error) {
	currentVersion := GetVersion()
	if currentVersion == "dev" {
		return "", fmt.Errorf("running development version, cannot check for updates")
	}

	latestVersion, err := GetLatestVersion()
	if err != nil {
		return "", err
	}

	return latestVersion, nil
}

// ShouldUpdate checks if an update is available and returns update info
func ShouldUpdate() (bool, string, error) {
	currentVersion := GetVersion()
	if currentVersion == "dev" {
		return false, "", nil
	}

	release, err := getLatestReleaseInfo()
	if err != nil {
		return false, "", err
	}

	latestVersion := strings.TrimPrefix(release.TagName, "v")
	if isVersionNewer(currentVersion, latestVersion) {
		return true, latestVersion, nil
	}

	return false, "", nil
}

// GetUpdateDownloadUrl returns the appropriate download URL for the current platform
func GetUpdateDownloadUrl() (string, error) {
	release, err := getLatestReleaseInfo()
	if err != nil {
		return "", err
	}

	// Determine platform and arch strings for GitHub releases
	platform := runtime.GOOS
	arch := runtime.GOARCH
	if arch == "amd64" {
		arch = "amd64"
	} else if arch == "arm64" {
		arch = "arm64"
	}

	// Try different filename patterns
	patterns := []string{
		fmt.Sprintf("Go-DLP_%s_%s_%s.zip", release.TagName, platform, arch),
		fmt.Sprintf("Go-DLP_%s_%s.zip", release.TagName, platform),
	}

	// For Linux, also try .deb and .rpm
	if platform == "linux" {
		patterns = append(patterns,
			fmt.Sprintf("go-dlp_%s_%s.deb", strings.TrimPrefix(release.TagName, "v"), arch),
			fmt.Sprintf("go-dlp-%s-1.x86_64.rpm", strings.TrimPrefix(release.TagName, "v")),
		)
	}

	for _, asset := range release.Assets {
		for _, pattern := range patterns {
			if strings.Contains(asset.Name, pattern) {
				return asset.DownloadUrl, nil
			}
		}
	}

	// Fallback to release page URL
	return release.Url, nil
}

// GetReleaseNotes returns the release notes for the latest version
func GetReleaseNotes() (string, error) {
	release, err := getLatestReleaseInfo()
	if err != nil {
		return "", err
	}
	return release.Body, nil
}

// GetOsInfo returns operating system information
func GetOsInfo() string {
	return fmt.Sprintf("%s %s", runtime.GOOS, runtime.GOARCH)
}

// GetBuildInfo returns build information
func GetBuildInfo() string {
	return fmt.Sprintf("Version: %s\nGo: %s\nOS: %s\nDate: %s",
		GetFullVersion(),
		runtime.Version(),
		GetOsInfo(),
		date)
}

// SaveVersionToFile saves version info to a file
func SaveVersionToFile(filename string) error {
	data := fmt.Sprintf(`{
  "version": "%s",
  "commit": "%s",
  "date": "%s",
  "platform": "%s",
  "arch": "%s"
}`, version, commit, date, runtime.GOOS, runtime.GOARCH)

	return os.WriteFile(filename, []byte(data), 0644)
}

func isVersionNewer(current, latest string) bool {
	if current == "" || latest == "" {
		return false
	}

	currentParts := parseVersionParts(current)
	latestParts := parseVersionParts(latest)

	maxLen := len(currentParts)
	if len(latestParts) > maxLen {
		maxLen = len(latestParts)
	}

	for i := 0; i < maxLen; i++ {
		curPart := 0
		latPart := 0

		if i < len(currentParts) {
			curPart = currentParts[i]
		}
		if i < len(latestParts) {
			latPart = latestParts[i]
		}

		if latPart > curPart {
			return true
		}
		if latPart < curPart {
			return false
		}
	}

	return false
}

func parseVersionParts(v string) []int {
	trimmed := strings.TrimPrefix(strings.TrimSpace(v), "v")
	if trimmed == "" {
		return []int{0}
	}

	segments := strings.Split(trimmed, ".")
	parts := make([]int, 0, len(segments))
	for _, segment := range segments {
		digits := extractLeadingDigits(segment)
		if digits == "" {
			parts = append(parts, 0)
			continue
		}

		num, err := strconv.Atoi(digits)
		if err != nil {
			parts = append(parts, 0)
			continue
		}
		parts = append(parts, num)
	}

	return parts
}

func extractLeadingDigits(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r < '0' || r > '9' {
			break
		}
		b.WriteRune(r)
	}
	return b.String()
}
