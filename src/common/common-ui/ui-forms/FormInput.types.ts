import { TextInputProps, StyleProp, TextStyle, ViewStyle } from "react-native";
import { BaseComponentProps } from "../../component-interfaces/componentTypes";

/**
 * Inputコンポーネントのスタイル名
 */
export type InputStyleName =
  | "container"
  | "label"
  | "input"
  | "inputError"
  | "helperText"
  | "errorText";

/**
 * Inputコンポーネントのプロパティ
 * TextInputPropsのstyleプロパティを除外してからBaseComponentPropsを拡張
 */
export interface InputProps
  extends Omit<TextInputProps, "style" | "accessibilityRole" | "testID" | "accessibilityLabel" | "accessibilityHint" | "accessibilityState" | "accessibilityValue">,
    BaseComponentProps {
  /**
   * 入力フィールドのラベル
   */
  label?: string;

  /**
   * エラーメッセージ（存在する場合、赤色で表示）
   */
  error?: string;

  /**
   * ヘルパーテキスト（入力フィールドの下に表示）
   */
  helper?: string;

  /**
   * ラベルのスタイル
   */
  labelStyle?: StyleProp<TextStyle>;

  /**
   * ヘルパーテキストのスタイル
   */
  helperStyle?: StyleProp<TextStyle>;
}
