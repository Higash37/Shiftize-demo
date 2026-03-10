/**
 * @file index.ts
 * @description user-viewモジュール全体のエントリーポイント（入口ファイル）。
 *   このファイルから re-export することで、外部が `import { ... } from "@/modules/user-view"`
 *   と1行で読み込めるようになる。
 */

/*
【このファイルの位置づけ】
  外部（例: app/(main)/user/ 配下のページ） ← ★このファイル
    └─ ./user-shift-forms  … UIコンポーネント群
    └─ ./user-shift-utils   … 型定義 & ユーティリティ関数
*/

// --- Re-exports ---

// コンポーネント（MultiDatePicker, TimeSelect など）を一括エクスポート
// `export *` は「指定モジュールの全 named export をそのまま再公開する」構文
export * from "./user-shift-forms";

// 型定義とユーティリティ関数を一括エクスポート
export * from "./user-shift-utils";
