# Noruno Platform - アプリケーション仕様書

## 概要

**Noruno Platform** は、Tauri + React + TypeScript で構築されたマルチ機能デスクトップアプリケーションです。タスク管理、メモ、読書記録を統合したオールインワンの生産性ツールです。

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Tauri v2 |
| フロントエンド | React + TypeScript + Vite + Tailwind CSS |
| バックエンド | Rust |
| データ保存 | JSON ファイル（ローカル） |
| 通知 | Gmail SMTP (lettre) |

---

## 依存関係

### フロントエンド (npm)

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| react | ^19.1.0 | UIフレームワーク |
| react-dom | ^19.1.0 | React DOMレンダリング |
| @tauri-apps/api | ^2 | Tauri バックエンド通信 |
| @tauri-apps/plugin-opener | ^2 | 外部リンク/ファイルを開く |
| @tauri-apps/plugin-notification | ^2.3.3 | システム通知 |
| react-markdown | ^10.1.0 | Markdownレンダリング |
| react-syntax-highlighter | ^16.1.0 | コードブロックのシンタックスハイライト |
| remark-gfm | ^4.0.1 | GitHub Flavored Markdown対応 |
| tailwindcss | ^4.0.0 | CSSフレームワーク |
| @tailwindcss/postcss | ^4.0.0 | PostCSSプラグイン |
| postcss | ^8.4.49 | CSS変換ツール |
| autoprefixer | ^10.4.20 | ベンダープレフィックス付与 |

#### 開発依存関係

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| typescript | ~5.8.3 | 型チェック |
| vite | ^7.0.4 | ビルドツール・開発サーバー |
| @vitejs/plugin-react | ^4.6.0 | ViteのReactプラグイン |
| @tauri-apps/cli | ^2 | Tauri CLIツール |
| @types/react | ^19.1.8 | React型定義 |
| @types/react-dom | ^19.1.6 | ReactDOM型定義 |

### バックエンド (Cargo)

| クレート | バージョン | 用途 |
|---------|-----------|------|
| tauri | 2 | デスクトップアプリフレームワーク |
| tauri-plugin-opener | 2 | 外部リンクを開く |
| tauri-plugin-single-instance | 2 | アプリ単一起動制限 |
| serde | 1 | シリアライズ/デシリアライズ |
| serde_json | 1 | JSONパース |
| chrono | 0.4 | 日時処理 |
| tokio | 1 | 非同期ランタイム |
| lettre | 0.11 | SMTP メール送信 |
| uuid | 1.18.1 | UUID生成 (v4) |
| image | 0.25 | 画像処理（アイコン用） |
| dirs | 6.0.0 | OSのディレクトリパス取得 |

### Tauri 機能フラグ

| 機能 | 説明 |
|------|------|
| protocol-asset | ローカルアセットプロトコル |
| isolation | セキュリティ隔離モード |

---

## 機能一覧

### 📋 タスク管理

| 機能 | 説明 |
|------|------|
| タスクCRUD | 追加・編集・削除・完了 |
| グループ分類 | カスタムグループでタスク分類 |
| サブタスク | タスク内に子タスクを追加、進捗バー表示 |
| 期限管理 | 日付・時間指定、カスタム通知設定 |
| カレンダービュー | 月間カレンダーでタスク表示 |

### 📝 メモ機能

| 機能 | 説明 |
|------|------|
| Markdown対応 | ライブプレビュー付きエディタ |
| フォルダ管理 | フォルダでメモを整理 |
| タグシステム | タグによる分類・検索 |
| 検索 | 全文検索 |

### 📚 読書記録

| 機能 | 説明 |
|------|------|
| 書籍管理 | タイトル、著者、ステータス管理 |
| 読書ノート | 書籍ごとにメモを記録 |
| 読書セッション | 読書時間・ページ数を記録 |
| 進捗グラフ | 読書進捗の可視化 |

