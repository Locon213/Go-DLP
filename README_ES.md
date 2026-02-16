<div align="center">
  <img src="frontend/src/assets/logo.png" alt="Go-DLP Logo" width="200" height="200" />

  # Go-DLP

  [![License](https://img.shields.io/github/license/Locon213/Go-DLP)](LICENSE)
  [![Go Version](https://img.shields.io/github/go-mod/go-version/Locon213/Go-DLP)](go.mod)
  [![Stars](https://img.shields.io/github/stars/Locon213/Go-DLP.svg)](https://github.com/Locon213/Go-DLP/stargazers)
  [![Downloads](https://img.shields.io/github/downloads/Locon213/Go-DLP/total.svg)](https://github.com/Locon213/Go-DLP/releases)

  **Cliente de escritorio yt-dlp moderno**

  Una potente aplicación multiplataforma para descargar videos de YouTube, Vimeo, TikTok, Instagram, Twitter, SoundCloud y más de 1000 otras plataformas.

  [🌐 Sitio web](https://github.com/Locon213/Go-DLP) • [📖 Documentación](#documentación) • [🐛 Problemas](https://github.com/Locon213/Go-DLP/issues) • [❤️ Patrocinar](#donar)

</div>

---

## 🍡 Selección de idioma | Language Selection | 选择语言

<div align="center">

| 🇺🇸 English | 🇷🇺 Русский | 🇺🇦 Українська | 🇨🇳 中文 | 🇪🇸 Español | 🇫🇷 Français |
|:---:|:---:|:---:|:---:|:---:|:---:|
| [README.md](README.md) | [README_RU.md](README_RU.md) | [README_UK.md](README_UK.md) | [README_ZH.md](README_ZH.md) | **README_ES.md** | [README_FR.md](README_FR.md) |

| 🇩🇪 Deutsch | 🇵🇹 Português | 🇯🇵 日本語 | 🇰🇷 한국어 | 🇸🇦 العربية |
|:---:|:---:|:---:|:---:|:---:|
| [README_DE.md](README_DE.md) | [README_PT.md](README_PT.md) | [README_JA.md](README_JA.md) | [README_KO.md](README_KO.md) | [README_AR.md](README_AR.md) |

</div>

---

## 🌟 Características

- ⚡ **Ultra rápido**: Optimizado para velocidad y eficiencia
- 🔐 **Seguro y privado**: Sin servidores externos involucrados
- 🎥 **Alta calidad**: Mantiene la calidad original
- 🌍 **Soporte multilingüe**: Disponible en 11 idiomas
- 💻 **Multiplataforma**: Funciona en Windows, macOS y Linux
- 🎨 **Interfaz moderna**: Interfaz hermosa e intuitiva
- 📁 **Selección de formato**: Elige entre múltiples formatos de video/audio
- 🔄 **Convertidor integrado**: Convierte videos a diferentes formatos
- 🛡️ **Soporte de proxy**: Configura proxy para redes restringidas
- 🍪 **Soporte de cookies**: Extrae cookies del navegador o usa archivos de cookies personalizados

## 📋 Requisitos

- Windows 7 o posterior, macOS 10.12 o posterior, o Linux
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) instalado y accesible desde PATH
- Conexión a Internet para descargar videos

## 🚀 Instalación

### Binarios precompilados

1. Descarga la última versión desde la [página de lanzamientos](https://github.com/Locon213/Go-DLP/releases)
2. Extrae el archivo
3. Ejecuta el archivo ejecutable

### Compilar desde el código fuente

1. Instala [Go](https://golang.org/) (versión 1.25.5 o posterior)
2. Instala [Node.js](https://nodejs.org/) (para compilar el frontend)
3. Clona el repositorio:
   ```bash
   git clone https://github.com/Locon213/Go-DLP.git
   cd Go-DLP
   ```
4. Instala las dependencias:
   ```bash
   go mod tidy
   cd frontend && npm install
   ```
5. Compila la aplicación:
   ```bash
   wails build
   ```
6. Ejecuta la aplicación:
   El ejecutable compilado estará en el directorio `build/bin/`:
   ```bash
   ./build/bin/go-dlp
   ```

## 📖 Documentación

### Uso básico

1. Inicia la aplicación Go-DLP
2. Ingresa la URL del video que deseas descargar
3. Haz clic en "Analizar y descargar" para ver los formatos disponibles
4. Selecciona tu formato y calidad preferidos
5. Elige la ubicación de descarga
6. Espera a que se complete la descarga

### Funciones avanzadas

#### Selección de formato
- Navega por todos los formatos disponibles para el video
- Filtra por resolución, tamaño de archivo y calidad
- Vista previa de los detalles del formato antes de descargar

#### Convertidor integrado
- Convierte videos descargados a diferentes formatos
- Soporta formatos comunes de video y audio
- Capacidades de conversión por lotes

#### Configuración de proxy
- Configura las opciones de proxy del sistema
- Configuración manual de proxy
- Omite el proxy para dominios específicos

#### Soporte de cookies
- Extrae cookies de tu navegador
- Importa archivos de cookies personalizados
- Maneja contenido con restricciones de edad

## 🤝 Contribuciones

¡Agradecemos las contribuciones de todos! Así puedes ayudar:

1. Haz fork del repositorio
2. Crea una rama de función (`git checkout -b feature/amazing-feature`)
3. Guarda tus cambios (`git commit -m 'Add amazing feature'`)
4. Envía los cambios a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Guía de traducción

Para contribuir con traducciones:

1. Encuentra los archivos de traducción en `frontend/src/i18n/lang/`
2. Busca el archivo de tu idioma (por ejemplo, `uk.ts` para ucraniano) o crea uno nuevo
3. Agrega tus traducciones siguiendo la estructura existente (usando el tipo `PartialTranslations`)
4. Actualiza el array `supportedLanguages` en `frontend/src/i18n/index.ts` con tu idioma
5. Actualiza los archivos README para incluir tu idioma
6. Envía un pull request con tus cambios

**Nota:** El sistema usa inglés como respaldo, así que no necesitas traducir cada clave: las traducciones faltantes usarán automáticamente el texto en inglés.

## 📄 Licencia

Este proyecto está licenciado bajo la GNU General Public License v3.0 (GPLv3) - consulta el archivo [LICENSE](LICENSE).

### Puntos clave de GPL v3:

- Puedes ejecutar, estudiar, compartir y modificar el software libremente
- Puedes distribuir versiones modificadas bajo la misma licencia
- Debes revelar el código fuente de tus modificaciones
- Debes licenciar tus modificaciones bajo los mismos términos
- El software viene sin garantía

## 🙏 Agradecimientos

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - La tecnología principal detrás de Go-DLP
- [Wails](https://wails.io/) - Framework para crear aplicaciones de escritorio con Go y tecnologías web
- [Comunidad yt-dlp](https://github.com/yt-dlp/yt-dlp) - Por mantener el motor de descarga subyacente
- Todos los contribuidores que ayudaron a traducir y mejorar Go-DLP

## ❤️ Donar

Si Go-DLP te es útil, considera apoyar el proyecto:

- Bitcoin (BTC): `bc1qgwur4cgs3hpzl7quc4p0yrvjw50326sxkdxldv`
- Ethereum (ERC20): `0x9aa8eB123f24B917a0955C37DeBCb2Ee7281e51d`
- TON (TON): `UQDh1PIoVthF_SRFd6x2sRNkcYRDCJ_cbi7SkAqxDBN7AAMV`
- Tether (USDT,TRC20): `TCoeX2c5L2yyeiEZ3oK2nnjpgmSxgnr9N2`

## 🐛 Informar problemas

Si encuentras algún problema, por favor [abre un issue](https://github.com/Locon213/Go-DLP/issues) con:

- Descripción detallada del problema
- Pasos para reproducir
- Comportamiento esperado
- Comportamiento actual
- Capturas de pantalla si aplica
- Tu sistema operativo y versión de Go-DLP

## 🆘 Soporte

Para ayuda adicional:

- Busca en los [issues](https://github.com/Locon213/Go-DLP/issues) existentes
- Únete a nuestras [Discusiones](https://github.com/Locon213/Go-DLP/discussions)

---

<div align="center">
  <sub>Creado con ❤️ por <a href="https://github.com/Locon213">Locon213</a></sub>
</div>
