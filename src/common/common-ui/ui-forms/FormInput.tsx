import React from "react";
import { View, TextInput, Text, StyleProp, TextStyle } from "react-native";
import { createInputStyles } from "./FormInput.styles";
import { InputProps } from "./FormInput.types";
import { useThemedStyles } from "../../common-theme/md3/useThemedStyles";
import { useMD3Theme } from "../../common-theme/md3/MD3ThemeContext";

/**
 * Input - MD3 Outlined TextField スタイルの入力コンポーネント
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
  const styles = useThemedStyles(createInputStyles);
  const { colorScheme } = useMD3Theme();

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
