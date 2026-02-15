import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createMasterDashboardViewStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
) => {
  const isWide = breakpoint.isTablet || breakpoint.isDesktop;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: breakpoint.isDesktop
        ? theme.spacing.xxxl
        : breakpoint.isTablet
          ? theme.spacing.xxl
          : theme.spacing.lg,
      maxWidth: breakpoint.isDesktop ? 1400 : breakpoint.isTablet ? 1000 : undefined,
      alignSelf: "center",
      width: "100%",
    },
    title: {
      ...(isWide
        ? theme.typography.headlineLarge
        : theme.typography.titleLarge),
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5,
    },
    subtitle: {
      ...(isWide
        ? theme.typography.titleLarge
        : theme.typography.bodyLarge),
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.xxxl,
      textAlign: "center",
      fontWeight: "400",
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    errorText: {
      color: theme.colorScheme.error,
      ...theme.typography.bodyMedium,
      textAlign: "center",
      padding: theme.spacing.lg,
    },
    stats: {
      flexDirection: "row",
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xxxl,
    },
    linksContainer: {
      width: "100%",
      maxWidth: 400,
      gap: theme.spacing.md,
    },
    card: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
      padding: theme.spacing.xxl,
      borderRadius: theme.shape.small,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      ...theme.elevation.level2.shadow,
    },
    value: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.colorScheme.primary,
      marginBottom: theme.spacing.sm,
    },
    label: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
    link: {
      backgroundColor: theme.colorScheme.primary,
      padding: theme.spacing.lg,
      borderRadius: theme.shape.small,
      alignItems: "center",
    },
    linkText: {
      color: theme.colorScheme.onPrimary,
      ...theme.typography.bodyMedium,
      fontWeight: "600",
    },
  });
};
