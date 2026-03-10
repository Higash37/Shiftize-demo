/** @file FeedbackError.tsx @description エラーメッセージ表示コンポーネント */
import React from "react";
import { Text } from "react-native";
import { styles } from "./FeedbackError.styles";
import { ErrorMessageProps } from "./FeedbackError.types";

/** エラーメッセージを表示する。messageが空なら何も描画しない */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, textStyle, testID }) => {
  if (!message) return null;

  return (
    <Text style={[styles.error, textStyle]} testID={testID}>
      {message}
    </Text>
  );
};

export default ErrorMessage;
