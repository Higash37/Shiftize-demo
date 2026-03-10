/**
 * @file ThemeDefinition.ts
 * @description レガシーテーマの統合定義ファイル。色・文字・余白・角丸・影・アニメーションを1つにまとめる。
 *
 * 【このファイルの位置づけ】
 * - 既存コードの `import { theme } from "ThemeDefinition"` を壊さないためのブリッジ
 * - 内部値はすべてMD3テーマから導出している
 * - 関連ファイル: ThemeColors.ts, ThemeTypography.ts, ShadowConstants.ts,
 *                md3/MD3Spacing.ts, md3/MD3Shape.ts
 *
 * 【なぜMD3から導出するのか】
 * レガシーテーマとMD3テーマで値を二重管理すると不整合が起きる。
 * MD3を「真のソース」として、レガシーテーマはそこから値を借りることで一元管理する。
 *
 * @deprecated 段階的に useMD3Theme() へ移行。新規コードではこのファイルを使わない
 */

import { colors } from "./ThemeColors";
import { typography } from "./ThemeTypography";
import { shadows } from "../common-constants/ShadowConstants";
import { md3Spacing } from "./md3/MD3Spacing";
import { md3Shape } from "./md3/MD3Shape";

/**
 * theme オブジェクト - レガシーテーマの完全定義
 *
 * 以下のサブオブジェクトを持つ:
 * - colors:       色定義（primary, secondary, background等）
 * - typography:   文字スタイル定義（fontSize, fontWeight, lineHeight等）
 * - spacing:      余白サイズ定義（xs, sm, md, lg, xl, xxl）
 * - borderRadius: 角丸サイズ定義（xs, sm, md, lg, xl, round）
 * - shadows:      影定義（none, sm, md, lg）
 * - transitions:  CSSトランジション速度（fast, normal, slow）※Web用
 */
export const theme = {
  colors,
  typography,
  spacing: {
    xs: md3Spacing.xs,       // 4dp  - 極小の余白
    sm: md3Spacing.sm,       // 8dp  - 小さい余白
    md: md3Spacing.lg,       // 16dp - 中程度の余白
    lg: md3Spacing.xxl,      // 32dp - 大きい余白
    xl: md3Spacing.xxxl,     // 48dp - 極大の余白
    xxl: md3Spacing.xxxxxl,  // 96dp - 最大の余白
  },
  borderRadius: {
    xs: md3Shape.extraSmall, // 4dp  - 極小の角丸
    sm: md3Shape.small,      // 8dp  - 小さい角丸
    md: md3Shape.medium,     // 12dp - 中程度の角丸
    lg: md3Shape.large,      // 16dp - 大きい角丸
    xl: md3Shape.extraLarge, // 28dp - 極大の角丸
    round: md3Shape.full,    // 9999dp - 完全な円形
  },
  shadows: {
    none: shadows.none,      // 影なし
    sm: shadows.small,       // 軽い影
    md: shadows.medium,      // 中程度の影
    lg: shadows.large,       // 強い影
  },
  /**
   * transitions - CSSアニメーションの速度定義（Web環境用）
   *
   * React Native（ネイティブ）ではAnimated APIを使うため、
   * これらのCSS transitionはWeb版でのみ意味を持つ。
   */
  transitions: {
    fast: "0.2s",    // 速いアニメーション（200ms）- ホバーやフォーカスに最適
    normal: "0.3s",  // 標準速度（300ms）- 一般的なUI遷移
    slow: "0.5s",    // 遅いアニメーション（500ms）- モーダルの出現等
  },
};

/**
 * Theme 型 - themeオブジェクトの型を自動推論
 *
 * 【TypeScript構文の解説】
 * - `typeof theme` → themeオブジェクトの型をTypeScriptが自動的に推論する
 *   明示的にinterfaceを書かなくても、オブジェクトの構造から型が生成される
 */
export type Theme = typeof theme;
export default theme;
