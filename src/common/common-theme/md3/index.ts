/**
 * @file index.ts (md3)
 * @description Material Design 3 テーマシステムのエントリーポイント（バレルファイル）。
 *
 * 【このファイルの位置づけ】
 * - common/common-theme/md3/ 配下の全モジュールを一箇所から再エクスポートする
 * - アプリの各コンポーネントはここからまとめてインポートできる
 *
 * 【バレルファイルとは】
 * ディレクトリ内の複数ファイルのexportを1つのindex.tsに集約するパターン。
 * インポート元が1つになるため、コードが簡潔になる。
 *
 * 【使い方の例】
 * ```typescript
 * // バレルファイルがない場合（冗長）:
 * import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
 * import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
 *
 * // バレルファイルがある場合（簡潔）:
 * import { useMD3Theme, MD3Theme } from "@/common/common-theme/md3";
 * ```
 *
 * 【TypeScript構文の解説】
 * - `export type { ... }` → 型だけを再エクスポート。ランタイムのJavaScriptには含まれない
 * - `export { ... }` → 値（関数、定数、クラス等）を再エクスポート
 */

// Theme type - テーマ全体をまとめた型定義
export type { MD3Theme } from "./MD3Theme.types";

// Color system - 色の定義（primary, secondary等のカラーロール）
export type { MD3ColorScheme } from "./MD3Colors";
export {
  lightColorScheme,
  md3Palettes,
} from "./MD3Colors";

// Typography - 文字サイズ・太さ・行間の定義（display, headline, body等）
export type { MD3TypeScale } from "./MD3Typography";
export { md3Typography } from "./MD3Typography";

// Shape - 角丸（border-radius）の定義
export type { MD3ShapeScale } from "./MD3Shape";
export { md3Shape } from "./MD3Shape";

// Elevation - 影（shadow）の深さレベル定義
export type { MD3ElevationLevel, MD3ElevationScale } from "./MD3Elevation";
export { md3Elevation } from "./MD3Elevation";

// Spacing - 余白（padding/margin）のグリッドシステム定義
export type { MD3SpacingScale } from "./MD3Spacing";
export { md3Spacing } from "./MD3Spacing";

// Context & Hooks - Reactのコンテキスト（テーマ配信）とフック（テーマ取得）
export {
  MD3ThemeProvider,
  useMD3Theme,
  lightTheme,
} from "./MD3ThemeContext";
export { useThemedStyles } from "./useThemedStyles";
