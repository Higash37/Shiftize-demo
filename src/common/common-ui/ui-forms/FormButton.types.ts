/** @file FormButton.types.ts @description Buttonコンポーネントの型定義 */
import { Size, BaseComponentProps } from "../componentTypes";

/**
 * MD3ボタンバリアント
 * - primary (filled): 最も目立つアクション
 * - secondary (filled-tonal): 重要度中のアクション
 * - outline: 境界線付き
 * - text: テキストのみ（最も控えめ）
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "text";

/**
 * ボタンのスタイル名
 */
export type ButtonStyleName =
  | ButtonVariant
  | `size_${Size}`
  | `text_${ButtonVariant}`
  | `text_${Size}`
  | "base"
  | "text_base"
  | "fullWidth"
  | "disabled";

/**
 * Buttonコンポーネントのプロパティ
 */
export interface ButtonProps extends BaseComponentProps {
  /**
   * クリック時に呼び出されるコールバック関数
   */
  onPress: () => void;

  /**
   * ボタンのテキスト
   */
  title: string;

  /**
   * ボタンの表示バリアント
   */
  variant?: ButtonVariant;

  /**
   * ボタンのサイズ
   */
  size?: Size;

  /**
   * 無効化フラグ。trueの場合、ボタンは操作不能になります
   */
  disabled?: boolean;

  /**
   * ローディング表示フラグ。trueの場合、ボタンにローディングインジケータが表示されます
   */
  loading?: boolean;

  /**
   * 親要素の幅いっぱいに広がるかどうか
   */
  fullWidth?: boolean;
}
