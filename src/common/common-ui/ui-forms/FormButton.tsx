import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { createButtonStyles } from "./FormButton.styles";
import { ButtonProps, ButtonStyleName } from "./FormButton.types";
import { useThemedStyles } from "../../common-theme/md3/useThemedStyles";
import { useMD3Theme } from "../../common-theme/md3/MD3ThemeContext";

/**
 * Button - MD3準拠の汎用ボタンコンポーネント
 *
 * @example
 * ```tsx
 * <Button
 *   title="保存する"
 *   onPress={handleSave}
 *   variant="primary"
 *   size="medium"
 *   loading={isSaving}
 * />
 * ```
 */
const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}) => {
  const styles = useThemedStyles(createButtonStyles);
  const { colorScheme } = useMD3Theme();

  const indicatorColor =
    variant === "primary"
      ? colorScheme.onPrimary
      : colorScheme.primary;

  return (
    <TouchableOpacity
      style={[
        styles["base"],
        styles[variant],
        styles[`size_${size}` as ButtonStyleName],
        fullWidth && styles["fullWidth"],
        disabled && styles["disabled"],
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <Text
          style={[
            styles.text_base,
            styles[`text_${variant}` as ButtonStyleName],
            styles[`text_${size}` as ButtonStyleName],
          ]}
        >
          {typeof title === "string" ? title : "Button"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
