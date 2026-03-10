/** @file FormInput.styles.ts @description Inputコンポーネントのテーマ連動スタイル定義 */
import { StyleSheet } from "react-native";
import { MD3Theme } from "../../common-theme/md3/MD3Theme.types";

export const createInputStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xs,
    },
    label: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: 2,
    },
    input: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colorScheme.outline,
      borderRadius: theme.shape.extraSmall,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.bodyMedium.fontSize ?? 14,
      lineHeight: theme.typography.bodyMedium.lineHeight,
      color: theme.colorScheme.onSurface,
    },
    inputError: {
      borderColor: theme.colorScheme.error,
      borderWidth: 2,
    },
    helperText: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.xs,
    },
    errorText: {
      color: theme.colorScheme.error,
    },
  });
