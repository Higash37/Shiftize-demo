import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createInfoDashboardStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
) => {
  const { isTablet, isDesktop } = breakpoint;
  const isWide = isTablet || isDesktop;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    mainContent: {
      flex: 1,
      paddingHorizontal: isDesktop
        ? theme.spacing.xxxl
        : isTablet
          ? theme.spacing.xxl
          : theme.spacing.lg,
      maxWidth: isDesktop ? 1400 : isTablet ? 1000 : undefined,
      alignSelf: "center",
      width: "100%",
    },
    scrollContent: {
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xxxxxl,
    },

    // Section title
    sectionTitle: {
      ...theme.typography.titleMedium,
      fontWeight: "700",
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.lg,
    },

    // Budget button
    budgetButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colorScheme.primaryContainer,
      borderRadius: theme.shape.small,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xxl,
      ...theme.elevation.level1.shadow,
    },
    budgetButtonContent: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    budgetButtonText: {
      ...theme.typography.labelLarge,
      color: theme.colorScheme.onPrimaryContainer,
    },
    budgetStatusText: {
      ...theme.typography.labelSmall,
      marginTop: 2,
    },

    // Summary card (3-column horizontal)
    summaryCard: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.xxl,
      marginBottom: theme.spacing.xxl,
      ...theme.elevation.level2.shadow,
    },
    summaryGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    summaryItem: {
      alignItems: "center",
      flex: 1,
    },
    summaryValue: {
      ...(isWide ? theme.typography.headlineSmall : theme.typography.titleLarge),
      fontWeight: "700",
      color: theme.colorScheme.onSurface,
      marginTop: theme.spacing.xs,
    },
    summaryLabel: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },

    // Staff grid
    staffSection: {
      marginBottom: theme.spacing.xxl,
    },
    columnWrapper: {
      gap: theme.spacing.md,
    },
    staffCard: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      ...theme.elevation.level1.shadow,
    },
    staffName: {
      ...theme.typography.titleSmall,
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.xs,
    },
    staffHours: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
    },
    staffWage: {
      ...theme.typography.labelMedium,
      color: theme.colorScheme.primary,
      fontWeight: "600",
    },
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    progressBg: {
      flex: 1,
      height: 6,
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      borderRadius: 3,
      marginRight: theme.spacing.sm,
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    progressText: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      minWidth: 40,
      textAlign: "right",
    },

    // Budget vs Actual card
    budgetCard: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.xxl,
      marginBottom: theme.spacing.xxl,
      ...theme.elevation.level2.shadow,
    },
    budgetGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    budgetItem: {
      alignItems: "center",
      flex: 1,
    },
    budgetValue: {
      ...theme.typography.titleMedium,
      fontWeight: "700",
      color: theme.colorScheme.onSurface,
      marginTop: theme.spacing.xs,
    },
    budgetLabel: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
    budgetProgressBg: {
      height: 10,
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      borderRadius: 5,
      marginBottom: theme.spacing.sm,
    },
    budgetProgressFill: {
      height: "100%",
      borderRadius: 5,
    },
    budgetUsageText: {
      ...theme.typography.labelMedium,
      color: theme.colorScheme.onSurface,
      textAlign: "center",
      fontWeight: "600",
    },

    // Cost breakdown card
    costCard: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.xxl,
      marginBottom: theme.spacing.xxl,
      ...theme.elevation.level2.shadow,
    },
    costBarContainer: {
      marginBottom: theme.spacing.lg,
    },
    costBarHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    costBarLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
    },
    costBarAmount: {
      ...theme.typography.labelLarge,
      color: theme.colorScheme.onSurface,
      fontWeight: "600",
    },
    costBarBg: {
      height: 8,
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      borderRadius: 4,
    },
    costBarFill: {
      height: "100%",
      borderRadius: 4,
    },

    // Efficiency metrics card
    metricsCard: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.xxl,
      marginBottom: theme.spacing.xxl,
      ...theme.elevation.level2.shadow,
    },
    metricsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    metricItem: {
      alignItems: "center",
      flex: 1,
    },
    metricValue: {
      ...theme.typography.titleMedium,
      fontWeight: "700",
      color: theme.colorScheme.primary,
      marginTop: theme.spacing.xs,
    },
    metricLabel: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },

    // Loading / empty states
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    loadingText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.lg,
    },
    noDataContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.xxxxxl,
    },
    noDataTitle: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    noDataDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      maxWidth: 280,
      lineHeight: 20,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.xxl,
    },
    modalContent: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      borderRadius: theme.shape.extraLarge,
      padding: theme.spacing.xxl,
      ...theme.elevation.level3.shadow,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xxl,
    },
    modalTitle: {
      flex: 1,
      ...theme.typography.titleLarge,
      color: theme.colorScheme.onSurface,
      marginLeft: theme.spacing.sm,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    modalInputContainer: {
      marginBottom: theme.spacing.xxl,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colorScheme.surfaceContainerLow,
      borderRadius: theme.shape.small,
      borderWidth: 1,
      borderColor: theme.colorScheme.outline,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    currencySymbol: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginRight: theme.spacing.sm,
    },
    modalInput: {
      flex: 1,
      ...theme.typography.titleMedium,
      color: theme.colorScheme.onSurface,
      paddingVertical: theme.spacing.sm,
    },
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: theme.spacing.md,
    },
    modalButton: {
      minWidth: 80,
    },
  });
};
