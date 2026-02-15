package main

// Settings struct to hold application settings
type Settings struct {
	ProxyMode           string `json:"proxy_mode"`             // "none", "system", "manual"
	ProxyAddress        string `json:"proxy_address"`          // Manual proxy address when ProxyMode is "manual"
	CookiesMode         string `json:"cookies_mode"`           // "none", "browser", "file"
	CookiesBrowser      string `json:"cookies_browser"`        // Browser name when CookiesMode is "browser": "chrome", "firefox", etc.
	CookiesFile         string `json:"cookies_file"`           // Path to cookies file when CookiesMode is "file"
	Language            string `json:"language"`               // Language code: "ru", "en", "zh", etc.
	AutoRedirectToQueue bool   `json:"auto_redirect_to_queue"` // Automatically redirect to queue screen after adding download
	UseJSRuntime        bool   `json:"use_js_runtime"`         // Use JavaScript runtime for YouTube and other sites that require it
}

// VideoInfo represents the video metadata from yt-dlp
type VideoInfo struct {
	ID          string      `json:"id"`
	Title       string      `json:"title"`
	Duration    float64     `json:"duration"`
	Thumbnail   string      `json:"thumbnail"`
	Formats     []Format    `json:"formats"`
	WebpageURL  string      `json:"webpage_url"`
	Description string      `json:"description"`
	Uploader    string      `json:"uploader"`
	ViewCount   interface{} `json:"view_count"` // Can be int or null
}

// Format represents a downloadable format
type Format struct {
	FormatID       string      `json:"format_id"`
	FormatNote     string      `json:"format_note"`
	Ext            string      `json:"ext"`
	Resolution     string      `json:"resolution"`
	FileSize       interface{} `json:"filesize"`
	FileSizeApprox interface{} `json:"filesize_approx"`
	FileSizeHuman  string      `json:"filesize_human,omitempty"` // Human-readable file size (can contain ~ prefix)
	VCodec         string      `json:"vcodec"`
	ACodec         string      `json:"acodec"`
	URL            string      `json:"url"`
}

// PlaylistInfo represents playlist metadata
type PlaylistInfo struct {
	ID          string          `json:"id"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	EntryCount  int             `json:"entry_count"`
	Entries     []PlaylistEntry `json:"entries"`
}

// PlaylistEntry represents a single item in a playlist
type PlaylistEntry struct {
	ID        string  `json:"id"`
	Title     string  `json:"title"`
	Thumbnail string  `json:"thumbnail"`
	URL       string  `json:"url"`
	Duration  float64 `json:"duration"`
}
