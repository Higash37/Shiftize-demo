import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { theme } from "../../common-theme/ThemeDefinition";
import { styles } from "./FormButton.styles";
import { ButtonProps, ButtonStyleName } from "./FormButton.types";

/**
 * Button - 汎用的なボタンコンポーネント
 *
 * 様々なスタイルとサイズを持ち、アプリケーション内でアクションを実行するために使用します。
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
  
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}` as ButtonStyleName],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline"
              ? theme.colors.primary
              : theme.colors.text?.white || "#FFFFFF"
          }
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}` as ButtonStyleName],
            styles[`text_${size}` as ButtonStyleName],
          ]}
        >
          {typeof title === 'string' ? title : 'Button'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
