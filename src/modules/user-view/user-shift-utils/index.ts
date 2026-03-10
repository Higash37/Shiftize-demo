/**
 * @file index.ts (user-shift-utils)
 * @description シフトUI用のユーティリティ（型定義・関数）をまとめて再エクスポートするバレルファイル。
 */

/*
【このファイルの位置づけ】
  user-view/index.ts ← ★このファイル
    └─ ./ui-types  … 共通型定義（TimeSlot, ShiftType など）
    └─ ./ui-utils  … ユーティリティ関数（generateTimeOptions, parseTimeString）
*/

// 型定義をエクスポート
export * from "./ui-types";

// ユーティリティ関数をエクスポート
export * from "./ui-utils";
