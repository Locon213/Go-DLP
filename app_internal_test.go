package main

import (
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func TestBuildOpenInExplorerCommandForOS_UsesDirectoryForFilePath(t *testing.T) {
	cmd, err := buildOpenInExplorerCommandForOS("windows", filepath.Join("downloads", "video.mp4"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	cmdName := strings.ToLower(filepath.Base(cmd.Path))
	if cmdName != "explorer" && cmdName != "explorer.exe" {
		t.Fatalf("expected explorer command, got %q", cmd.Path)
	}
	if len(cmd.Args) < 2 || cmd.Args[1] != "downloads" {
		t.Fatalf("expected explorer to open downloads dir, args: %#v", cmd.Args)
	}
}

func TestBuildOpenInExplorerCommandForOS_TemplatePathOpensParentDirectory(t *testing.T) {
	cmd, err := buildOpenInExplorerCommandForOS("windows", filepath.Join("downloads", "video.%(ext)s"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(cmd.Args) < 2 || cmd.Args[1] != "downloads" {
		t.Fatalf("expected parent directory for template path, args: %#v", cmd.Args)
	}
}

func TestBuildOpenInExplorerCommandForOS_EmptyPath(t *testing.T) {
	_, err := buildOpenInExplorerCommandForOS("windows", "   ")
	if err == nil {
		t.Fatal("expected error for empty path")
	}
}

func TestBuildOpenInExplorerCommandForOS_UnsupportedOS(t *testing.T) {
	_, err := buildOpenInExplorerCommandForOS("plan9", "downloads/video.mp4")
	if err == nil {
		t.Fatal("expected unsupported OS error")
	}
}

func TestGetDownloadPathInternal_SanitizesTitleAndCaches(t *testing.T) {
	tmpDir := t.TempDir()
	oldDir := defaultDownloadDir
	defaultDownloadDir = tmpDir
	t.Cleanup(func() { defaultDownloadDir = oldDir })

	app := &App{}
	title := `Bad:/\*?"<>| Title`

	first := app.getDownloadPathInternal(title)
	second := app.getDownloadPathInternal(title)

	if first != second {
		t.Fatalf("expected cached path to match, first=%q second=%q", first, second)
	}

	fileName := filepath.Base(first)
	for _, bad := range []string{":", "/", "\\", "*", "?", "\"", "<", ">", "|"} {
		if strings.Contains(fileName, bad) {
			t.Fatalf("expected sanitized filename, found %q in %q", bad, fileName)
		}
	}
}

func TestParseFFmpegTime(t *testing.T) {
	if got := parseFFmpegTime("00:01:30.50"); got != 90.5 {
		t.Fatalf("expected 90.5, got %v", got)
	}
	if got := parseFFmpegTime("invalid"); got != 0 {
		t.Fatalf("expected 0 for invalid input, got %v", got)
	}
}

func TestFormatFileSizeVariants(t *testing.T) {
	tests := []struct {
		in   interface{}
		want string
	}{
		{1024.0, "1.00 KB"},
		{"2048", "2.00 KB"},
		{"~ 80.69MiB", "~ 80.69MiB"},
		{"", "Unknown"},
		{int64(0), "Unknown"},
	}

	for _, tt := range tests {
		got := formatFileSize(tt.in)
		if got != tt.want {
			t.Fatalf("formatFileSize(%v) = %q, want %q", tt.in, got, tt.want)
		}
	}
}

func TestFormatDuration(t *testing.T) {
	if got := formatDuration(65); got != "1:05" {
		t.Fatalf("expected 1:05, got %q", got)
	}
	if got := formatDuration(3661); got != "1:01:01" {
		t.Fatalf("expected 1:01:01, got %q", got)
	}
}

func TestGetExecutableExtension(t *testing.T) {
	got := getExecutableExtension()
	if runtime.GOOS == "windows" && got != ".exe" {
		t.Fatalf("expected .exe on windows, got %q", got)
	}
	if runtime.GOOS != "windows" && got != "" {
		t.Fatalf("expected empty extension on non-windows, got %q", got)
	}
}
