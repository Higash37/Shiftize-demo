/**
 * @file index.ts (common-theme)
 * @description テーマシステム全体の公開エントリーポイント。
 *
 * 【このファイルの位置づけ】
 * - common/common-theme/ のルートindex
 * - レガシーテーマ（Theme オブジェクト）を外部に公開する
 * - 新しいMD3テーマは md3/index.ts から直接インポートする
 *
 * 【レガシー vs 新規の使い分け】
 * - レガシー: `import { Theme } from "@/common/common-theme"` → 古いコード向け
 * - 新規:    `import { useMD3Theme } from "@/common/common-theme/md3"` → 推奨
 *
 * @deprecated 段階的に useMD3Theme() へ移行
 */
import { lightColorScheme } from "./md3/MD3Colors";
import { md3Shape } from "./md3/MD3Shape";
import { md3Spacing } from "./md3/MD3Spacing";

/**
 * cs → lightColorScheme の短縮エイリアス
 * 以下のThemeオブジェクト内で繰り返し参照するため、短い変数名にしている
 */
const cs = lightColorScheme;

/**
 * Theme オブジェクト - レガシー互換用のテーマ定義
 *
 * SettingsBackupView.styles.ts など1ファイルが使用している。
 * MD3カラーシステムから値を導出しているため、MD3側の変更が自動的に反映される。
 *
 * 【Material Design 3 の色の意味】
 * - primary:        アプリの主要色。ボタンやアクティブ要素に使う
 * - secondary:      補助色。副次的なUI要素に使う
 * - surface:        カードや背景の色
 * - onSurface:      surface上のテキストやアイコンの色
 * - onSurfaceVariant: surface上の補助テキストの色
 * - outlineVariant: 境界線やセパレータの色
 * - error:          エラー状態を示す色（赤系）
 * - success:        成功状態を示す色（緑系、MD3拡張）
 */
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
