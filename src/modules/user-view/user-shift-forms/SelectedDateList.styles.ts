/**
 * @file SelectedDateList.styles.ts
 * @description SelectedDateList のスタイル定義。
 */
import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createSelectedDateListStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.shape.large,
      elevation: 0,
    },
    label: {
      ...theme.typography.titleMedium,
      fontWeight: "bold" as const,
      marginBottom: theme.spacing.sm,
      color: theme.colorScheme.onSurface,
    },
    calendar: {
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.small,
    },
    title: {
      ...theme.typography.titleMedium,
      fontWeight: "bold" as const,
      marginBottom: theme.spacing.md,
      color: theme.colorScheme.primary,
    },
    item: {
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      padding: theme.spacing.md,
      borderRadius: theme.shape.medium,
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.sm,
    },
    dateText: {
      fontSize: 15,
      fontWeight: "500",
    },
    removeText: {
      color: theme.colorScheme.primary,
      fontWeight: "bold" as const,
    },
    noneText: {
      color: theme.colorScheme.onSurfaceVariant,
      fontStyle: "italic",
    },
    picker: {
      height: 50,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
    },
  });
