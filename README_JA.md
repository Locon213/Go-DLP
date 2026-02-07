<div align="center">
  <img src="frontend/src/assets/logo.png" alt="Go-DLP Logo" width="200" height="200" />

  # Go-DLP

  [![License](https://img.shields.io/github/license/Locon213/Go-DLP)](LICENSE)
  [![Go Version](https://img.shields.io/github/go-mod/go-version/Locon213/Go-DLP)](go.mod)
  [![Stars](https://img.shields.io/github/stars/Locon213/Go-DLP.svg)](https://github.com/Locon213/Go-DLP/stargazers)
  [![Downloads](https://img.shields.io/github/downloads/Locon213/Go-DLP/total.svg)](https://github.com/Locon213/Go-DLP/releases)

  **モダンな yt-dlp デスクトップクライアント**

  YouTube、Vimeo、TikTok、Instagram、Twitter、SoundCloud、その他1000以上のプラットフォームから動画をダウンロードするための強力なクロスプラットフォームデスクトップアプリケーション。

  [🌐 ウェブサイト](https://github.com/Locon213/Go-DLP) • [📖 ドキュメント](#ドキュメント) • [🐛 问题](https://github.com/Locon213/Go-DLP/issues) • [❤️ スポンサー](#寄付)

</div>

---

## 🌍 言語選択 | Language Selection | Seleccionar idioma

<div align="center">

| 🇺🇸 English | 🇷🇺 Русский | 🇨🇳 中文 | 🇪🇸 Español | 🇫🇷 Français |
|:---:|:---:|:---:|:---:|:---:|
| [README.md](README.md) | [README_RU.md](README_RU.md) | [README_ZH.md](README_ZH.md) | [README_ES.md](README_ES.md) | [README_FR.md](README_FR.md) |

| 🇩🇪 Deutsch | 🇵🇹 Português | 🇯🇵 日本語 | 🇰🇷 한국어 | 🇸🇦 العربية |
|:---:|:---:|:---:|:---:|:---:|
| [README_DE.md](README_DE.md) | [README_PT.md](README_PT.md) | **README_JA.md** | [README_KO.md](README_KO.md) | [README_AR.md](README_AR.md) |

</div>

---

## 🌟 機能

- ⚡ **超高速**: 速度和効率に最適化
- 🔐 **安全でプライベート**: 外部サーバーなし
- 🎥 **高品質**: オリジナル品質を維持
- 🌍 **多言語対応**: 10言語で利用可能
- 💻 **クロスプラットフォーム**: Windows、macOS、Linuxで動作
- 🎨 **モダンなUI**: 美しく直感的なインターフェース
- 📁 **フォーマット選択**: 複数の動画/音声フォーマットから選択
- 🔄 **内蔵コンバーター**: 動画を異なるフォーマットに変換
- 🛡️ **プロキシサポート**: 制限されたネットワークのプロキシ設定
- 🍪 **Cookieサポート**: ブラウザからCookieを抽出またはカスタムCookieファイルを使用

## 📋 必要条件

- Windows 7以降、macOS 10.12以降、またはLinux
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)がインストールされ、PATHからアクセス可能
- 動画をダウンロードするためのインターネット接続

## 🚀 インストール

### 事前ビルド済みバイナリ

1. [リリースページ](https://github.com/Locon213/Go-DLP/releases)から最新バージョンをダウンロード
2. アーカイブを解凍
3. 実行ファイルを実行

### ソースからビルド

1. [Go](https://golang.org/)をインストール（バージョン1.25.5以降）
2. [Node.js](https://nodejs.org/)をインストール（フロントエンドビルド用）
3. リポジトリをクローン：
   ```bash
   git clone https://github.com/Locon213/Go-DLP.git
   cd Go-DLP
   ```
4. 依存関係をインストール：
   ```bash
   go mod tidy
   cd frontend && npm install
   ```
5. アプリケーションをビルド：
   ```bash
   go build -o go-dlp .
   ```
6. アプリケーションを実行：
   ```bash
   ./go-dlp
   ```

## 📖 ドキュメント

### 基本的な使い方

1. Go-DLPアプリケーションを起動
2. ダウンロードしたい動画のURLを入力
3. 「分析してダウンロード」をクリックして利用可能なフォーマットを取得
4. 優先フォーマットと品質を選択
5. 保存場所を選択
6. ダウンロードが完了するまで待つ

### 上級者向け機能

#### フォーマット選択
- 動画のすべての利用可能なフォーマットを閲覧
- 解像度、ファイルサイズ、品質でフィルタリング
- ダウンロード前にフォーマット詳細をプレビュー

#### 内蔵コンバーター
- ダウンロードした動画を異なるフォーマットに変換
- 一般的な動画および音声フォーマットをサポート
- バッチ変換機能

#### プロキシ設定
- システムプロキシ設定を構成
- 手動プロキシ構成を設定
- 特定のドメインのプロキシをバイパス

#### Cookieサポート
- ブラウザからCookieを抽出
- カスタムCookieファイルをインポート
- 年齢制限コンテンツを処理

## 🤝 貢献

私たちは皆からの貢献を歓迎します！手伝い方法：

1. リポジトリをフォーク
2. 機能ブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature'`）
5. Pull Requestを開く

### 翻訳ガイド

翻訳に貢献するには：

1. `frontend/src/i18n/translations.ts`で翻訳ファイルを見つける
2. 既存の構造に従って翻訳を追加
3. `supportedLanguages`配列をあなたの言語で更新
4. 変更とともにpull requestを送信

## 📄 ライセンス

このプロジェクトはGNU General Public License v3.0（GPLv3）の下でライセンスされています - [LICENSE](LICENSE)ファイルを参照してください。

### GPL v3の重要ポイント：

- ソフトウェアを自由に実行、学習、共有、変更できます
- 変更したバージョンを同じライセンスの下で配布できます
- 変更のソースコードを公開する必要があります
- 変更を同じ条件の下でライセンスする必要があります
- ソフトウェアは保証なしで提供されます

## 🙏 謝辞

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Go-DLPの背後にあるコア技術
- [Wails](https://wails.io/) - GoとWebテクノロジーでデスクトップアプリケーションを構築するためのフレームワーク
- [yt-dlp コミュニティ](https://github.com/yt-dlp/yt-dlp) - 基盤となるダウンロードエンジンの維持
- Go-DLPの翻訳と改善に貢献したすべての貢献者

## ❤️ 寄付

Go-DLPが役に立ったと感じた場合は、プロジェクトを支援を検討してください：

- 比特币 (BTC): `bc1qgwur4cgs3hpzl7quc4p0yrvjw50326sxkdxldv`
- イーサリアム (ERC20): `0x9aa8eB123f24B917a0955C37DeBCb2Ee7281e51d`
- TON (TON): `UQDh1PIoVthF_SRFd6x2sRNkcYRDCJ_cbi7SkAqxDBN7AAMV`
- テザー (USDT,TRC20): `TCoeX2c5L2yyeiEZ3oK2nnjpgmSxgnr9N2`

## 🐛 問題の報告

問題が発生した場合は、[issueを開く](https://github.com/Locon213/Go-DLP/issues)：

- 問題の詳しい説明
- 再現手順
- 期待される動作
- 実際の動作
- 該当する場合はスクリーンショット
- オペレーティングシステムとGo-DLPのバージョン

## 🆘 サポート

その他のヘルプ：

- 既存の[issues](https://github.com/Locon213/Go-DLP/issues)を検索
- [ディスカッション](https://github.com/Locon213/Go-DLP/discussions)に参加

---

<div align="center">
  <sub><a href="https://github.com/Locon213">Locon213</a> ❤️ で作成</sub>
</div>
