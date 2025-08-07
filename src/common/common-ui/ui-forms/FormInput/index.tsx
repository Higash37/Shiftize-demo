import React from "react";
import { View, TextInput, Text, StyleProp, TextStyle } from "react-native";
import { theme } from "../../../common-theme/ThemeDefinition";
import { designSystem } from "../../../common-constants/DesignSystem";
import { colors } from "../../../common-constants/ColorConstants";
import { styles } from "./styles";
import { InputProps } from "./types";

/**
 * Input - 汎用的なテキスト入力コンポーネント
 *
 * ラベル、エラーメッセージ、ヘルパーテキストをサポートする入力フィールドです。
 * フォーム要素として使用するための基本的な入力コンポーネントです。
 *
 * @example
 * ```tsx
 * <Input
 *   label="名前"
 *   placeholder="山田 太郎"
 *   value={name}
 *   onChangeText={setName}
 *   error={errors.name}
 * />
 * ```
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  style,
  labelStyle,
  helperStyle,
  testID,
  ...props
}) => {
  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={
          [
            styles.input,
            error ? styles.inputError : undefined,
            style,
          ] as StyleProp<TextStyle>
        }
        placeholderTextColor="#999"
        {...props}
      />
      {(error || helper) && (
        <Text
          style={
            [
              styles.helperText,
              error ? styles.errorText : undefined,
              helperStyle,
            ] as StyleProp<TextStyle>
          }
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

export default Input;
