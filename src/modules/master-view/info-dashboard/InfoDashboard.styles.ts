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
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xxxl,
    },

    // Section title
    sectionTitle: {
      ...theme.typography.labelLarge,
      fontWeight: "700",
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.sm,
    },

    // Budget button
    budgetButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colorScheme.primaryContainer,
      borderRadius: theme.shape.small,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
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
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.elevation.level1.shadow,
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
      ...(isWide ? theme.typography.titleMedium : theme.typography.titleSmall),
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

    // Mini card — individual metric box
    miniCard: {
      flex: 1,
      minWidth: isDesktop ? 140 : isTablet ? 120 : 100,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.sm,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
    },
    miniCardValue: {
      ...theme.typography.titleSmall,
      fontWeight: "700",
      color: theme.colorScheme.onSurface,
      marginTop: 2,
    },
    miniCardLabel: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: 1,
    },

    // Staff grid
    staffSection: {
      marginBottom: theme.spacing.md,
    },
    columnWrapper: {
      gap: theme.spacing.md,
    },
    staffCard: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      ...theme.elevation.level1.shadow,
    },
    staffName: {
      ...theme.typography.labelLarge,
      color: theme.colorScheme.onSurface,
    },
    staffHours: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.xs,
    },
    staffWage: {
      ...theme.typography.labelSmall,
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
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.elevation.level1.shadow,
    },
    budgetGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.sm,
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
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.elevation.level1.shadow,
    },
    costBarContainer: {
      marginBottom: theme.spacing.sm,
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
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.elevation.level1.shadow,
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

    // Task badges on staff cards
    taskBadgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginBottom: theme.spacing.xs,
    },
    taskBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    taskBadgeText: {
      fontSize: 13,
      fontWeight: "700",
    },

    // Task management section
    taskActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.shape.small,
    },
    taskRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colorScheme.surfaceContainerLow,
      borderRadius: theme.shape.small,
    },
    taskBadgeLg: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    taskInputLabel: {
      ...theme.typography.labelMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.xs,
    },
    taskInput: {
      backgroundColor: theme.colorScheme.surfaceContainerLow,
      borderRadius: theme.shape.small,
      borderWidth: 1,
      borderColor: theme.colorScheme.outline,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      color: theme.colorScheme.onSurface,
      ...theme.typography.bodyMedium,
    },

    // Assignment matrix
    assignHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
      marginBottom: theme.spacing.sm,
    },
    assignHeaderCell: {
      flex: 1,
      alignItems: "center",
      minWidth: 48,
    },
    assignUserRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.surfaceContainerHigh,
    },
    assignCheckCell: {
      flex: 1,
      alignItems: "center",
      minWidth: 48,
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

    // Tab bar
    tabBar: {
      flexDirection: "row",
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: 3,
      marginBottom: theme.spacing.md,
      ...theme.elevation.level1.shadow,
    },
    tabItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.shape.small,
    },
    tabItemActive: {
      backgroundColor: theme.colorScheme.primaryContainer,
    },
    tabLabel: {
      ...theme.typography.labelMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
    tabLabelActive: {
      color: theme.colorScheme.primary,
      fontWeight: "700",
    },
  });
};
