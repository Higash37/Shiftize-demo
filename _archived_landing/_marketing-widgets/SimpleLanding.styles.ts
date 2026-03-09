import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

/** Marketing-specific palette (not part of MD3 system) */
const palette = {
  navSlash: "#ef4444",
  timelineLine: "#e5e7eb",
  finalCtaBackground: "#1e293b",
  finalCtaAccent: "#10b981",
  finalCtaSubText: "#cbd5e1",
  finalCtaFeature: "#e2e8f0",
  finalCtaTrust: "#94a3b8",
  finalCtaArrowBackground: "rgba(255, 255, 255, 0.2)",
  updateVersionBackground: "#eff6ff",
};

/**
 * SimpleLanding MD3スタイルファクトリ
 */
export const createSimpleLandingStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
) => {
  const { isTablet, isDesktop } = breakpoint;
  const sidebarWidth = isTablet ? 220 : 260;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
    },
    mainLayout: {
      flex: 1,
      flexDirection: "row",
    },
    leftSidebar: {
      width: sidebarWidth,
      backgroundColor: theme.colorScheme.surfaceContainerLow,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: theme.colorScheme.outlineVariant,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    rightSidebar: {
      width: sidebarWidth,
      backgroundColor: theme.colorScheme.surfaceContainerLow,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: theme.colorScheme.outlineVariant,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    sidebarHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    sidebarTitle: {
      ...theme.typography.titleSmall,
      color: theme.colorScheme.onSurface,
    },
    sidebarContent: {
      flex: 1,
    },
    navCategory: {
      marginBottom: theme.spacing.xxl,
    },
    navCategoryTitle: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
      paddingLeft: theme.spacing.xs,
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.shape.small,
      marginBottom: theme.spacing.xs,
      backgroundColor: "transparent",
    },
    navItemDisabled: {
      opacity: 0.6,
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
    },
    navItemIconContainer: {
      position: "relative",
    },
    navItemSlash: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 18,
      height: 18,
      borderWidth: 1,
      borderColor: palette.navSlash,
      transform: [{ rotate: "45deg" }],
      borderRadius: 1,
    },
    navItemContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    navItemTitleDisabled: {
      ...theme.typography.labelMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: 2,
    },
    navItemDescriptionDisabled: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 14,
      fontStyle: "italic",
    },
    mainContent: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
    },
    // Final CTA (marketing section - uses own palette)
    finalCTA: {
      paddingVertical: isDesktop ? 120 : isTablet ? 80 : 60,
      paddingHorizontal: isDesktop ? 40 : theme.spacing.xxl,
      backgroundColor: palette.finalCtaBackground,
      alignItems: "center",
    },
    finalCTAContent: {
      maxWidth: 800,
      alignItems: "center",
    },
    finalCTAHeadline: {
      fontSize: isDesktop ? 36 : isTablet ? 28 : 24,
      fontWeight: "bold",
      color: "#ffffff",
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    finalCTASubheadline: {
      fontSize: isDesktop ? 20 : 16,
      color: palette.finalCtaSubText,
      textAlign: "center",
      marginBottom: theme.spacing.xxxxl,
    },
    finalCTAFeatures: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.xxl,
      justifyContent: "center",
      marginBottom: theme.spacing.xxxxl,
    },
    finalCTAFeatureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    finalCTAFeatureText: {
      ...theme.typography.bodyLarge,
      color: palette.finalCtaFeature,
    },
    finalCTAButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.finalCtaAccent,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.xxxxl,
      borderRadius: theme.shape.large,
      gap: theme.spacing.lg,
      elevation: 0,
      marginBottom: theme.spacing.xxl,
    },
    finalCTAButtonContent: {
      alignItems: "center",
    },
    finalCTAButtonText: {
      color: "#ffffff",
      fontSize: 24,
      fontWeight: "bold",
    },
    finalCTAButtonSubtext: {
      ...theme.typography.bodyMedium,
      color: palette.finalCtaFeature,
    },
    finalCTAButtonArrow: {
      backgroundColor: palette.finalCtaArrowBackground,
      borderRadius: theme.shape.full,
      padding: theme.spacing.sm,
    },
    finalCTATrust: {
      flexDirection: "row",
      alignItems: "center",
      ...theme.typography.bodyMedium,
      color: palette.finalCtaTrust,
    },
    // Update timeline
    updateItem: {
      flexDirection: "row",
      marginBottom: theme.spacing.lg,
    },
    timelineContainer: {
      alignItems: "center",
      marginRight: theme.spacing.md,
      position: "relative",
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: theme.colorScheme.surfaceContainerLow,
      zIndex: 1,
    },
    timelineLine: {
      position: "absolute",
      top: 10,
      width: 2,
      height: 40,
      backgroundColor: palette.timelineLine,
    },
    updateContent: {
      flex: 1,
      paddingBottom: theme.spacing.sm,
    },
    updateHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    updateVersion: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.primary,
      backgroundColor: palette.updateVersionBackground,
      paddingHorizontal: theme.spacing.xs + 2,
      paddingVertical: 2,
      borderRadius: theme.shape.extraSmall,
    },
    updateDate: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
    },
    updateTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs + 2,
      marginBottom: theme.spacing.xs,
    },
    updateIcon: {
      fontSize: 14,
    },
    updateTitle: {
      ...theme.typography.labelMedium,
      color: theme.colorScheme.onSurface,
      flex: 1,
    },
    updateDescription: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 16,
    },
  });
};
