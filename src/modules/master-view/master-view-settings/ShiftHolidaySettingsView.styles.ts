import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createShiftHolidaySettingsViewStyles = (
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
      maxWidth: breakpoint.isDesktop ? 1100 : breakpoint.isTablet ? 850 : undefined,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.large,
      padding: theme.spacing.xxl,
      ...theme.elevation.level2.shadow,
      alignSelf: "center",
      marginBottom: theme.spacing.xxl,
    },
    sectionTitle: {
      ...theme.typography.titleSmall,
      fontWeight: "700",
      marginBottom: theme.spacing.xxl,
      color: theme.colorScheme.onSurface,
    },
    calendarContainer: {
      marginBottom: theme.spacing.xxl,
      borderRadius: theme.shape.medium,
      overflow: "hidden",
    },
    holidayList: {
      marginTop: theme.spacing.xxl,
    },
    holidayItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colorScheme.surfaceContainerLow,
      borderRadius: theme.shape.small,
      marginBottom: theme.spacing.sm,
      ...theme.elevation.level1.shadow,
    },
    holidayInfo: {
      flex: 1,
    },
    holidayDate: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
    },
    holidayName: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
      fontWeight: "500",
    },
    deleteButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.shape.small,
      backgroundColor: theme.colorScheme.error + "20",
    },
    addButton: {
      backgroundColor: theme.colorScheme.primary,
      borderRadius: theme.shape.medium,
      padding: theme.spacing.lg,
      alignItems: "center",
      marginTop: theme.spacing.lg,
      minHeight: breakpoint.isDesktop ? 48 : 44,
    },
    addButtonText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "600",
      ...theme.typography.bodyMedium,
    },
    bulkAddButton: {
      backgroundColor: theme.colorScheme.surface,
      borderWidth: 2,
      borderColor: theme.colorScheme.primary,
      flexDirection: "row",
      justifyContent: "center",
      marginTop: theme.spacing.sm,
    },
    bulkAddButtonText: {
      color: theme.colorScheme.primary,
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
    emptyText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      marginTop: theme.spacing.xxl,
      fontStyle: "italic",
    },
  });
