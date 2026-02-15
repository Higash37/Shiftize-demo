/**
 * Material Design 3 スペーシングシステム
 *
 * 4dpグリッドベースのスペーシング定義
 * 全てのマージン・パディング・ギャップはこのスケールから選択する
 */

export interface MD3SpacingScale {
  /** 0dp */
  none: number;
  /** 4dp - アイコン内部、密なグループ間 */
  xs: number;
  /** 8dp - チップ内部パディング、密なリスト間 */
  sm: number;
  /** 12dp - カード内部パディング、入力フィールド内部 */
  md: number;
  /** 16dp - 標準パディング、セクション間 */
  lg: number;
  /** 20dp - カード間、リストアイテム間 */
  xl: number;
  /** 24dp - セクション間、ダイアログパディング */
  xxl: number;
  /** 32dp - 大セクション間 */
  xxxl: number;
  /** 40dp - ページ上部余白 */
  xxxxl: number;
  /** 48dp - 大きなセパレーション */
  xxxxxl: number;
}

export const md3Spacing: MD3SpacingScale = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
  xxxxxl: 48,
};
