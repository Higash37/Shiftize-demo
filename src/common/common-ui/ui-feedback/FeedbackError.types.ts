import { StyleProp, TextStyle } from "react-native";
import { BaseComponentProps } from "../../component-interfaces/componentTypes";

/**
 * ErrorMessageコンポーネントのプロパティ
 */
export interface ErrorMessageProps extends BaseComponentProps {
  /**
   * 表示するエラーメッセージ
   * 空の場合、コンポーネントは何も表示しません
   */
  message?: string;

  /**
   * テキストスタイルのオーバーライド
   */
  textStyle?: StyleProp<TextStyle>;

  /**
   * テストID
   */
  testID?: string;
}
