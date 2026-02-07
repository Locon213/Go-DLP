//go:build windows
// +build windows

package main

import (
	"os/exec"
	"syscall"
)

// setHideWindow sets the HideWindow flag for the given command on Windows
func setHideWindow(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow: true,
	}
}
