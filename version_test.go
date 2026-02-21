package main

import (
	"strings"
	"testing"
)

func TestGetVersion(t *testing.T) {
	// Test that GetVersion returns a value
	version := GetVersion()
	if version == "" {
		t.Error("GetVersion() should not return empty string")
	}
}

func TestGetFullVersion(t *testing.T) {
	// Test that GetFullVersion returns a value
	fullVersion := GetFullVersion()
	if fullVersion == "" {
		t.Error("GetFullVersion() should not return empty string")
	}

	// Full version should contain version info
	if !strings.Contains(fullVersion, "v") && GetVersion() != "dev" {
		t.Error("Full version should contain 'v' prefix for non-dev versions")
	}
}

func TestGetOsInfo(t *testing.T) {
	// Test that GetOsInfo returns a value
	osInfo := GetOsInfo()
	if osInfo == "" {
		t.Error("GetOsInfo() should not return empty string")
	}

	// Should contain GOOS and GOARCH
	if !strings.Contains(osInfo, " ") {
		t.Error("OS info should contain space-separated OS and arch")
	}
}

func TestVersionFormat(t *testing.T) {
	version := GetVersion()

	// If not dev, version should follow semver format
	if version != "dev" {
		// Check basic semver format (at least x.y.z)
		parts := strings.Split(version, ".")
		if len(parts) < 3 {
			t.Errorf("Version %s should have at least 3 parts (semver)", version)
		}
	}
}

func TestGetBuildInfo(t *testing.T) {
	buildInfo := GetBuildInfo()
	if buildInfo == "" {
		t.Error("GetBuildInfo() should not return empty string")
	}

	// Build info should contain "Version:"
	if !strings.Contains(buildInfo, "Version:") {
		t.Error("Build info should contain 'Version:'")
	}
}

func TestIsVersionNewer(t *testing.T) {
	tests := []struct {
		current string
		latest  string
		expect  bool
	}{
		{current: "1.1.0", latest: "1.2.0", expect: true},
		{current: "1.10.0", latest: "1.9.9", expect: false},
		{current: "1.1.0", latest: "v1.1.1", expect: true},
		{current: "1.1.0", latest: "1.1.0", expect: false},
	}

	for _, tt := range tests {
		if got := isVersionNewer(tt.current, tt.latest); got != tt.expect {
			t.Fatalf("isVersionNewer(%q, %q) = %v, want %v", tt.current, tt.latest, got, tt.expect)
		}
	}
}
