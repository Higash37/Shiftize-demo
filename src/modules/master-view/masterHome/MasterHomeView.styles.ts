import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createMasterHomeViewStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    content: {
      flex: 1,
      width: breakpoint.isDesktop || breakpoint.isTablet ? 480 : "90%",
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.large,
      ...theme.elevation.level2.shadow,
      padding: breakpoint.isDesktop || breakpoint.isTablet
        ? theme.spacing.lg
        : theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginTop: breakpoint.isDesktop || breakpoint.isTablet ? 40 : 10,
      marginBottom: breakpoint.isDesktop || breakpoint.isTablet ? 40 : 10,
      minHeight: 250,
    },
    title: {
      ...(breakpoint.isDesktop || breakpoint.isTablet
        ? theme.typography.headlineLarge
        : theme.typography.titleLarge),
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5,
    },
    subtitle: {
      ...(breakpoint.isDesktop || breakpoint.isTablet
        ? theme.typography.titleLarge
        : theme.typography.bodyLarge),
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
      textAlign: "center",
      fontWeight: "400",
    },
  });
