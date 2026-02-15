/**
 * レガシー互換: Theme オブジェクト
 *
 * 1ファイル (SettingsBackupView.styles.ts) が使用。
 * MD3カラーから導出。
 *
 * 新規コードでは `useMD3Theme()` を使用してください。
 * @deprecated 段階的に useMD3Theme() へ移行
 */
import { lightColorScheme } from "./md3/MD3Colors";
import { md3Shape } from "./md3/MD3Shape";
import { md3Spacing } from "./md3/MD3Spacing";

const cs = lightColorScheme;

export const Theme = {
  colors: {
    primary: cs.primary,
    secondary: cs.secondary,
    background: cs.surface,
    text: cs.onSurface,
    textSecondary: cs.onSurfaceVariant,
    border: cs.outlineVariant,
    error: cs.error,
    success: cs.success,
    warning: cs.warning,
    info: cs.primary,
  },
  spacing: {
    xs: md3Spacing.xs,
    sm: md3Spacing.sm,
    md: md3Spacing.lg,
    lg: md3Spacing.xxl,
    xl: md3Spacing.xxxl,
  },
  borderRadius: {
    sm: md3Shape.extraSmall,
    md: md3Shape.small,
    lg: md3Shape.large,
  },
};
