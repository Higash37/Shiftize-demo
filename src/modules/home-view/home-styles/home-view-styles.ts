import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createHomeViewStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
      justifyContent: "flex-start",
      alignItems: "stretch",
    },
    centerContent: {
      width: "100%",
      flexShrink: 0,
      alignItems: "flex-start",
      flex: 1,
    },
    title: {
      ...theme.typography.titleMedium,
      fontWeight: "bold",
      color: theme.colorScheme.primary,
      marginVertical: theme.spacing.lg,
    },
    headerCell: {
      paddingVertical: theme.spacing.sm,
      alignItems: "center",
      borderRightWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      backgroundColor: theme.colorScheme.surface,
    },
    timeHeaderCell: {
      backgroundColor: theme.colorScheme.primary + "10",
      borderTopLeftRadius: theme.shape.medium,
      borderBottomLeftRadius: theme.shape.medium,
      borderRightWidth: 1,
      borderColor: theme.colorScheme.primary,
    },
    positionHeaderCell: {
      backgroundColor: theme.colorScheme.secondary + "10",
      borderTopLeftRadius: theme.shape.medium,
      borderBottomLeftRadius: theme.shape.medium,
      borderRightWidth: 1,
      borderColor: theme.colorScheme.secondary,
    },
    headerText: {
      ...theme.typography.bodyMedium,
      fontWeight: "bold",
      color: theme.colorScheme.primary,
    },
    cell: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
      borderRightWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      minHeight: 26,
      backgroundColor: theme.colorScheme.surface,
    },
    timeCell: {
      backgroundColor: theme.colorScheme.primary + "10",
      borderBottomLeftRadius: theme.shape.medium,
      borderTopLeftRadius: 0,
      borderRightWidth: 1,
      borderColor: theme.colorScheme.primary,
    },
    positionCell: {
      backgroundColor: theme.colorScheme.secondary + "10",
      borderBottomLeftRadius: theme.shape.medium,
      borderTopLeftRadius: 0,
      borderRightWidth: 1,
      borderColor: theme.colorScheme.secondary,
    },
    timeText: {
      ...theme.typography.bodyMedium,
      fontWeight: "bold",
      color: theme.colorScheme.primary,
    },
    positionText: {
      ...theme.typography.bodyMedium,
      fontWeight: "bold",
      color: theme.colorScheme.secondary,
    },
    taskText: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
    },
    datePickerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      minHeight: 48,
    },
    dateNavBtn: {
      ...theme.typography.titleLarge,
      color: theme.colorScheme.primary,
      fontWeight: "bold",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
    },
    dateLabel: {
      ...theme.typography.titleSmall,
      color: theme.colorScheme.onSurface,
      fontWeight: "bold",
      paddingHorizontal: theme.spacing.sm,
    },
  });
