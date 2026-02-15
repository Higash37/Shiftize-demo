import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createShiftAppearanceSettingsViewStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean },
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
      paddingTop: theme.spacing.xxxl,
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
      flexGrow: 1,
      width: "100%",
    },
    card: {
      width: breakpoint.isDesktop ? "60%" : breakpoint.isTablet ? "80%" : "90%",
      maxWidth: breakpoint.isDesktop ? 1000 : breakpoint.isTablet ? 800 : undefined,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.large,
      padding: theme.spacing.xxl,
      ...theme.elevation.level2.shadow,
      alignSelf: "center",
    },
    sectionTitle: {
      ...theme.typography.titleSmall,
      fontWeight: "700",
      marginBottom: theme.spacing.xxl,
      color: theme.colorScheme.onSurface,
    },
    listItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: breakpoint.isDesktop ? theme.spacing.lg : theme.spacing.xxl,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
      minHeight: breakpoint.isDesktop ? 60 : breakpoint.isTablet ? 56 : 52,
    },
    listText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
      fontWeight: "500",
      flex: 1,
    },
    valueButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      minWidth: 80,
    },
    valueText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginRight: theme.spacing.sm,
    },
    saveButton: {
      backgroundColor: theme.colorScheme.primary,
      borderRadius: theme.shape.medium,
      padding: theme.spacing.lg,
      alignItems: "center",
      marginTop: theme.spacing.xxl,
      width: "100%",
      alignSelf: "center",
      minHeight: breakpoint.isDesktop ? 48 : 44,
    },
    saveButtonText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "600",
      ...theme.typography.bodyMedium,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colorScheme.surface,
    },
    loadingText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.lg,
    },
  });
