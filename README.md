# Noruno Platform ![App Icon](./src-tauri/icons/32x32.png)

**Noruno Platform** は、Tauri, React, TypesSriptの学習を目的としたプロジェクトです。Tauri + React + TypeScriptで構築された、モダンで高速なオールインワン生産性向上デスクトップアプリケーションを制作する試みです。


## ✨ 主な機能

- **📋 タスク管理**: サブタスク、期限設定、通知機能付きの強力なTODOリスト。
- **📝 高機能メモ**: フォルダー管理、タグ付け、全文検索が可能なMarkdownエディター。
- **📚 読書記録**: ステータス管理、読書ノート、進捗可視化機能を備えたブックログ。
- **📅 カレンダー**: タスク期限とイベントを月表示で直感的に把握。
- **📊 ダッシュボード**: 活動状況をひと目で確認できる分析画面。
- **💹 ガントチャート**: タスクベースで管理するガントチャート。
- **🎨 テーマ機能**: 気分に合わせて選べる豊富なカラーテーマ（Light, Dark, Tokyo Night, etc.）。

## 📖 ドキュメント

詳細な情報は以下のドキュメントを参照してください。

- **[仕様書 (SPECIFICATION.md)](./SPECIFICATION.md)**: 技術スタック、データベース構造、機能詳細。
- **[運用マニュアル (MANUAL.md)](./MANUAL.md)**: アプリケーションの詳しい使い方。
- **[更新履歴 (CHANGELOG.md)](./CHANGELOG.md)**: バージョンごとの変更点。

## 🛠️ 技術スタック

- **Core**: [Tauri v2](https://tauri.app/) (Rust)
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Database**: JSON Storage (No SQL Database)
- **State Management**: React Hooks + Backend State

## 🚀 開発とビルド

### 必要要件

- Node.js (v20推奨)
- Rust (最新の安定版)
- ビルド依存関係 (各OSのTauri要件に準拠)

### 開発モード起動

```bash
npm install
npm run tauri dev
```

### 本番ビルド

```bash
npm run tauri build
```

## 📂 データ保存場所

アプリケーションの設定やデータは、OS標準のデータディレクトリ内の `noruno_platform` フォルダーにあるJSONファイル (`tasks.json`, `memos.json` など) に保存されます。
