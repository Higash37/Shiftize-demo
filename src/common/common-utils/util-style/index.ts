/**
 * @file index.ts (util-style)
 * @description スタイル関連ユーティリティのバレルファイル（再エクスポート用）。
 *
 * 【このファイルの位置づけ】
 * - common/common-utils/util-style/ のエントリーポイント
 * - StyleGenerator.ts（スタイル生成関数）と responsive.ts（レスポンシブ対応）を再エクスポート
 * - 関連ファイル: StyleGenerator.ts, responsive.ts, StyleHelpers.ts
 *
 * 【export * from の意味】
 * 指定モジュールの全エクスポートをこのファイルから再エクスポートする。
 * 利用側は `import { createCardStyle } from "util-style"` のように
 * ディレクトリレベルでインポートできる。
 */
export * from "./StyleGenerator";
export * from "./responsive";

// レガシーの名前空間ブリッジ
// 後方互換性のために必要な場合はここに追加
