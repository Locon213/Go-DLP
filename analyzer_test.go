package main

import (
	"testing"
)

func TestFormatFileSize(t *testing.T) {
	tests := []struct {
		name     string
		bytes    float64
		expected string
	}{
		{"Bytes", 512, "512.00 B"},
		{"Kilobytes", 1024, "1.00 KB"},
		{"Megabytes", 1024 * 1024, "1.00 MB"},
		{"Gigabytes", 1024 * 1024 * 1024, "1.00 GB"},
		{"Terabytes", 1024 * 1024 * 1024 * 1024, "1.00 TB"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatFileSizeHuman(tt.bytes)
			if result != tt.expected {
				t.Errorf("formatFileSizeHuman(%f) = %s, want %s", tt.bytes, result, tt.expected)
			}
		})
	}
}

func TestGetDownloadPath(t *testing.T) {
	app := &App{}

	// Test basic title sanitization
	title := "Test Video: The Movie"
	path := app.GetDownloadPath(title)

	if path == "" {
		t.Error("GetDownloadPath returned empty string")
	}

	// Verify download directory is used (cross-platform check)
	// Note: Title has spaces and colon, both replaced with _
	// "Test Video: The Movie" -> "Test_Video__The_Movie"
	if !contains(path, "Test_Video__The_Movie") {
		t.Errorf("Path should contain sanitized title, got: %s", path)
	}
}

func TestGetDownloadPathSpecialChars(t *testing.T) {
	app := &App{}

	// Test special characters that should be sanitized
	title := "Test/Video\\File:Name*?\"<>|"
	path := app.GetDownloadPath(title)

	// All special characters should be replaced with _
	// Note: On Windows, backslash is path separator and will remain, so we only check other special chars
	if contains(path, "/") || contains(path, ":") ||
		contains(path, "*") || contains(path, "?") || contains(path, "\"") ||
		contains(path, "<") || contains(path, ">") || contains(path, "|") {
		t.Errorf("Path should not contain special characters, got: %s", path)
	}

	// Verify the path uses the correct directory
	if !contains(path, "downloads") {
		t.Errorf("Path should contain downloads directory, got: %s", path)
	}
}

func TestSettingsLoad(t *testing.T) {
	app := &App{}

	// Test that default settings are set
	app.loadSettings()

	if app.settings.ProxyMode != "none" {
		t.Errorf("Default ProxyMode should be 'none', got: %s", app.settings.ProxyMode)
	}

	if app.settings.CookiesMode != "none" {
		t.Errorf("Default CookiesMode should be 'none', got: %s", app.settings.CookiesMode)
	}

	if app.settings.Language != "en" {
		t.Errorf("Default Language should be 'en', got: %s", app.settings.Language)
	}
}

func TestValidateCookiesFile(t *testing.T) {
	app := &App{}

	// Test with non-existent file
	valid, err := app.ValidateCookiesFile("/non/existent/file.txt")
	if valid {
		t.Error("Non-existent file should not be valid")
	}
	if err == nil {
		t.Error("Should return error for non-existent file")
	}
}

// Helper function to check if string contains substring
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsAt(s, substr, 0))
}

func containsAt(s, substr string, start int) bool {
	for i := start; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
