# リファクタリング提案と優先度

このドキュメントはリポジトリ内の一貫性向上のために観察された問題点、優先度付きの改善案、具体的な実装例、リスクと作業手順をまとめたものです。短期的に適用できる小さなパッチから、中期の構造改善まで含みます。

**作成日:** 2025-12-17

---

## 主要な所見

- **インラインスタイルの多用**: 多くのコンポーネントで `style={{ ... }}` が使われています。テーマ統一やレスポンシブ化、アクセシビリティ改善が難しくなります。
- **コンテキストメニューの重複実装**: `FolderTree` と `Sidebar` などで似たロジックがあり、同一 UI コンポーネント化の余地があります。
- **UI コンポーネントの分散**: Modal、Confirm、Button、Input 等のスタイルや振る舞いがファイルごとに異なります。
- **Tauri 呼び出しのばらつき**: 各コンポーネントで `invoke` を直接呼び出しており、型保証やエラーハンドリングの一貫性がありません。
- ~~**日付処理の散在**: 日付フォーマット／パース処理が複数箇所に分散しています。~~
- **色・テーマ変数の断片化**: `App.css` に変数がある一方、コンポーネント内でハードコード色が残っています。
- **prompt() の直接使用**: UX とテストの観点で改善余地がある箇所（グループ rename 等）があります。
- **共通型とユーティリティの散在**: `Task`, `Group`, `Settings` 等の型定義やユーティリティが複数箇所で重複している可能性があります。

---

## 優先度付き推奨リファクタ（高→中→低）

### 高（即効性があり安全）

- `src/types/index.ts` を作成して共通型を集約する。
- `src/tauri/api.ts` のようなラッパーを作り、`invoke` 呼び出しを型付き関数に置換する。エラー処理とロギングを集中させる。
- テーマ色を CSS 変数で一元化する（`src/styles/theme.css` など）。主要コンポーネントのハードコード色を変数参照に置き換える。
- `src/utils/date.ts` を作り、日付のフォーマット／パースを集中管理する。

### 中（やや作業量あり）

- `src/components/ui` に `Modal`, `ContextMenu`, `Button`, `Input` を作成し、既存コンポーネントを段階的に差し替える。
- `prompt()` を使っている箇所を `InputModal` / `ConfirmDialog` に置換して UX を統一する。
- `useAsyncInvoke` のような Hook を作り、ローディング／エラー表示を共通化する。

### 低（導入効果はあるが優先度低め）

- ESLint / Prettier / husky / lint-staged の導入
- ユニットテスト（date utilities, grouping logic 等）の強化
- CI（GitHub Actions）での自動 lint/test/build の設定

---

## 具体的な実装例（短縮版）

### 1) Tauri API ラッパー（`src/tauri/api.ts`）

```ts
import { invoke } from "@tauri-apps/api/core";
import type { MailSettings } from "../types";

export const saveMailSettings = async (settings: MailSettings) => {
  try {
    return await invoke("save_mail_settings", { settings });
  } catch (e) {
    console.error("saveMailSettings failed", e);
    throw e;
  }
};
```

メリット: 呼び出し側が例外処理や引数形を気にせず呼べる。

### 2) 日付ユーティリティ（`src/utils/date.ts`）

```ts
export const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseYMD = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
```

一箇所でフォーマットを変えればアプリ全体に反映されます。

### 3) ContextMenu コンポーネント（`src/components/ui/ContextMenu.tsx`）

- props: `items: { label:string; danger?:boolean; onClick:()=>void }[]`, `x`, `y`, `onClose`
- 位置クランプ、キーボード閉じる、オーバーレイ処理を内包させる。

---

## 実施手順（推奨フェーズ分割）

1. **フェーズ 0 — 準備（1日）**
   - `src/types/index.ts` と `src/utils/date.ts` を作成。
   - `src/tauri/api.ts` のスケルトンを作る。
   - ひとつの小さなコンポーネント（例: `SettingsModal`）を API ラッパーに合わせて置換して動作確認。

2. **フェーズ 1 — テーマと UI 基盤（1–2日）**
   - テーマ変数を整備 (`src/styles/theme.css`)。
   - `src/components/ui/Modal.tsx` と `ContextMenu.tsx` を作り、 `FolderTree` と `Sidebar` を段階的に差し替える。

3. **フェーズ 2 — Hook と全面置換（2–4日）**
   - `useAsyncInvoke`、`useModal` などの Hook を追加。
   - 全ての直接 `invoke` をラッパー経由に置換。
   - インライン style を主なコンポーネントから削除しクラス参照へ切替。

4. **フェーズ 3 — 品質向上（任意）**
   - ESLint/Prettier、CI 設定、ユニットテスト追加。

---

## リスクと軽減策

- 大きな一括リファクタはマージコンフリクトの元。→ 小さな PR に分割し、各 PR に自動テスト（tsc）を付ける。
- 見た目の差分（テーマのズレ）→ テーマ変数のバックフェイル（既存色を変数に一旦マッピング）を行う。

---

## 今すぐできる小さな改善（私がすぐ適用可能）

- `src/tauri/api.ts` スケルトン作成 + `SettingsModal` の `invoke` 呼び出しをラッパーに差し替え。
- `src/types/index.ts` を作り `MailSettings` などを移動。
- `SettingsModal` のインラインスタイルを少数のクラスに置換してテーマ変数を使う。

実行する場合は、変更を小さいコミット（each PR）に分けて作業します。どれを優先しますか？

---

## 追加情報・次の相談

- UI のスクリーンショットや好みのカラーパレットがあれば提供してください（テーマ設計が速く進みます）。
- `prompt()` を置換する UX（小さな Input モーダル vs サイドバーでインライン編集）についての好みも教えてください。

---

**参考コマンド**

TypeScript の静的チェック（ローカルで実行）:

```bash
npx tsc --noEmit
```

ビルド／プレビュー:

```bash
npm run dev
# or
npm run build
npm run preview
```

---

ファイル更新や PR 作成を希望する場合、どの項目を最初に自動で実装しましょうか？

- A) 型 (`src/types`) と `src/tauri/api.ts` を作る
- B) `src/components/ui/Modal` と `ContextMenu` を作る
- C) テーマ変数を整理して主要コンポーネントの色を置換
- D) 今は提案のみで実装は後で

よろしくお知らせください。
