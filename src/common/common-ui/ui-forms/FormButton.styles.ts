import { StyleSheet } from "react-native";
import { MD3Theme } from "../../common-theme/md3/MD3Theme.types";
import { ButtonStyleName } from "./FormButton.types";

/**
 * MD3ボタンスタイルファクトリ
 *
 * - primary (Filled): primaryカラー背景, onPrimary文字色
 * - secondary (Filled Tonal): secondaryContainer背景, onSecondaryContainer文字色
 * - outline (Outlined): transparent背景, outline境界線, primary文字色
 * - text (Text): 背景なし, primary文字色
 */
export const createButtonStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: theme.shape.full,
      alignItems: "center",
      justifyContent: "center",
    },
    primary: {
      backgroundColor: theme.colorScheme.primary,
      ...theme.elevation.level1.shadow,
    },
    secondary: {
      backgroundColor: theme.colorScheme.secondaryContainer,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colorScheme.outline,
    },
    text: {
      backgroundColor: "transparent",
    },
    size_small: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 32,
    },
    size_medium: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xxl,
      minHeight: 40,
    },
    size_large: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxxl,
      minHeight: 48,
    },
    size_compact: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 36,
    },
    fullWidth: {
      width: "100%",
    },
    disabled: {
      opacity: 0.38,
    },
    text_base: {
      ...theme.typography.labelLarge,
    },
    text_primary: {
      color: theme.colorScheme.onPrimary,
    },
    text_secondary: {
      color: theme.colorScheme.onSecondaryContainer,
    },
    text_outline: {
      color: theme.colorScheme.primary,
    },
    text_text: {
      color: theme.colorScheme.primary,
    },
    text_small: {
      fontSize: theme.typography.labelMedium.fontSize,
    },
    text_medium: {
      fontSize: theme.typography.labelLarge.fontSize,
    },
    text_large: {
      fontSize: theme.typography.titleMedium.fontSize,
    },
    text_compact: {
      fontSize: theme.typography.labelLarge.fontSize,
    },
  }) as Record<ButtonStyleName, any>;
