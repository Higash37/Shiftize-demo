/**
 * Material Design 3 シェイプスケール
 *
 * コンテナの角丸を統一するためのスケール定義
 * MD3ではコンポーネントのサイズ・重要度に応じてシェイプが決まる
 *
 * 使用例:
 * - extraSmall: チップ、スナックバー
 * - small: ボタン、テキストフィールド
 * - medium: カード、ダイアログ
 * - large: FAB、ナビゲーションドロワー
 * - extraLarge: ボトムシート
 * - full: アバター、バッジ
 */

export interface MD3ShapeScale {
  none: number;
  extraSmall: number;
  small: number;
  medium: number;
  large: number;
  extraLarge: number;
  full: number;
}

export const md3Shape: MD3ShapeScale = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 28,
  full: 9999,
};
