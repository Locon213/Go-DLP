<div align="center">
  <img src="frontend/src/assets/logo.png" alt="Go-DLP Logo" width="200" height="200" />

  # Go-DLP

  [![License](https://img.shields.io/github/license/Locon213/Go-DLP)](LICENSE)
  [![Go Version](https://img.shields.io/github/go-mod/go-version/Locon213/Go-DLP)](go.mod)
  [![Stars](https://img.shields.io/github/stars/Locon213/Go-DLP.svg)](https://github.com/Locon213/Go-DLP/stargazers)
  [![Downloads](https://img.shields.io/github/downloads/Locon213/Go-DLP/total.svg)](https://github.com/Locon213/Go-DLP/releases)

  **Moderner yt-dlp Desktop-Client**

  Eine leistungsstarke plattformübergreifende Desktop-Anwendung zum Herunterladen von Videos von YouTube, Vimeo, TikTok, Instagram, Twitter, SoundCloud und über 1000 anderen Plattformen.

  [🌐 Website](https://github.com/Locon213/Go-DLP) • [📖 Dokumentation](#dokumentation) • [🐛 Probleme](https://github.com/Locon213/Go-DLP/issues) • [❤️ Sponsor](#spenden)

</div>

---

## 🌍 Sprachauswahl | Language Selection | 选择语言

<div align="center">

| 🇺🇸 English | 🇷🇺 Русский | 🇨🇳 中文 | 🇪🇸 Español | 🇫🇷 Français |
|:---:|:---:|:---:|:---:|:---:|
| [README.md](README.md) | [README_RU.md](README_RU.md) | [README_ZH.md](README_ZH.md) | [README_ES.md](README_ES.md) | [README_FR.md](README_FR.md) |

| 🇩🇪 Deutsch | 🇵🇹 Português | 🇯🇵 日本語 | 🇰🇷 한국어 | 🇸🇦 العربية |
|:---:|:---:|:---:|:---:|:---:|
| **README_DE.md** | [README_PT.md](README_PT.md) | [README_JA.md](README_JA.md) | [README_KO.md](README_KO.md) | [README_AR.md](README_AR.md) |

</div>

---

## 🌟 Funktionen

- ⚡ **Blitzschnell**: Optimiert für Geschwindigkeit und Effizienz
- 🔐 **Sicher & Privat**: Keine externen Server beteiligt
- 🎥 **Hohe Qualität**: Originalqualität beibehalten
- 🌍 **Mehrsprachige Unterstützung**: Verfügbar in 10 Sprachen
- 💻 **Plattformübergreifend**: Funktioniert unter Windows, macOS und Linux
- 🎨 **Moderne Benutzeroberfläche**: Schöne, intuitive Oberfläche
- 📁 **Formatauswahl**: Auswahl aus mehreren Video-/Audioformaten
- 🔄 **Integrierter Konverter**: Konvertiert Videos in verschiedene Formate
- 🛡️ **Proxy-Unterstützung**: Proxy-Einstellungen für eingeschränkte Netzwerke
- 🍪 **Cookie-Unterstützung**: Cookies aus Browsern extrahieren oder benutzerdefinierte Cookie-Dateien verwenden

## 📋 Anforderungen

- Windows 7 oder höher, macOS 10.12 oder höher, oder Linux
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installiert und im PATH verfügbar
- Internetverbindung zum Herunterladen von Videos

## 🚀 Installation

### Vorkompilierte Binärdateien

1. Laden Sie die neueste Version von der [Release-Seite](https://github.com/Locon213/Go-DLP/releases) herunter
2. Entpacken Sie das Archiv
3. Führen Sie die ausführbare Datei aus

### Aus dem Quellcode kompilieren

1. Installieren Sie [Go](https://golang.org/) (Version 1.25.5 oder höher)
2. Installieren Sie [Node.js](https://nodejs.org/) (für den Frontend-Build)
3. Klonen Sie das Repository:
   ```bash
   git clone https://github.com/Locon213/Go-DLP.git
   cd Go-DLP
   ```
4. Installieren Sie die Abhängigkeiten:
   ```bash
   go mod tidy
   cd frontend && npm install
   ```
5. Kompilieren Sie die Anwendung:
   ```bash
   go build -o go-dlp .
   ```
6. Führen Sie die Anwendung aus:
   ```bash
   ./go-dlp
   ```

## 📖 Dokumentation

### Grundlegende Verwendung

1. Starten Sie die Go-DLP-Anwendung
2. Geben Sie die URL des Videos ein, das Sie herunterladen möchten
3. Klicken Sie auf "Analysieren & Herunterladen", um verfügbare Formate abzurufen
4. Wählen Sie Ihr bevorzugtes Format und die Qualität
5. Wählen Sie den Download-Speicherort
6. Warten Sie, bis der Download abgeschlossen ist

### Erweiterte Funktionen

#### Formatauswahl
- Durchsuchen Sie alle verfügbaren Formate für das Video
- Filtern Sie nach Auflösung, Dateigröße und Qualität
- Vorschau der Formatdetails vor dem Herunterladen

#### Integrierter Konverter
- Konvertieren Sie heruntergeladene Videos in verschiedene Formate
- Unterstützt gängige Video- und Audioformate
- Stapelkonvertierungsfunktionen

#### Proxy-Konfiguration
- System-Proxy-Einstellungen konfigurieren
- Manuelle Proxy-Konfiguration einrichten
- Proxy für bestimmte Domänen umgehen

#### Cookie-Unterstützung
- Cookies aus Ihrem Browser extrahieren
- Benutzerdefinierte Cookie-Dateien importieren
- Altersbeschränkten Inhalt handhaben

## 🤝 Beiträge

Wir freuen uns über Beiträge von allen! So können Sie helfen:

1. Forken Sie das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. Pushen Sie zum Branch (`git push origin feature/amazing-feature`)
5. Öffnen Sie einen Pull Request

### Übersetzungshandbuch

Um Übersetzungen beizutragen:

1. Finden Sie die Übersetzungsdateien in `frontend/src/i18n/translations.ts`
2. Fügen Sie Ihre Übersetzungen nach der bestehenden Struktur hinzu
3. Aktualisieren Sie das `supportedLanguages`-Array mit Ihrer Sprache
4. Senden Sie einen Pull Request mit Ihren Änderungen

## 📄 Lizenz

Dieses Projekt ist unter der GNU General Public License v3.0 (GPLv3) lizenziert - see the [LICENSE](LICENSE) file.

### Wichtige Punkte der GPL v3:

- Sie können die Software frei ausführen, studieren, teilen und modifizieren
- Sie können modifizierte Versionen unter derselben Lizenz vertreiben
- Sie müssen den Quellcode Ihrer Modifikationen offenlegen
- Sie müssen Ihre Modifikationen unter denselben Bedingungen lizenzieren
- Die Software wird ohne Garantie bereitgestellt

## 🙏 Danksagungen

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Die Kerntechnologie hinter Go-DLP
- [Wails](https://wails.io/) - Framework zum Erstellen von Desktop-Anwendungen mit Go und Web-Technologien
- [yt-dlp Community](https://github.com/yt-dlp/yt-dlp) - Für die Wartung der zugrunde liegenden Download-Engine
- Alle Mitwirkenden, die bei der Übersetzung und Verbesserung von Go-DLP geholfen haben

## ❤️ Spenden

Wenn Sie Go-DLP nützlich finden, erwägen Sie bitte, das Projekt zu unterstützen:

- Bitcoin (BTC): `bc1qgwur4cgs3hpzl7quc4p0yrvjw50326sxkdxldv`
- Ethereum (ERC20): `0x9aa8eB123f24B917a0955C37DeBCb2Ee7281e51d`
- TON (TON): `UQDh1PIoVthF_SRFd6x2sRNkcYRDCJ_cbi7SkAqxDBN7AAMV`
- Tether (USDT,TRC20): `TCoeX2c5L2yyeiEZ3oK2nnjpgmSxgnr9N2`

## 🐛 Probleme melden

Wenn Sie auf Probleme stoßen, bitte [ein Issue öffnen](https://github.com/Locon213/Go-DLP/issues) mit:

- Detaillierter Beschreibung des Problems
- Schritten zur Reproduktion
- Erwartetem Verhalten
- Tatsächlichem Verhalten
- Screenshots falls zutreffend
- Ihrem Betriebssystem und Go-DLP-Version

## 🆘 Support

Für weitere Hilfe:

- Durchsuchen Sie vorhandene [Issues](https://github.com/Locon213/Go-DLP/issues)
- Nehmen Sie an unseren [Diskussionen](https://github.com/Locon213/Go-DLP/discussions) teil

---

<div align="center">
  <sub>Erstellt mit ❤️ von <a href="https://github.com/Locon213">Locon213</a></sub>
</div>
