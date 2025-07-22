import React from "react";
import { Text } from "react-native";
import { styles } from "./styles";
import { ErrorMessageProps } from "./types";

/**
 * ErrorMessage - エラーメッセージ表示コンポーネント
 *
 * フォームやその他のコンポーネントでエラーを表示するために使用します。
 * メッセージが空の場合は何も表示しません。
 *
 * @example
 * ```tsx
 * <ErrorMessage message={formErrors.email} />
 * ```
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, textStyle, testID }) => {
  if (!message) return null;

  return (
    <Text style={[styles.error, textStyle]} testID={testID}>
      {message}
    </Text>
  );
};

export default ErrorMessage;
