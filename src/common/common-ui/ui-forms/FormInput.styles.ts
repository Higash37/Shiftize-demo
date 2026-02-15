import { StyleSheet } from "react-native";
import { MD3Theme } from "../../common-theme/md3/MD3Theme.types";

/**
 * MD3 Outlined TextField スタイルファクトリ
 */
export const createInputStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.xs,
    },
    input: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colorScheme.outline,
      borderRadius: theme.shape.extraSmall,
      padding: theme.spacing.lg,
      fontSize: Math.max(theme.typography.bodyLarge.fontSize ?? 16, 16),
      lineHeight: theme.typography.bodyLarge.lineHeight,
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
