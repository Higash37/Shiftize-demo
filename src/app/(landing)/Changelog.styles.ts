import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createChangelogStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: theme.colorScheme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      ...theme.typography.titleLarge,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    scrollView: {
      flex: 1,
    },
    titleSection: {
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    pageTitle: {
      ...theme.typography.headlineLarge,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: 16,
      textAlign: "center",
    },
    pageSubtitle: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 26,
    },
    filterSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    filterScroll: {
      flexGrow: 0,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      marginRight: 12,
      backgroundColor: theme.colorScheme.surface,
    },
    filterButtonActive: {
      borderWidth: 2,
      backgroundColor: theme.colorScheme.primary + "1F",
    },
    filterButtonText: {
      ...theme.typography.bodyMedium,
      fontWeight: "600",
      color: theme.colorScheme.onSurfaceVariant,
    },
    changelogSection: {
      paddingHorizontal: 20,
    },
    changelogItem: {
      backgroundColor: theme.colorScheme.surface,
      padding: 24,
      borderRadius: theme.shape.large,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      ...theme.elevation.level2.shadow,
      position: "relative",
    },
    changelogHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    versionInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    version: {
      ...theme.typography.titleMedium,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.shape.medium,
    },
    categoryBadgeText: {
      color: theme.colorScheme.onPrimary,
      ...theme.typography.labelSmall,
      fontWeight: "600",
    },
    statusInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statusText: {
      ...theme.typography.labelSmall,
      fontWeight: "600",
    },
    date: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: 12,
    },
    changelogTitle: {
      ...theme.typography.titleLarge,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: 8,
    },
    changelogDescription: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 22,
      marginBottom: 16,
    },
    changesList: {
      marginBottom: 16,
    },
    changesTitle: {
      ...theme.typography.bodyMedium,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: 8,
    },
    changeItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    changeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 10,
      marginTop: 6,
    },
    changeText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
      flex: 1,
      lineHeight: 20,
    },
    impactSection: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colorScheme.success + "1F",
      padding: 12,
      borderRadius: theme.shape.small,
      gap: 8,
    },
    impactText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.success,
      fontWeight: "500",
      flex: 1,
    },
    timelineConnector: {
      position: "absolute",
      left: -10,
      top: "100%",
      width: 2,
      height: 20,
      backgroundColor: theme.colorScheme.outlineVariant,
    },
    futurePlansSection: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    sectionTitle: {
      ...theme.typography.headlineSmall,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: 20,
      textAlign: "center",
    },
    futurePlanCard: {
      backgroundColor: theme.colorScheme.surface,
      padding: 24,
      borderRadius: theme.shape.large,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      ...theme.elevation.level2.shadow,
    },
    futurePlanTitle: {
      ...theme.typography.titleMedium,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginTop: 12,
      marginBottom: 12,
      textAlign: "center",
    },
    futurePlanText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 22,
    },
  });

export default createChangelogStyles;
