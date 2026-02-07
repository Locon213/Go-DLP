<div align="center">
  <img src="frontend/src/assets/logo.png" alt="Go-DLP Logo" width="200" height="200" />

  # Go-DLP

  [![License](https://img.shields.io/github/license/Locon213/Go-DLP)](LICENSE)
  [![Go Version](https://img.shields.io/github/go-mod/go-version/Locon213/Go-DLP)](go.mod)
  [![Stars](https://img.shields.io/github/stars/Locon213/Go-DLP.svg)](https://github.com/Locon213/Go-DLP/stargazers)
  [![Downloads](https://img.shields.io/github/downloads/Locon213/Go-DLP/total.svg)](https://github.com/Locon213/Go-DLP/releases)

  **现代 yt-dlp 桌面客户端**

  一款功能强大的跨平台桌面应用程序，用于从 YouTube、Vimeo、TikTok、Instagram、Twitter、SoundCloud 和 1000+ 其他平台下载视频。

  [🌐 网站](https://github.com/Locon213/Go-DLP) • [📖 文档](#文档) • [🐛 问题](https://github.com/Locon213/Go-DLP/issues) • [❤️ 赞助](#赞助)

</div>

---

## 🍙 语言选择 | Language Selection | Seleccionar idioma

<div align="center">

| 🇺🇸 English | 🇷🇺 Русский | 🇨🇳 中文 | 🇪🇸 Español | 🇫🇷 Français |
|:---:|:---:|:---:|:---:|:---:|
| [README.md](README.md) | [README_RU.md](README_RU.md) | **README_ZH.md** | [README_ES.md](README_ES.md) | [README_FR.md](README_FR.md) |

| 🇩🇪 Deutsch | 🇵🇹 Português | 🇯🇵 日本語 | 🇰🇷 한국어 | 🇸🇦 العربية |
|:---:|:---:|:---:|:---:|:---:|
| [README_DE.md](README_DE.md) | [README_PT.md](README_PT.md) | [README_JA.md](README_JA.md) | [README_KO.md](README_KO.md) | [README_AR.md](README_AR.md) |

</div>

---

## 🌟 功能特点

- ⚡ **闪电般快速**：针对速度和效率进行了优化
- 🔐 **安全私密**：不涉及外部服务器
- 🎥 **高质量**：保持原始质量
- 🌍 **多语言支持**：支持 10 种语言
- 💻 **跨平台**：适用于 Windows、macOS 和 Linux
- 🎨 **现代界面**：美观直观的界面
- 📁 **格式选择**：多种视频/音频格式可选
- 🔄 **内置转换器**：将视频转换为不同格式
- 🛡️ **代理支持**：为受限网络配置代理设置
- 🍪 **Cookie 支持**：从浏览器提取 Cookie 或使用自定义 Cookie 文件

## 📋 系统要求

- Windows 7 或更高版本、macOS 10.12 或更高版本，或 Linux
- 已安装 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 并可在 PATH 中访问
- 用于下载视频的互联网连接

## 🚀 安装

### 预构建二进制文件

1. 从 [发布页面](https://github.com/Locon213/Go-DLP/releases) 下载最新版本
2. 解压归档文件
3. 运行可执行文件

### 从源码构建

1. 安装 [Go](https://golang.org/)（1.25.5 或更高版本）
2. 安装 [Node.js](https://nodejs.org/)（用于前端构建）
3. 克隆仓库：
   ```bash
   git clone https://github.com/Locon213/Go-DLP.git
   cd Go-DLP
   ```
4. 安装依赖：
   ```bash
   go mod tidy
   cd frontend && npm install
   ```
5. 构建应用程序：
   ```bash
   wails build
   ```
6. 运行应用程序：
    编译后的可执行文件将位于 `build/bin/` 目录中：
   ```bash
   ./build/bin/go-dlp
   ```

## 📖 文档

### 基本使用

1. 启动 Go-DLP 应用程序
2. 输入要下载的视频的 URL
3. 点击"分析并下载"以获取可用格式
4. 选择首选的格式和质量
5. 选择下载位置
6. 等待下载完成

### 高级功能

#### 格式选择
- 浏览视频的所有可用格式
- 按分辨率、文件大小和质量筛选
- 下载前预览格式详情

#### 内置转换器
- 将下载的视频转换为不同格式
- 支持常见的视频和音频格式
- 批量转换功能

#### 代理配置
- 配置系统代理设置
- 设置手动代理配置
- 绕过特定域名的代理

#### Cookie 支持
- 从浏览器提取 Cookie
- 导入自定义 Cookie 文件
- 处理年龄限制内容

## 🤝 贡献

我们欢迎大家的贡献！以下是您可以帮助的方式：

1. Fork 该仓库
2. 创建一个功能分支（`git checkout -b feature/amazing-feature`）
3. 提交您的更改（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

### 翻译指南

要贡献翻译：

1. 在 `frontend/src/i18n/translations.ts` 中找到翻译文件
2. 按照现有结构添加翻译
3. 使用您的语言更新 `supportedLanguages` 数组
4. 提交包含您的更改的 pull request

## 📄 许可证

本项目根据 GNU 通用公共许可证 v3.0 (GPLv3) 授权 - 请参阅 [LICENSE](LICENSE) 文件。

### GPL v3 关键要点：

- 您可以自由运行、学习、共享和修改软件
- 您可以在相同许可证下分发修改后的版本
- 您必须披露修改的源代码
- 您必须根据相同条款对修改进行授权
- 软件不提供任何保证

## 🙏 致谢

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Go-DLP 的核心技术
- [Wails](https://wails.io/) - 使用 Go 和 Web 技术构建桌面应用程序的框架
- [yt-dlp 社区](https://github.com/yt-dlp/yt-dlp) - 维护底层下载引擎
- 所有帮助翻译和改进 Go-DLP 的贡献者

## ❤️ 赞助

如果您发现 Go-DLP 有用，请考虑支持该项目：

- 比特币 (BTC): `bc1qgwur4cgs3hpzl7quc4p0yrvjw50326sxkdxldv`
- 以太坊 (ERC20): `0x9aa8eB123f24B917a0955C37DeBCb2Ee7281e51d`
- TON (TON): `UQDh1PIoVthF_SRFd6x2sRNkcYRDCJ_cbi7SkAqxDBN7AAMV`
- 泰达币 (USDT,TRC20): `TCoeX2c5L2yyeiEZ3oK2nnjpgmSxgnr9N2`

## 🐛 报告问题

如果您遇到任何问题，请 [打开 issue](https://github.com/Locon213/Go-DLP/issues)，并包含：

- 问题的详细描述
- 重现步骤
- 预期行为
- 实际行为
- 截图（如适用）
- 您的操作系统和 Go-DLP 版本

## 🆘 支持

获取更多帮助：

- 搜索现有的 [issues](https://github.com/Locon213/Go-DLP/issues)
- 加入我们的 [讨论](https://github.com/Locon213/Go-DLP/discussions)

---

<div align="center">
  <sub>由 <a href="https://github.com/Locon213">Locon213</a> 用 ❤️ 构建</sub>
</div>
