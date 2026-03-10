/**
 * @file ThemeTypography.ts
 * @description レガシーテーマ用のタイポグラフィ（文字スタイル）定義。
 *
 * 【このファイルの位置づけ】
 * - ThemeDefinition.ts から参照される
 * - FontConstants.ts からアプリ共通のフォントファミリーを取得
 * - 関連ファイル: FontConstants.ts（フォント定義）, ThemeDefinition.ts（テーマ組み立て）
 *
 * 【タイポグラフィの要素】
 * - fontSize:      文字の大きさ（ポイント単位）
 * - fontWeight:    文字の太さ（'300'=細い ～ '700'=太い）
 * - lineHeight:    行の高さ（文字サイズ + 行間）
 * - fontFamily:    使用するフォント名
 * - letterSpacing: 文字間隔（負=詰まる、0=標準、正=広がる）
 *
 * @deprecated 新規コードでは useMD3Theme().typography を使用する
 */

import { APP_FONT_FAMILY } from "@/common/common-constants/FontConstants";

/**
 * typography - レガシーテーマ用のタイポグラフィ定義
 *
 * 【fontWeight の値について】
 * CSS/React Native では文字列で指定する:
 * - '300' → Light（細い）
 * - '400' → Regular（標準）
 * - '500' → Medium（やや太い）
 * - '600' → SemiBold（半太字）
 * - '700' → Bold（太字）
 */
export const typography = {
  fontSize: {
    small: 12,    // 注釈、キャプション用
    medium: 16,   // 本文テキスト用（標準サイズ）
    large: 20,    // 小見出し用
    xlarge: 24,   // 大見出し用
  },
  fontWeight: {
    light: '300',     // 細い - 装飾的なテキストに使用
    regular: '400',   // 標準 - 本文テキストに使用
    medium: '500',    // やや太い - 強調テキストに使用
    semibold: '600',  // 半太字 - サブヘッダーに使用
    bold: '700',      // 太字 - 見出しに使用
  },
  lineHeight: {
    small: 16,    // fontSize.small(12) + 行間4
    medium: 20,   // fontSize.medium(16) + 行間4
    large: 24,    // fontSize.large(20) + 行間4
    xlarge: 28,   // fontSize.xlarge(24) + 行間4
  },
  fontFamily: {
    regular: APP_FONT_FAMILY, // 通常テキスト用フォント
    bold: APP_FONT_FAMILY,    // 太字テキスト用フォント（同一フォントを使用）
  },
  /**
   * letterSpacing - 文字間隔
   *
   * 【単位はdp（density-independent pixel）】
   * - tight (-0.5): 文字が詰まる。見出し等の大きな文字で使う
   * - normal (0):   標準間隔。本文テキストに使う
   * - wide (0.5):   文字が広がる。キャプションやラベルに使う
   */
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};
