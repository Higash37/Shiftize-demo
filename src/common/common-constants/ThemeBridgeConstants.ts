/**
 * 新しいテーマシステムとレガシーテーマのブリッジファイル
 *
 * このファイルは、古いテーマシステム（constants/theme.ts）と
 * 新しいテーマシステム（theme/theme.ts）の間の互換性を提供します。
 * プロジェクト内のコンポーネントが徐々に新しいテーマに移行できるように、
 * 両方のテーマシステムを維持しながらエクスポートします。
 */

import { theme as newTheme } from "../common-theme/ThemeDefinition";
import { colors, typography, layout, shadows } from "./ThemeConstants";

/**
 * 古いテーマシステムのエクスポート（後方互換性のため）
 */
export { colors, typography, layout, shadows };

/**
 * 新しいテーマシステムのエクスポート
 */
export { newTheme };

/**
 * レガシーテーマと新テーマの変換マッピング
 *
 * この部分は将来的に完全に新しいテーマに移行した際に削除できます
 */
export const themeMapping = {
  // 色の対応マッピング
  colors: {
    primary: newTheme.colors.primary,
    secondary: newTheme.colors.secondary,
    background: newTheme.colors.background,
    surface: newTheme.colors.surface,
    text: {
      primary: newTheme.colors.text?.primary,
      secondary: newTheme.colors.text?.secondary,
      white: newTheme.colors.text?.white,
    },
    error: newTheme.colors.error,
  },

  // スペーシングの対応マッピング
  spacing: {
    small: newTheme.spacing.sm,
    medium: newTheme.spacing.md,
    large: newTheme.spacing.lg,
  },

  // ボーダーラディウスの対応マッピング
  borderRadius: {
    small: newTheme.borderRadius.sm,
    medium: newTheme.borderRadius.md,
    large: newTheme.borderRadius.lg,
  },
};
