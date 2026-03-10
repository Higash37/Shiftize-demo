/** @file FormInput.tsx @description MD3 Outlined TextFieldスタイルのテキスト入力コンポーネント */
import React from "react";
import { View, TextInput, Text, StyleProp, TextStyle } from "react-native";
import { createInputStyles } from "./FormInput.styles";
import { InputProps } from "./FormInput.types";
import { useThemedStyles } from "../../common-theme/md3/useThemedStyles";
import { useMD3Theme } from "../../common-theme/md3/MD3ThemeContext";

/** テキスト入力。label, error, helperの表示に対応。Props: InputProps */
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
  // --- Hooks ---
  const styles = useThemedStyles(createInputStyles);
  const { colorScheme } = useMD3Theme();

  // --- Render ---
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
        placeholderTextColor={colorScheme.onSurfaceVariant}
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
