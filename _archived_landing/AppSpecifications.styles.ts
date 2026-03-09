import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { responsiveStyles } from "./utils/responsive";

export const createAppSpecificationsStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingVertical: responsiveStyles.padding(40),
      paddingHorizontal: responsiveStyles.padding(20),
      alignItems: "center",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      marginBottom: 20,
      gap: 8,
    },
    backButtonText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurfaceVariant,
    },
    pageTitle: {
      fontSize: responsiveStyles.fontSize(32),
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      textAlign: "center",
      marginBottom: 8,
    },
    pageSubtitle: {
      fontSize: responsiveStyles.fontSize(16),
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      maxWidth: 600,
    },

    // Tabs
    tabsContainer: {
      paddingHorizontal: responsiveStyles.padding(20),
      marginBottom: 20,
    },
    tabsScrollContent: {
      paddingHorizontal: 0,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginRight: 12,
      borderRadius: theme.shape.medium,
      backgroundColor: theme.colorScheme.surface,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      gap: 8,
    },
    activeTab: {
      backgroundColor: theme.colorScheme.primaryContainer,
      borderColor: theme.colorScheme.primary,
    },
    tabText: {
      ...theme.typography.bodyMedium,
      fontWeight: "500",
      color: theme.colorScheme.onSurfaceVariant,
    },
    activeTabText: {
      color: theme.colorScheme.primary,
    },

    // Content
    contentContainer: {
      paddingHorizontal: responsiveStyles.padding(20),
      paddingBottom: 40,
    },
    tabContent: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.large,
      padding: responsiveStyles.padding(24),
      ...theme.elevation.level1.shadow,
    },
    tabDescription: {
      fontSize: responsiveStyles.fontSize(16),
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 24,
      marginBottom: 32,
    },

    // Architecture
    architectureSection: {
      marginBottom: 32,
    },
    architectureSectionTitle: {
      fontSize: responsiveStyles.fontSize(20),
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: 16,
    },
    architectureItem: {
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      padding: 16,
      borderRadius: theme.shape.medium,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colorScheme.primary,
    },
    architectureItemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    architectureItemName: {
      ...theme.typography.bodyLarge,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
    },
    architectureItemVersion: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.primary,
      backgroundColor: theme.colorScheme.primary + "1A",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.shape.extraSmall,
    },
    architectureItemDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 18,
    },

    // Features
    featureSection: {
      marginBottom: 32,
    },
    featureSectionTitle: {
      fontSize: responsiveStyles.fontSize(18),
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: 8,
    },
    featureSectionDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: 16,
      lineHeight: 20,
    },
    specificationsList: {
      gap: 8,
    },
    specificationItem: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    specificationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colorScheme.success,
      marginTop: 6,
      marginRight: 12,
    },
    specificationText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
      flex: 1,
      lineHeight: 20,
    },

    // Security
    securitySection: {
      marginBottom: 32,
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      padding: 20,
      borderRadius: theme.shape.medium,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
    },
    securityHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    securityTitle: {
      fontSize: responsiveStyles.fontSize(18),
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    securityLevel: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: theme.shape.medium,
    },
    securityLevelText: {
      ...theme.typography.labelSmall,
      fontWeight: "600",
      color: theme.colorScheme.onPrimary,
    },
    securitySpecs: {
      gap: 12,
    },
    securitySpecItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    securitySpecText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
      flex: 1,
      lineHeight: 20,
    },

    // Technical
    technicalSection: {
      marginBottom: 32,
    },
    technicalTitle: {
      fontSize: responsiveStyles.fontSize(18),
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: 8,
    },
    technicalDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: 16,
      lineHeight: 20,
      fontStyle: "italic",
    },
    technicalDetails: {
      gap: 10,
    },
    technicalDetailItem: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    technicalDetailDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colorScheme.secondary,
      marginTop: 8,
      marginRight: 12,
    },
    technicalDetailText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
      flex: 1,
      lineHeight: 20,
    },

    // Common Container
    containerMax: {
      maxWidth: responsiveStyles.maxWidth(),
      alignSelf: "center",
      width: responsiveStyles.pcWidth() as any,
    },
  });

export default createAppSpecificationsStyles;
