<div align="center">
  <img src="frontend/src/assets/logo.png" alt="Go-DLP Logo" width="200" height="200" />

  # Go-DLP

  [![License](https://img.shields.io/github/license/Locon213/Go-DLP)](LICENSE)
  [![Go Version](https://img.shields.io/github/go-mod/go-version/Locon213/Go-DLP)](go.mod)
  [![Stars](https://img.shields.io/github/stars/Locon213/Go-DLP.svg)](https://github.com/Locon213/Go-DLP/stargazers)
  [![Downloads](https://img.shields.io/github/downloads/Locon213/Go-DLP/total.svg)](https://github.com/Locon213/Go-DLP/releases)

  **Modern yt-dlp Desktop Client**

  A powerful, cross-platform desktop application for downloading videos from YouTube, Vimeo, TikTok, Instagram, Twitter, SoundCloud and 1000+ other platforms.

  [🌐 Website](https://github.com/Locon213/Go-DLP) • [📖 Documentation](#documentation) • [🐛 Issues](https://github.com/Locon213/Go-DLP/issues) • [❤️ Sponsor](#donate)

</div>

---

## 🌍 Language Selection | 选择语言 | Seleccionar idioma

<div align="center">

| 🇺🇸 English | 🇷🇺 Русский | 🇺🇦 Українська | 🇨🇳 中文 | 🇪🇸 Español | 🇫🇷 Français |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **README.md** | [README_RU.md](README_RU.md) | [README_UK.md](README_UK.md) | [README_ZH.md](README_ZH.md) | [README_ES.md](README_ES.md) | [README_FR.md](README_FR.md) |

| 🇩🇪 Deutsch | 🇵🇹 Português | 🇯🇵 日本語 | 🇰🇷 한국어 | 🇸🇦 العربية |
|:---:|:---:|:---:|:---:|:---:|
| [README_DE.md](README_DE.md) | [README_PT.md](README_PT.md) | [README_JA.md](README_JA.md) | [README_KO.md](README_KO.md) | [README_AR.md](README_AR.md) |

</div>

---

## 🌟 Features

- ⚡ **Lightning Fast**: Optimized for speed and efficiency
- 🔐 **Secure & Private**: No external servers involved
- 🎥 **High Quality**: Maintain original quality
- 🌍 **Multilingual Support**: Available in 11 languages
- 💻 **Cross-Platform**: Works on Windows, macOS, and Linux
- 🎨 **Modern UI**: Beautiful, intuitive interface
- 📁 **Format Selection**: Choose from multiple video/audio formats
- 🔄 **Built-in Converter**: Convert videos to different formats
- 🛡️ **Proxy Support**: Configure proxy settings for restricted networks
- 🍪 **Cookie Support**: Extract cookies from browsers or use custom cookie files

## 📋 Requirements

- Windows 7 or later, macOS 10.12 or later, or Linux
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed and accessible from PATH
- Internet connection for downloading videos

## 🚀 Installation

### Pre-built Binaries

1. Download the latest release from the [Releases page](https://github.com/Locon213/Go-DLP/releases)
2. Extract the archive
3. Run the executable file

### Building from Source

1. Install [Go](https://golang.org/) (version 1.25.5 or later)
2. Install [Node.js](https://nodejs.org/) (for frontend build)
3. Clone the repository:
   ```bash
   git clone https://github.com/Locon213/Go-DLP.git
   cd Go-DLP
   ```
4. Install dependencies:
   ```bash
   go mod tidy
   cd frontend && npm install
   ```
5. Build the application:
   ```bash
   wails build
   ```
6. Run the application:
   The compiled executable will be in `build/bin/` directory:
   ```bash
   ./build/bin/go-dlp
   ```

## 📖 Documentation

### Basic Usage

1. Launch the Go-DLP application
2. Enter the URL of the video you want to download
3. Click "Analyze & Download" to fetch available formats
4. Select your preferred format and quality
5. Choose the download location
6. Wait for the download to complete

### Advanced Features

#### Format Selection
- Browse all available formats for the video
- Filter by resolution, file size, and quality
- Preview format details before downloading

#### Built-in Converter
- Convert downloaded videos to different formats
- Supports common video and audio formats
- Batch conversion capabilities

#### Proxy Configuration
- Configure system proxy settings
- Set up manual proxy configuration
- Bypass proxy for specific domains

#### Cookie Support
- Extract cookies from your browser
- Import custom cookie files
- Handle age-restricted content

## 🤝 Contributing

We welcome contributions from everyone! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Translation Guide

To contribute translations:

1. Locate the translation files in `frontend/src/i18n/lang/`
2. Find your language file (e.g., `uk.ts` for Ukrainian) or create a new one
3. Add your translations following the existing structure (using `PartialTranslations` type)
4. Update the `supportedLanguages` array in `frontend/src/i18n/index.ts` with your language
5. Update the README files to include your language
6. Submit a pull request with your changes

**Note:** The system uses English as a fallback, so you don't need to translate every key - missing translations will automatically use English text.

## 📄 License

This project is licensed under the GNU General Public License v3.0 (GPLv3) - see the [LICENSE](LICENSE) file for details.

### GPL v3 Key Points:

- You can freely run, study, share, and modify the software
- You can distribute modified versions under the same license
- You must disclose the source code of your modifications
- You must license your modifications under the same terms
- The software comes with no warranty

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The core technology behind Go-DLP
- [Wails](https://wails.io/) - Framework for building desktop applications with Go and web technologies
- [yt-dlp community](https://github.com/yt-dlp/yt-dlp) - For maintaining the underlying download engine
- All contributors who helped translate and improve Go-DLP

## ❤️ Donate

If you find Go-DLP useful, consider supporting the project:

- Bitcoin (BTC): `bc1qgwur4cgs3hpzl7quc4p0yrvjw50326sxkdxldv`
- Ethereum (ERC20): `0x9aa8eB123f24B917a0955C37DeBCb2Ee7281e51d`
- TON (TON): `UQDh1PIoVthF_SRFd6x2sRNkcYRDCJ_cbi7SkAqxDBN7AAMV`
- Tether (USDT,TRC20): `TCoeX2c5L2yyeiEZ3oK2nnjpgmSxgnr9N2`

## 🐛 Reporting Issues

If you encounter any problems, please [open an issue](https://github.com/Locon213/Go-DLP/issues) with:

- Detailed description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your operating system and Go-DLP version

## 🆘 Support

For additional help:

- Search existing [issues](https://github.com/Locon213/Go-DLP/issues)
- Join our [Discussions](https://github.com/Locon213/Go-DLP/discussions)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Locon213">Locon213</a></sub>
</div>
