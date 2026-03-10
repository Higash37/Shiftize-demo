/**
 * @file index.ts (user-shift-forms)
 * @description シフト関連UIコンポーネントをまとめて外部に公開するバレルファイル。
 *   「バレルファイル」とは、複数のモジュールを1か所から再エクスポートして
 *   import パスを短くするためのパターン。
 */

/*
【このファイルの位置づけ】
  親 index.ts (user-view/index.ts) ← ★このファイル
    └─ 各コンポーネント (.tsx) を `export { default as 名前 }` で再公開
  外部からは `import { MultiDatePicker } from "@/modules/user-view"` のように使える。
*/

// --- 日付選択関連 ---

// `export { default as MultiDatePicker }` は
// MultiDatePicker.tsx の「default export」を「named export」に変換して再公開する構文
export { default as MultiDatePicker } from "./MultiDatePicker";
export { default as SelectedDateList } from "./SelectedDateList";
export { default as ShiftDateSelector } from "./ShiftDateSelector";

// --- 時間選択関連 ---
export { default as TimeInputSection } from "./TimeInputSection";
export { default as TimeSelect } from "./TimeSelect";
export { default as UnifiedTimePicker } from "./UnifiedTimePicker";
