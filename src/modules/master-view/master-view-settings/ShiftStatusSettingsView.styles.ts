import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createShiftStatusSettingsViewStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: theme.spacing.xxxl,
    },
    scrollContent: {
      paddingBottom: theme.spacing.lg,
      width: "100%",
    },
    statusItem: {
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.xl,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.medium,
      borderWidth: 0,
      ...theme.elevation.level0.shadow,
    },
    statusHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    colorPreview: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: theme.spacing.sm,
    },
    statusLabel: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
    },
    description: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    colorButton: {
      backgroundColor: theme.colorScheme.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.shape.extraSmall,
    },
    colorButtonText: {
      color: theme.colorScheme.onPrimary,
      ...theme.typography.bodyMedium,
    },
  });
