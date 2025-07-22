/**
 * アプリケーションのテーマ設定
 */

import { colors } from "./ThemeColors";
import { typography } from "./ThemeTypography";
import { shadows } from "../common-constants/ShadowConstants";

/**
 * アプリケーションのテーマ
 */
export const theme = {
  colors,
  typography,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 1000, // 円形用
  },
  shadows: {
    none: shadows.none,
    sm: shadows.small,
    md: shadows.medium,
    lg: shadows.large,
  },
  transitions: {
    fast: "0.2s",
    normal: "0.3s",
    slow: "0.5s",
  },
};

/**
 * テーマ型定義
 */
export type Theme = typeof theme;

/**
 * デフォルトテーマをエクスポート
 */
export default theme;
