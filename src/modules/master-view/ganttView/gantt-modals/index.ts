/** @file index.ts @description gantt-modalsモジュールのバレルファイル。ShiftModalとその型をまとめてre-exportする */
export { ShiftModal } from "./ShiftModal";
// type キーワード付きexport = 型だけをexportする（実行時のコードには含まれない）
export type { ShiftData, ShiftModalProps } from "./ShiftModal";
