import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    label: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      marginBottom: theme.spacing.md,
      color: theme.colorScheme.onSurface,
    },
    calendar: {
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.small,
    },
    dateContainer: {
      marginBottom: theme.spacing.lg,
    },
    dateItem: {
      padding: theme.spacing.md,
      backgroundColor: theme.colorScheme.surface,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.shape.small,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dateText: {
      ...theme.typography.bodyLarge,
    },
    removeButton: {
      color: theme.colorScheme.error,
      fontWeight: "bold",
    },
    pickerContainer: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.lg,
    },
    picker: {
      height: 150,
    },
  });
