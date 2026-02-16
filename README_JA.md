<div align="center">
  <img src="frontend/src/assets/logo.png" alt="Go-DLP Logo" width="200" height="200" />

  # Go-DLP

  [![License](https://img.shields.io/github/license/Locon213/Go-DLP)](LICENSE)
  [![Go Version](https://img.shields.io/github/go-mod/go-version/Locon213/Go-DLP)](go.mod)
  [![Stars](https://img.shields.io/github/stars/Locon213/Go-DLP.svg)](https://github.com/Locon213/Go-DLP/stargazers)
  [![Downloads](https://img.shields.io/github/downloads/Locon213/Go-DLP/total.svg)](https://github.com/Locon213/Go-DLP/releases)

  **モダンな yt-dlp デスクトップクライアント**

  YouTube、Vimeo、TikTok、Instagram、Twitter、SoundCloud、その他 1000 以上のプラットフォームから動画をダウンロードするための強力なクロスプラットフォームデスクトップアプリケーション。

  [🌐 ウェブサイト](https://github.com/Locon213/Go-DLP) • [📖 ドキュメント](#ドキュメント) • [🐛 問題](https://github.com/Locon213/Go-DLP/issues) • [❤️ スポンサー](#寄付)

</div>

---

## 🌍 言語選択 | Language Selection | Seleccionar idioma

<div align="center">

| 🇺🇸 English | 🇷🇺 Русский | 🇺🇦 Українська | 🇨🇳 中文 | 🇪🇸 Español | 🇫🇷 Français |
|:---:|:---:|:---:|:---:|:---:|:---:|
| [README.md](README.md) | [README_RU.md](README_RU.md) | [README_UK.md](README_UK.md) | [README_ZH.md](README_ZH.md) | [README_ES.md](README_ES.md) | [README_FR.md](README_FR.md) |

| 🇩🇪 Deutsch | 🇵🇹 Português | 🇯🇵 日本語 | 🇰🇷 한국어 | 🇸🇦 العربية |
|:---:|:---:|:---:|:---:|:---:|
| [README_DE.md](README_DE.md) | [README_PT.md](README_PT.md) | **README_JA.md** | [README_KO.md](README_KO.md) | [README_AR.md](README_AR.md) |

</div>

---

## 🌟 機能

- ⚡ **超高速**: 速度と効率に最適化
- 🔐 **安全でプライベート**: 外部サーバーなし
- 🎥 **高品質**: オリジナル品質を維持
- 🌍 **多言語サポート**: 11 言語対応
- 💻 **クロスプラットフォーム**: Windows、macOS、Linux で動作
- 🎨 **モダンな UI**: 美しく直感的なインターフェース
- 📁 **フォーマット選択**: 複数のビデオ/オーディオフォーマットから選択
- 🔄 **内置コンバーター**: 動画を異なるフォーマットに変換
- 🛡️ **プロキシサポート**: 制限されたネットワーク向けにプロキシ設定を構成
- 🍪 **クッキーサポート**: ブラウザからクッキーを抽出、またはカスタムクッキーファイルを使用

## 📋 要件

- Windows 7 以降、macOS 10.12 以降、または Linux
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) がインストールされ、PATH からアクセス可能
- 動画のダウンロードにはインターネット接続が必要

## 🚀 インストール

### バイナリ

1. [リリースページ](https://github.com/Locon213/Go-DLP/releases) から最新リリースをダウンロード
2. アーカイブを解凍
3. 実行ファイルを実行

### ソースからのビルド

1. [Go](https://golang.org/) をインストール (バージョン 1.25.5 以降)
2. [Node.js](https://nodejs.org/) をインストール (フロントエンドビルド用)
3. リポジトリをクローン:
   ```bash
   git clone https://github.com/Locon213/Go-DLP.git
   cd Go-DLP
   ```
4. 依存関係をインストール:
   ```bash
   go mod tidy
   cd frontend && npm install
   ```
5. アプリケーションをビルド:
   ```bash
   wails build
   ```
6. アプリケーションを実行:
   コンパイルされた実行ファイルは `build/bin/` ディレクトリにあります:
   ```bash
   ./build/bin/go-dlp
   ```

## 📖 ドキュメント

### 基本的な使い方

1. Go-DLP アプリケーションを起動
2. ダウンロードしたい動画の URL を入力
3. 「分析してダウンロード」をクリックして利用可能なフォーマットを取得
4. 希望のフォーマットと品質を選択
5. ダウンロード先を選択
6. ダウンロードが完了するのを待つ

### 高度な機能

#### フォーマット選択
- 動画の利用可能なすべてのフォーマットを閲覧
- 解像度、ファイルサイズ、品質でフィルタリング
- ダウンロード前にフォーマットの詳細をプレビュー

#### 内置コンバーター
- ダウンロードした動画を異なるフォーマットに変換
- 一般的なビデオ・オーディオフォーマットをサポート
- バッチ変換機能

#### プロキシ設定
- システムプロキシ設定を構成
- 手動プロキシ設定をセットアップ
- 特定のドメイン向けのプロキシバイパス

#### クッキーサポート
- ブラウザからクッキーを抽出
- カスタムクッキーファイルをインポート
- 年齢制限コンテンツの処理

## 🤝 貢献

私たちは皆からの貢献を歓迎します！お手伝い方法:

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を開く

### 翻訳ガイド

翻訳に貢献するには:

1. `frontend/src/i18n/lang/` で翻訳ファイルを見つける
2. あなたの言語のファイル（例：ウクライナ語なら `uk.ts`）を探すか、新規作成
3. 既存の構造に従って翻訳を追加（`PartialTranslations` タイプを使用）
4. `frontend/src/i18n/index.ts` の `supportedLanguages` 配列をあなたの言語で更新
5. あなたの言語を含むように README ファイルを更新
6. 変更とともに pull request を送信

**注意:** システムは英語をフォールバックとして使用するため、すべてのキーを翻訳する必要はありません - 欠落している翻訳は自動的に英語のテキストを使用します。

## 📄 ライセンス

このプロジェクトは GNU General Public License v3.0（GPLv3）の下でライセンスされています - [LICENSE](LICENSE) ファイルを参照してください。

### GPL v3 の重要ポイント:

- ソフトウェアを自由に実行、学習、共有、変更できます
- 変更したバージョンを同じライセンスの下で配布できます
- 変更のソースコードを公開する必要があります
- 変更を同じ条件の下でライセンスする必要があります
- ソフトウェアは保証なしで提供されます

## 🙏 謝辞

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Go-DLP の中核技術
- [Wails](https://wails.io/) - Go とウェブ技術でデスクトップアプリケーションをビルドするためのフレームワーク
- [yt-dlp コミュニティ](https://github.com/yt-dlp/yt-dlp) - 基礎となるダウンロードエンジンの維持
- Go-DLP の翻訳と改善に貢献したすべての貢献者

## ❤️ 寄付

Go-DLP が役に立つと感じた場合は、プロジェクトのサポートをご検討ください:

- Bitcoin (BTC): `bc1qgwur4cgs3hpzl7quc4p0yrvjw50326sxkdxldv`
- Ethereum (ERC20): `0x9aa8eB123f24B917a0955C37DeBCb2Ee7281e51d`
- TON (TON): `UQDh1PIoVthF_SRFd6x2sRNkcYRDCJ_cbi7SkAqxDBN7AAMV`
- Tether (USDT,TRC20): `TCoeX2c5L2yyeiEZ3oK2nnjpgmSxgnr9N2`

## 🐛 問題の報告

問題が発生した場合は、[issue を開いて](https://github.com/Locon213/Go-DLP/issues) 以下をご報告ください:

- 問題の詳細な説明
- 再現手順
- 予想される動作
- 実際の動作
- スクリーンショット（該当する場合）
- お使いのオペレーティングシステムと Go-DLP のバージョン

## 🆘 サポート

追加のサポート:

- 既存の [issue](https://github.com/Locon213/Go-DLP/issues) を検索
- [ディスカッション](https://github.com/Locon213/Go-DLP/discussions) に参加

---

<div align="center">
  <sub><a href="https://github.com/Locon213">Locon213</a> によって❤️ で構築</sub>
</div>
