import { Size, Variant, BaseComponentProps } from "../componentTypes";

/**
 * ボタンのスタイル名
 */
export type ButtonStyleName =
  | Variant
  | `size_${Size}`
  | `text_${Variant}`
  | `text_${Size}`
  | "base"
  | "text"
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
  variant?: Extract<Variant, "primary" | "secondary" | "outline">;

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
