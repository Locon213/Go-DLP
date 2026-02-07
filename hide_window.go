//go:build !windows
// +build !windows

package main

import (
	"os/exec"
)

// setHideWindow does nothing on non-Windows platforms
func setHideWindow(cmd *exec.Cmd) {
	// HideWindow is only available on Windows
	// No action needed on Linux/macOS
}
