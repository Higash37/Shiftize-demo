/**
 * Material Design 3 テーマシステム
 *
 * エントリーポイント。アプリ全体で以下のようにインポート:
 *
 * ```typescript
 * import { useMD3Theme, useThemedStyles, MD3Theme } from "@/common/common-theme/md3";
 * ```
 */

// Theme type
export type { MD3Theme } from "./MD3Theme.types";

// Color system
export type { MD3ColorScheme } from "./MD3Colors";
export {
  lightColorScheme,
  md3Palettes,
} from "./MD3Colors";

// Typography
export type { MD3TypeScale } from "./MD3Typography";
export { md3Typography } from "./MD3Typography";

// Shape
export type { MD3ShapeScale } from "./MD3Shape";
export { md3Shape } from "./MD3Shape";

// Elevation
export type { MD3ElevationLevel, MD3ElevationScale } from "./MD3Elevation";
export { md3Elevation } from "./MD3Elevation";

// Spacing
export type { MD3SpacingScale } from "./MD3Spacing";
export { md3Spacing } from "./MD3Spacing";

// Context & Hooks
export {
  MD3ThemeProvider,
  useMD3Theme,
  lightTheme,
} from "./MD3ThemeContext";
export { useThemedStyles } from "./useThemedStyles";
