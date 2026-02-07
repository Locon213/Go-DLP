package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// loadSettings loads settings from a file or sets defaults
func (a *App) loadSettings() {
	settingsFile := "./settings.json"

	// Set default values
	a.settings.ProxyMode = "none"
	a.settings.ProxyAddress = ""
	a.settings.CookiesMode = "none"
	a.settings.CookiesBrowser = "chrome"
	a.settings.CookiesFile = ""
	a.settings.Language = "en"            // Default language
	a.settings.AutoRedirectToQueue = true // Default: auto redirect to queue

	// Try to read existing settings
	data, err := os.ReadFile(settingsFile)
	if err != nil {
		// If file doesn't exist, we'll use defaults
		// Don't log here since context might not be initialized yet
		return
	}

	// Unmarshal the settings
	err = json.Unmarshal(data, &a.settings)
	if err != nil {
		// Don't log here since context might not be initialized yet
		// Use defaults if parsing fails
		a.settings.ProxyMode = "none"
		a.settings.ProxyAddress = ""
		a.settings.CookiesMode = "none"
		a.settings.CookiesBrowser = "chrome"
		a.settings.CookiesFile = ""
	}
}

// saveSettings saves settings to a file
func (a *App) saveSettings() error {
	settingsFile := "./settings.json"

	data, err := json.MarshalIndent(a.settings, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal settings: %w", err)
	}

	err = os.WriteFile(settingsFile, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write settings file: %w", err)
	}

	return nil
}

// validateCookiesFileInternal validates if the cookies file exists and is accessible
func (a *App) validateCookiesFileInternal(filePath string) (bool, error) {
	if filePath == "" {
		return false, fmt.Errorf("file path is empty")
	}

	// Check if the file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return false, fmt.Errorf("cookies file does not exist: %s", filePath)
	} else if err != nil {
		return false, fmt.Errorf("error checking cookies file: %v", err)
	}

	// Check if the file is readable
	file, err := os.Open(filePath)
	if err != nil {
		return false, fmt.Errorf("cannot open cookies file: %v", err)
	}
	defer file.Close()

	// Basic validation - check if file has .txt or .cookies extension
	if !(strings.HasSuffix(strings.ToLower(filePath), ".txt") || strings.HasSuffix(strings.ToLower(filePath), ".cookies")) {
		wailsRuntime.LogInfof(a.ctx, "Warning: Cookies file does not have .txt or .cookies extension: %s", filePath)
	}

	return true, nil
}

// getSettingsAsJSON returns current application settings as JSON string
func (a *App) getSettingsAsJSON() (string, error) {
	settingsJSON, err := json.Marshal(a.settings)
	if err != nil {
		return "", fmt.Errorf("failed to marshal settings: %w", err)
	}
	return string(settingsJSON), nil
}

// updateSettingsWithCookiesFile updates application settings including cookies file
func (a *App) updateSettingsWithCookiesFile(proxyMode, proxyAddress, cookiesMode, cookiesBrowser, cookiesFile string) error {
	a.settings.ProxyMode = proxyMode
	a.settings.ProxyAddress = proxyAddress
	a.settings.CookiesMode = cookiesMode
	a.settings.CookiesBrowser = cookiesBrowser
	a.settings.CookiesFile = cookiesFile

	err := a.saveSettings()
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to save settings: %v", err)
		return err
	}

	// Also trigger autosave in background
	go func() {
		a.AutoSaveSettings()
	}()

	return nil
}

// UpdateLanguage updates the application language
//
//export UpdateLanguage
func (a *App) UpdateLanguage(language string) error {
	a.settings.Language = language

	err := a.saveSettings()
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to save language: %v", err)
		return err
	}

	wailsRuntime.LogInfof(a.ctx, "Language updated to: %s", language)
	return nil
}

// AutoSaveSettings periodically saves settings to prevent data loss
func (a *App) AutoSaveSettings() {
	// This function can be called periodically to autosave settings
	err := a.saveSettings()
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to autosave settings: %v", err)
	} else {
		wailsRuntime.LogInfof(a.ctx, "Settings autosaved successfully")
	}
}

// loadSettingsWithLogging loads settings and logs appropriately after context is initialized
func (a *App) loadSettingsWithLogging() {
	settingsFile := "./settings.json"

	// Set default values
	a.settings.ProxyMode = "none"
	a.settings.ProxyAddress = ""
	a.settings.CookiesMode = "none"
	a.settings.CookiesBrowser = "chrome"
	a.settings.CookiesFile = ""
	a.settings.Language = "en"            // Default language
	a.settings.AutoRedirectToQueue = true // Default: auto redirect to queue

	// Try to read existing settings
	data, err := os.ReadFile(settingsFile)
	if err != nil {
		// If file doesn't exist, we'll use defaults
		wailsRuntime.LogInfo(a.ctx, "Settings file not found, using defaults")
		return
	}

	// Unmarshal the settings
	err = json.Unmarshal(data, &a.settings)
	if err != nil {
		wailsRuntime.LogErrorf(a.ctx, "Failed to parse settings: %v", err)
		// Use defaults if parsing fails
		a.settings.ProxyMode = "none"
		a.settings.ProxyAddress = ""
		a.settings.CookiesMode = "none"
		a.settings.CookiesBrowser = "chrome"
		a.settings.CookiesFile = ""
	} else {
		wailsRuntime.LogInfo(a.ctx, "Settings loaded successfully")
	}
}
