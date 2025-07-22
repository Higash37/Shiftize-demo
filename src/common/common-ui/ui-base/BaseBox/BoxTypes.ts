import { ViewProps } from "react-native";
import {
  Shadow,
  Variant,
  Padding,
  Margin,
  FlexContainerProps,
} from "../../ui-types/componentTypes";

/**
 * Box コンポーネントのスタイル名
 */
export type BoxStyleName =
  | Variant
  | `padding_${Padding}`
  | `margin_${Margin}`
  | `shadow_${Shadow}`
  | "base";

/**
 * Box コンポーネントのプロパティ
 */
export interface BoxProps extends ViewProps, FlexContainerProps {
  /**
   * 表示バリアント
   */
  variant?: Variant;

  /**
   * パディング設定
   */
  padding?: Padding;

  /**
   * マージン設定
   */
  margin?: Margin;

  /**
   * 影の設定
   */
  shadow?: Shadow;

  /**
   * 子要素
   */
  children?: React.ReactNode;
}
