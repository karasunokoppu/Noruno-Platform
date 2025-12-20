# Noruno Platform - アプリケーション仕様書

## 概要

**Noruno Platform** は、Tauri v2 + React + TypeScript で構築されたマルチ機能デスクトップアプリケーションです。タスク管理、高度なメモ、読書記録、カレンダー機能を統合したオールインワンの生産性ツールです。

---

## 技術スタック

| カテゴリ       | 技術                                     |
| -------------- | ---------------------------------------- |
| フレームワーク | Tauri v2                                 |
| フロントエンド | React + TypeScript + Vite + Tailwind CSS |
| バックエンド   | Rust                                     |
| データベース   | JSON Storage (No SQL)                    |
| 通知           | Gmail SMTP (lettre) + システム通知       |
| テーマ         | CSS Variables + Tailwind Colors          |

---

## 依存関係

### フロントエンド (npm)

| パッケージ                      | バージョン | 用途                                   |
| ------------------------------- | ---------- | -------------------------------------- |
| react                           | ^19.2.1    | UIフレームワーク                       |
| react-dom                       | ^19.2.1    | React DOMレンダリング                  |
| @tauri-apps/api                 | ^2.9.1     | Tauri バックエンド通信                 |
| @tauri-apps/plugin-opener       | ^2         | 外部リンク/ファイルを開く              |
| @tauri-apps/plugin-notification | ^2.3.3     | システム通知                           |
| react-markdown                  | ^10.1.0    | Markdownレンダリング                   |
| react-syntax-highlighter        | ^16.1.0    | コードブロックのシンタックスハイライト |
| remark-gfm                      | ^4.0.1     | GitHub Flavored Markdown対応           |
| tailwindcss                     | ^4.0.0     | CSSフレームワーク                      |
| @tailwindcss/postcss            | ^4.0.0     | PostCSSプラグイン                      |
| postcss                         | ^8.4.49    | CSS変換ツール                          |
| autoprefixer                    | ^10.4.20   | ベンダープレフィックス付与             |

#### 開発依存関係

| パッケージ           | バージョン | 用途                       |
| -------------------- | ---------- | -------------------------- |
| typescript           | ~5.9.3     | 型チェック                 |
| vite                 | ^7.2.6     | ビルドツール・開発サーバー |
| @vitejs/plugin-react | ^5.1.1     | ViteのReactプラグイン      |
| @tauri-apps/cli      | ^2         | Tauri CLIツール            |

### バックエンド (Cargo)

| クレート                     | バージョン | 用途                             |
| ---------------------------- | ---------- | -------------------------------- |
| tauri                        | 2          | デスクトップアプリフレームワーク |
| tauri-plugin-opener          | 2          | 外部リンクを開く                 |
| tauri-plugin-single-instance | 2          | アプリ単一起動制限               |
| serde                        | 1          | シリアライズ/デシリアライズ      |
| serde_json                   | 1          | JSONパース                       |
| chrono                       | 0.4        | 日時処理                         |
| tokio                        | 1          | 非同期ランタイム                 |
| lettre                       | 0.11       | SMTP メール送信                  |
| uuid                         | 1.18.1     | UUID生成 (v4)                    |
| image                        | 0.25       | 画像処理（アイコン用）           |
| dirs                         | 6.0.0      | OSのディレクトリパス取得         |

### Tauri 機能フラグ

| 機能           | 説明                       |
| -------------- | -------------------------- |
| protocol-asset | ローカルアセットプロトコル |
| isolation      | セキュリティ隔離モード     |

---

## 機能一覧

### 📋 タスク管理

| 機能         | 説明                                   |
| ------------ | -------------------------------------- |
| タスクCRUD   | 追加・編集・削除・完了                 |
| グループ分類 | カスタムグループでタスク分類           |
| サブタスク   | タスク内に子タスクを追加、進捗バー表示 |
| 期限管理     | 日付・時間指定、カスタム通知設定       |
| リマインダー | 指定時間にメール通知・システム通知     |

### 📅 カレンダー

| 機能         | 説明                                   |
| ------------ | -------------------------------------- |
| 月表示       | タスクとイベントを月間カレンダーに表示 |
| イベント管理 | 予定の作成、編集、削除                 |
| 色分け       | イベントごとの色設定                   |
| 繰り返し     | 繰り返し予定の設定（日、週、月など）   |

### 📝 メモ機能

| 機能         | 説明                             |
| ------------ | -------------------------------- |
| Markdown対応 | ライブプレビュー付きエディタ     |
| フォルダ管理 | 階層的なフォルダ構造でメモを整理 |
| タグシステム | タグによる分類・検索             |
| 検索         | 全文検索                         |

### 📚 読書記録

| 機能           | 説明                                       |
| -------------- | ------------------------------------------ |
| 書籍管理       | タイトル、著者、ステータス、カバー画像管理 |
| 読書ノート     | 書籍ごとにメモを記録                       |
| 読書セッション | 読書日時・ページ数を記録                   |
| 進捗グラフ     | 読書進捗の可視化                           |
| ステータス     | 読みたい、読書中、読了、中断               |

