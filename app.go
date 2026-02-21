package main

import (
	"context"
	"time"
)

// App struct
type App struct {
	ctx      context.Context
	settings Settings
}

// NewApp creates a new App application struct
func NewApp() *App {
	app := &App{}
	app.loadSettings() // Load settings on initialization
	return app
}

// OnStartup is called when app starts. The context is saved
// so we can call the runtime methods
func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx

	// Загружаем настройки после инициализации контекста
	a.loadSettingsWithLogging()

	// Запускаем в отдельной горутине с небольшой задержкой
	// чтобы Wails runtime успел загрузиться
	go func() {
		// Даем время Wails runtime загрузиться
		time.Sleep(1 * time.Second)

		// Check and setup dependencies
		a.SetupDependencies()
	}()
}

// Export functions for Wails

// AnalyzeURL analyzes a YouTube URL and returns video information
//
//export AnalyzeURL
func (a *App) AnalyzeURL(url string) (string, error) {
	return a.analyzeURLInternal(url)
}

// AnalyzePlaylist analyzes a playlist URL and returns playlist information
//
//export AnalyzePlaylist
func (a *App) AnalyzePlaylist(url string) (string, error) {
	return a.analyzePlaylistInternal(url)
}

// GetPlaylistItems returns a list of video entries from a playlist
//
//export GetPlaylistItems
func (a *App) GetPlaylistItems(url string) (string, error) {
	return a.getPlaylistItemsInternal(url)
}

// DownloadVideo downloads a video using the selected format ID
//
//export DownloadVideo
func (a *App) DownloadVideo(url, formatID, outputPath string) error {
	return a.downloadVideoInternal(url, formatID, outputPath)
}

// DownloadPlaylist downloads an entire playlist
//
//export DownloadPlaylist
func (a *App) DownloadPlaylist(url, formatID, outputPath string, startItem, endItem int) error {
	return a.downloadPlaylistInternal(url, formatID, outputPath, startItem, endItem)
}

// CancelDownload cancels the current download gracefully
//
//export CancelDownload
func (a *App) CancelDownload() error {
	return a.cancelDownloadInternal()
}

// PauseDownload pauses the current download gracefully
//
//export PauseDownload
func (a *App) PauseDownload() error {
	return a.pauseDownloadInternal()
}

// GetDownloadPath returns a suggested download path
//
//export GetDownloadPath
func (a *App) GetDownloadPath(title string) string {
	return a.getDownloadPathInternal(title)
}

// SelectDownloadDirectory opens a dialog to select the download directory
//
//export SelectDownloadDirectory
func (a *App) SelectDownloadDirectory() (string, error) {
	return a.selectDownloadDirectoryInternal()
}

// GetDownloadDirectory returns the current download directory
//
//export GetDownloadDirectory
func (a *App) GetDownloadDirectory() string {
	return a.getDownloadDirectoryInternal()
}

// SetDownloadDirectory sets the download directory programmatically
//
//export SetDownloadDirectory
func (a *App) SetDownloadDirectory(path string) error {
	return a.setDownloadDirectoryInternal(path)
}

// GetSettings returns the current application settings as JSON
//
//export GetSettings
func (a *App) GetSettings() (string, error) {
	return a.getSettingsAsJSON()
}

// UpdateSettingsWithCookiesFile updates the application settings with cookies file
//
//export UpdateSettingsWithCookiesFile
func (a *App) UpdateSettingsWithCookiesFile(proxyMode, proxyAddress, cookiesMode, cookiesBrowser, cookiesFile string) error {
	return a.updateSettingsWithCookiesFile(proxyMode, proxyAddress, cookiesMode, cookiesBrowser, cookiesFile)
}

// UpdateAutoRedirectToQueue updates the auto redirect to queue setting
//
//export UpdateAutoRedirectToQueue
func (a *App) UpdateAutoRedirectToQueue(autoRedirect bool) error {
	a.settings.AutoRedirectToQueue = autoRedirect

	err := a.saveSettings()
	if err != nil {
		return err
	}

	return nil
}

// GetYtDlpVersion returns the current yt-dlp version
//
//export GetYtDlpVersion
func (a *App) GetYtDlpVersion() (string, error) {
	return a.getYtDlpVersionInternal()
}

// GetLatestYtDlpVersion returns the latest yt-dlp version
//
//export GetLatestYtDlpVersion
func (a *App) GetLatestYtDlpVersion() (string, error) {
	return a.getLatestYtDlpVersionInternal()
}

// UpdateYtDlp updates yt-dlp to the latest version
//
//export UpdateYtDlp
func (a *App) UpdateYtDlp() error {
	return a.updateYtDlpInternal()
}

// ValidateCookiesFile validates if the cookies file exists and is accessible
//
//export ValidateCookiesFile
func (a *App) ValidateCookiesFile(filePath string) (bool, error) {
	return a.validateCookiesFileInternal(filePath)
}

// OpenInExplorer opens the file explorer at the specified path
//
//export OpenInExplorer
func (a *App) OpenInExplorer(path string) error {
	return a.openInExplorerInternal(path)
}

// ConvertVideo converts a video file to a different format using FFmpeg
//
//export ConvertVideo
func (a *App) ConvertVideo(sourcePath, targetFormat string) error {
	return a.convertVideoInternal(sourcePath, targetFormat)
}

