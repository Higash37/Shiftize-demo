/** @file index.ts @description common-utils全体のエントリーポイント。各サブフォルダのユーティリティをまとめて再エクスポートする。他のファイルから `import { formatDate } from "@/common/common-utils"` のように使える。 */

// ── 日付関連ユーティリティ ──
// DateFormatter.ts の関数群（formatDate, addDays など）をまとめて公開
export * from "./util-date";

// ── スタイル関連ユーティリティ ──
// StyleGenerator.ts, responsive.ts の関数群をまとめて公開
export * from "./util-style";

// ── 型チェック関連ユーティリティ ──
// TypeChecker.ts の関数群（isEmpty, isNumeric など）をまとめて公開
export * from "./utility-interfaces";

// ── バリデーション関連ユーティリティ ──
// Validators.ts の関数群（validateRequired, validateEmail など）をまとめて公開
export * from "./util-validation";

// ── ストレージ関連ユーティリティ ──
// AsyncStorage を使った店舗ID管理
export * from "./util-storage/StoreIdStorage";