### 📊 ダッシュボード

| 統計項目       | 内容                    |
| -------------- | ----------------------- |
| タスク完了率   | 完了タスク / 全タスク   |
| 今日の期限     | 今日期限のタスク数      |
| 期限切れ       | 期限切れタスク数        |
| サブタスク進捗 | 完了/合計               |
| 読了書籍数     | 読了した書籍数          |
| 総読書時間     | 全セッション合計        |
| 週間チャート   | 過去7日のタスク完了状況 |

### 📧 通知機能

- Gmail SMTP によるメール通知
- タスク期限前に通知（分単位で設定可能）
- バックグラウンドで自動チェック（60秒間隔）

### 🎨 テーマ

Tailwind CSS ベースのテーマシステムを採用。

| テーマ名       | 説明                   |
| -------------- | ---------------------- |
| Light          | 明るい白ベース         |
| Dark           | 暗いグレーベース       |
| High Contrast  | 高コントラスト         |
| Tokyo Night    | 青紫ベース             |
| Nord           | 北欧風ブルー           |
| Dracula        | 紫ベース               |
| Monokai        | 緑アクセント           |
| Monokai Dimmed | 灰色背景・青アクセント |
| Gruvbox        | レトロブラウン         |
| Solarized Dark | 青緑ベース             |

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
│   │   ├── lib.rs           # エントリポイント、Tauri設定
│   │   ├── main.rs          # メインエントリ
│   │   ├── database.rs      # SQLite接続、マイグレーション
│   │   ├── task.rs          # Task構造体
│   │   ├── calendar.rs      # Calendar構造体
│   │   ├── notification.rs  # 通知ロジック
│   │   ├── mail.rs          # メール送信
│   │   ├── memo.rs          # メモ管理
│   │   ├── reading_memo.rs  # 読書記録
│   │   ├── settings.rs      # 設定管理
│   │   └── commands/        # Tauriコマンド
│   │       ├── mod.rs
│   │       ├── task_commands.rs
│   │       ├── memo_commands.rs
│   │       └── reading_commands.rs
│   ├── migrations/          # SQLマイグレーションファイル
│   └── Cargo.toml           # Rust 依存関係
│
src/
├── App.tsx              # メインアプリ
├── App.css              # グローバルスタイル
├── components/          # Reactコンポーネント
│   ├── dashboard/       # ダッシュボード関連
│   ├── memo/            # メモ機能関連
│   ├── reading/         # 読書記録関連
│   ├── settings/        # 設定画面など
│   ├── sidebar/         # サイドバー
│   ├── TaskList.tsx
│   ├── TaskRow.tsx
│   ├── TaskInput.tsx
│   ├── SubtaskList.tsx
│   ├── EditDialog.tsx
│   ├── CalendarView.tsx
│   ├── CalendarEventDialog.tsx
│   ├── CustomDropdown.tsx
│   └── CustomDatePicker.tsx
```

---

## プラグイン

| プラグイン                   | 用途               |
| ---------------------------- | ------------------ |
| tauri-plugin-opener          | 外部リンク開く     |
| tauri-plugin-single-instance | アプリ単一起動制限 |

---

## データ保存場所

アプリケーションデータは、OS標準のデータディレクトリ内の `noruno_platform` フォルダにあるJSONファイルに保存されます。

- **Windows**: `C:\Users\[UserName]\AppData\Roaming\com.noruno.platform\`
- **Linux**: `~/.local/share/noruno_platform/`
- **macOS**: `~/Library/Application Support/noruno_platform/`

### ファイル

| ファイル             | 内容                     |
| -------------------- | ------------------------ |
| tasks.json           | タスクデータ             |
| memos.json           | メモデータ               |
| reading_books.json   | 読書記録データ           |
| calendar_events.json | カインダーイベントデータ |
| groups.json          | タスクグループ定義       |
| settings.json        | アプリケーション設定     |

---

## ビルド方法
### 開発モード

```bash
npm tsc --noEmit

npm prettier . --write

```

### 本番モード
```bash
# 開発モード
npm run tauri dev

# 本番ビルド
npm run tauri build

# Arch系 Linux向けビルド（ストリップなし）
No_STRIP=true npm run tauri build
```

---

## 更新履歴

- **2024-12**: サブタスク機能、ダッシュボード、Single Instance プラグイン追加
- **2024-12**: ファイル構造リファクタリング
- **2025-01**: Monokai Dimmed テーマ追加
- **2025-12**:
  - UIを Tailwind CSS へ完全移行
  - SQLite (SQLx) へのデータベース移行 (一時的対応、後にJSONへ戻しました)
  - カレンダーイベント機能の追加
  - アプリ名を "Noruno Platform" へ変更
