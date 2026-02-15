import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createSettingsBackupViewStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    containerTablet: {
      paddingHorizontal: theme.spacing.xxl,
      maxWidth: 1000,
      alignSelf: "center",
      width: "100%",
    },
    containerDesktop: {
      paddingHorizontal: theme.spacing.xxxl,
      maxWidth: 1400,
      alignSelf: "center",
      width: "100%",
    },
    scrollContainer: {
      flex: 1,
      width: "100%",
    },
    card: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.xxl,
      marginBottom: theme.spacing.xxl,
      alignSelf: "center",
      ...theme.elevation.level2.shadow,
    },
    sectionTitle: {
      ...theme.typography.titleMedium,
      fontWeight: "700",
      marginBottom: theme.spacing.lg,
      color: theme.colorScheme.onSurface,
    },
    sectionDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.xxl,
      lineHeight: 20,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.lg,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
    },
    dangerButton: {
      borderColor: theme.colorScheme.error,
      backgroundColor: theme.colorScheme.errorContainer,
    },
    buttonIcon: {
      width: 40,
      alignItems: "center",
      marginRight: theme.spacing.lg,
    },
    buttonContent: {
      flex: 1,
    },
    buttonTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.sm,
    },
    buttonDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 18,
    },
    dangerText: {
      color: theme.colorScheme.error,
    },
    infoCard: {
      backgroundColor: "#FF9500" + "10",
      borderRadius: theme.shape.small,
      padding: theme.spacing.xxl,
      borderWidth: 1,
      borderColor: "#FF9500" + "30",
    },
    infoHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    infoTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "600",
      color: "#FF9500",
      marginLeft: theme.spacing.sm,
    },
    infoText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colorScheme.surface,
    },
    loadingText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.lg,
    },
  });