// GetActualDownloadPath returns the actual path of the downloaded file
//
//export GetActualDownloadPath
func (a *App) GetActualDownloadPath(title string) (string, error) {
	return a.getActualDownloadPathInternal(title)
}

// GetCurrentVersion returns the current application version
//
//export GetCurrentVersion
func (a *App) GetCurrentVersion() string {
	return GetCurrentVersion()
}

// GetLatestVersion returns the latest version from GitHub
//
//export GetLatestVersion
func (a *App) GetLatestVersion() (string, error) {
	return GetLatestVersion()
}

// CheckForUpdate checks if a newer version is available
//
//export CheckForUpdate
func (a *App) CheckForUpdate() (string, error) {
	return CheckForUpdate()
}

// ShouldUpdate checks if an update is available and returns update info
//
//export ShouldUpdate
func (a *App) ShouldUpdate() (bool, string, error) {
	return ShouldUpdate()
}

// GetUpdateDownloadUrl returns the appropriate download URL for the current platform
//
//export GetUpdateDownloadUrl
func (a *App) GetUpdateDownloadUrl() (string, error) {
	return GetUpdateDownloadUrl()
}

// GetReleaseNotes returns the release notes for the latest version
//
//export GetReleaseNotes
func (a *App) GetReleaseNotes() (string, error) {
	return GetReleaseNotes()
}

// UpdateJSRuntimeSetting updates the JS runtime setting
//
//export UpdateJSRuntimeSetting
func (a *App) UpdateJSRuntimeSetting(useJSRuntime bool) error {
	a.settings.UseJSRuntime = useJSRuntime

	err := a.saveSettings()
	if err != nil {
		return err
	}

	return nil
}

// DownloadDeno downloads deno with progress reporting
//
//export DownloadDeno
func (a *App) DownloadDeno() error {
	return a.downloadDenoWithProgress()
}

// IsDenoAvailable checks if deno is available
//
//export IsDenoAvailable
func (a *App) IsDenoAvailable() bool {
	return a.isDenoAvailable()
}

// GetDenoVersion returns the current deno version
//
//export GetDenoVersion
func (a *App) GetDenoVersion() (string, error) {
	return a.getDenoVersion()
}

// GetLatestDenoVersion returns the latest deno version from GitHub
//
//export GetLatestDenoVersion
func (a *App) GetLatestDenoVersion() (string, error) {
	return a.getLatestDenoVersion()
}

// InstallDeno downloads and installs deno
//
//export InstallDeno
func (a *App) InstallDeno() error {
	return a.installDeno()
}

// UpdateDeno updates deno to the latest version
//
//export UpdateDeno
func (a *App) UpdateDeno() error {
	return a.updateDeno()
}

// IsNodeAvailable checks if node.js is available in the system
//
//export IsNodeAvailable
func (a *App) IsNodeAvailable() bool {
	return a.isNodeAvailable()
}

// GetNodeVersion returns the current node.js version
//
//export GetNodeVersion
func (a *App) GetNodeVersion() (string, error) {
	return a.getNodeVersion()
}

// GetLatestNodeVersion returns the latest node.js version from nodejs.org
//
//export GetLatestNodeVersion
func (a *App) GetLatestNodeVersion() (string, error) {
	return a.getLatestNodeVersion()
}

// InstallNode installs the latest version of node.js
//
//export InstallNode
func (a *App) InstallNode() error {
	return a.installNode()
}

// UpdateNode updates node.js to the latest version
//
//export UpdateNode
func (a *App) UpdateNode() error {
	return a.updateNode()
}

// GetJSRuntimeType returns the current JS runtime type
//
//export GetJSRuntimeType
func (a *App) GetJSRuntimeType() string {
	return a.settings.JSRuntimeType
}

// UpdateJSRuntimeType updates the JS runtime type setting
//
//export UpdateJSRuntimeType
func (a *App) UpdateJSRuntimeType(runtimeType string) error {
	a.settings.JSRuntimeType = runtimeType
	err := a.saveSettings()
	if err != nil {
		return err
	}
	return nil
}

// SelectCookiesFile opens a file dialog to select a cookies file
//
//export SelectCookiesFile
func (a *App) SelectCookiesFile() (string, error) {
	return a.selectCookiesFileInternal()
}

// GetClipboardText returns the current text from clipboard
//
//export GetClipboardText
func (a *App) GetClipboardText() (string, error) {
	return a.getClipboardTextInternal()
}

// ReadLinksFromFile reads all URLs from a text file (one per line)
//
//export ReadLinksFromFile
func (a *App) ReadLinksFromFile(filePath string) (string, error) {
	return a.readLinksFromFileInternal(filePath)
}

// ProcessDroppedFiles processes files dropped via drag-and-drop
// Returns JSON array of file paths and extracted URLs
//
//export ProcessDroppedFiles
func (a *App) ProcessDroppedFiles(filePaths []string) (string, error) {
	return a.processDroppedFilesInternal(filePaths)
}

// SelectTextFile opens a file dialog to select a text file
//
//export SelectTextFile
func (a *App) SelectTextFile() (string, error) {
	return a.selectTextFileInternal()
}