### 📊 ダッシュボード

| 統計項目 | 内容 |
|----------|------|
| タスク完了率 | 完了タスク / 全タスク |
| 今日の期限 | 今日期限のタスク数 |
| 期限切れ | 期限切れタスク数 |
| サブタスク進捗 | 完了/合計 |
| 読了書籍数 | 読了した書籍数 |
| 総読書時間 | 全セッション合計 |
| 週間チャート | 過去7日のタスク完了状況 |

### 📧 通知機能

- Gmail SMTP によるメール通知
- タスク期限前に通知（分単位で設定可能）
- バックグラウンドで自動チェック（60秒間隔）

### 🎨 テーマ

| テーマ名 | 説明 |
|---------|------|
| Light | 明るい白ベース |
| Dark | 暗いグレーベース |
| High Contrast | 高コントラスト |
| Tokyo Night | 青紫ベース |
| Nord | 北欧風ブルー |
| Dracula | 紫ベース |
| Monokai | 緑アクセント |
| Monokai Dimmed | 灰色背景・青アクセント |
| Gruvbox | レトロブラウン |
| Solarized Dark | 青緑ベース |

---

## ディレクトリ構造

```
root/
├── tailwind.config.js   # Tailwind 設定
├── postcss.config.js    # PostCSS 設定
├── vite.config.ts       # Vite 設定
├── tsconfig.json        # TypeScript 設定
├── package.json         # NPM 依存関係
├── src-tauri/
│   ├── src/
│   ├── lib.rs           # エントリポイント、Tauri設定
│   ├── main.rs          # メインエントリ
│   ├── task.rs          # Task構造体、ファイルI/O
│   ├── notification.rs  # 通知ロジック
│   ├── mail.rs          # メール送信
│   ├── memo.rs          # メモ管理
│   ├── reading_memo.rs  # 読書記録
│   ├── settings.rs      # 設定管理
│   └── commands/        # Tauriコマンド
│       ├── mod.rs
│       ├── task_commands.rs
│       ├── memo_commands.rs
│       └── reading_commands.rs

src/
├── App.tsx              # メインアプリ
├── App.css              # スタイル・テーマ
└── components/
    ├── TaskList.tsx
    ├── TaskRow.tsx
    ├── TaskInput.tsx
    ├── SubtaskList.tsx
    ├── EditDialog.tsx
    ├── CalendarView.tsx
    ├── CustomDropdown.tsx
    ├── CustomDatePicker.tsx
    ├── sidebar/
    ├── settings/
    ├── memo/
    ├── reading/
    └── dashboard/
```

---

## プラグイン

| プラグイン | 用途 |
|-----------|------|
| tauri-plugin-opener | 外部リンク開く |
| tauri-plugin-single-instance | アプリ単一起動制限 |

---

## データ保存場所

- **Windows**: `C:\Users\[UserName]\AppData\Roaming\com.noruno.platform\`
- **Linux**: `~/.local/share/noruno_platform/`
- **macOS**: `~/Library/Application Support/noruno_platform/`

### ファイル

| ファイル | 内容 |
|----------|------|
| tasks.json | タスクデータ |
| groups.json | グループ一覧 |
| settings.json | メール設定 |
| memos.json | メモデータ |
| folders.json | フォルダ一覧 |
| reading_books.json | 読書記録 |

---

## ビルド方法

```bash
# 開発モード
npm run tauri dev

# 本番ビルド
npm run tauri build
```

---

## 更新履歴

- **2024-12**: サブタスク機能、ダッシュボード、Single Instance プラグイン追加
- **2024-12**: ファイル構造リファクタリング（lib.rs 分割）
- **2024-12**: Monokai Dimmed テーマ追加
- **2025-12**: Tailwind CSS への移行（レイアウト、コンポーネント）、チェックボックスのサイズ問題修正、アプリ名の正式変更 (Noruno Platform)
