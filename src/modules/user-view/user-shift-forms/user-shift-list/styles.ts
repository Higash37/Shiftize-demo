import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

type BreakpointInfo = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
};

export const createShiftListItemStyles = (
  theme: MD3Theme,
  bp: BreakpointInfo
) =>
  StyleSheet.create({
    shiftItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: bp.isMobile ? 4 : 6,
      borderWidth: 1,
      borderColor: theme.colorScheme.shift.approved,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderRadius: bp.isMobile ? theme.shape.small : theme.shape.medium,
      marginBottom: 3,
      width: "100%",
      marginLeft: 0,
      marginRight: 0,
      ...theme.elevation.level1.shadow,
    },
    shiftContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    textContainer: {
      flex: 1,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    shiftInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "nowrap",
    },
    dateContainer: {
      width: bp.isMobile ? 60 : 75,
    },
    dateText: {
      ...theme.typography.titleSmall,
      fontSize: bp.isMobile ? 13 : 15,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    nicknameContainer: {
      width: bp.isMobile ? 48 : 64,
      flexShrink: 1,
    },
    nicknameText: {
      ...theme.typography.titleSmall,
      fontSize: bp.isMobile ? 12 : 14,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
    },
    statusContainer: {
      width: bp.isMobile ? 58 : 70,
      marginRight: bp.isMobile ? 6 : 10,
    },
    timeText: {
      ...theme.typography.bodyMedium,
      fontSize: bp.isMobile ? 12 : 14,
      fontWeight: "500",
      color: theme.colorScheme.onSurface,
    },
    smallTimeText: {
      fontSize: 11,
    },
    userLabel: {
      color: theme.colorScheme.primary,
      backgroundColor: theme.colorScheme.primary + "20",
      paddingHorizontal: bp.isMobile ? 3 : theme.spacing.xs,
      paddingVertical: 1,
      borderRadius: theme.shape.extraSmall,
      fontSize: bp.isMobile ? 10 : 12,
      fontWeight: "500",
      textAlign: "center" as const,
      overflow: "hidden" as const,
    },
    detailsButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingVertical: 2,
      paddingHorizontal: theme.spacing.xs,
    },
    detailsText: {
      ...theme.typography.labelSmall,
      fontSize: bp.isMobile ? 11 : 13,
      color: theme.colorScheme.onSurfaceVariant,
    },
    detailsIcon: {
      marginLeft: 2,
    },
    selectedShiftItem: {
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderColor: theme.colorScheme.primary,
      borderWidth: 2,
    },
    timeContainer: {
      flexShrink: 1,
    },
  });

export const createShiftListViewStyles = (
  theme: MD3Theme,
  bp: BreakpointInfo
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      flexDirection: bp.isTablet ? "row" : "column",
      alignItems: bp.isTablet ? "flex-start" : "stretch",
      justifyContent: "flex-start",
    },
    tabletContainer: {
      width: "80%",
      height: "80%",
      alignSelf: "center",
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    defaultContainer: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    calendarContainer: {
      flex: bp.isTablet ? 1 : undefined,
      minWidth: bp.isTablet ? 400 : undefined,
      maxWidth: bp.isTablet ? 600 : undefined,
      width: bp.isTablet ? undefined : "98%",
      marginBottom: theme.spacing.xs,
      alignItems: "center",
      alignSelf: "center",
      padding: 0,
      margin: 0,
    },
    calendarContainerCompact: {
      marginTop: -40,
      marginBottom: 0,
    },
    listContainer: {
      flex: bp.isTablet ? 1 : undefined,
      width: "98%",
      minWidth: bp.isTablet ? 400 : undefined,
      maxWidth: 600,
      paddingHorizontal: 0,
      paddingLeft: 0,
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      alignSelf: "center",
    },
    listContentContainer: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      paddingHorizontal: 0,
      paddingBottom: 0,
      width: "100%",
      borderRadius: theme.shape.large,
    },
    noShiftContainer: {
      padding: theme.spacing.sm,
      alignItems: "center",
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderRadius: theme.shape.medium,
      width: "100%",
      alignSelf: "center",
      marginLeft: 0,
      marginRight: 0,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      ...theme.elevation.level1.shadow,
    },
    noShiftText: {
      ...theme.typography.bodyMedium,
      fontSize: bp.isMobile
        ? theme.typography.bodySmall.fontSize
        : theme.typography.bodyMedium.fontSize,
      color: theme.colorScheme.onSurfaceVariant,
    },
    addButton: {
      position: "absolute",
      right: 20,
      bottom: 20,
      width: bp.isMobile ? 48 : 56,
      height: bp.isMobile ? 48 : 56,
      borderRadius: bp.isMobile ? 24 : 28,
      backgroundColor: theme.colorScheme.primary,
      justifyContent: "center",
      alignItems: "center",
      ...theme.elevation.level3.shadow,
    },
    // Confirm button styles
    confirmButtonWrapper: {
      alignItems: "center",
      marginVertical: 0,
    },
    confirmButton: {
      backgroundColor: theme.colorScheme.primary,
      borderRadius: theme.shape.extraSmall,
      paddingVertical: 6,
      paddingHorizontal: theme.spacing.md,
      alignItems: "center",
    },
    confirmButtonCompleted: {
      backgroundColor: theme.colorScheme.onSurfaceVariant,
      opacity: 0.7,
    },
    confirmButtonText: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onPrimary,
      fontWeight: "600",
    },
    // Confirm modal styles
    confirmModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    confirmModalContent: {
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderRadius: theme.shape.medium,
      padding: theme.spacing.xxl,
      margin: theme.spacing.xl,
      maxWidth: 320,
      width: "90%",
    },
    confirmModalTitle: {
      ...theme.typography.titleMedium,
      fontSize: 18,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    confirmModalDescription: {
      ...theme.typography.bodyLarge,
      fontSize: 16,
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      marginBottom: theme.spacing.xxl,
      lineHeight: 22,
    },
    confirmModalButtonRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    confirmModalCancelButton: {
      flex: 1,
      backgroundColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.small,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    confirmModalCancelText: {
      ...theme.typography.labelLarge,
      fontSize: 16,
      color: theme.colorScheme.onSurface,
      fontWeight: "600",
    },
    confirmModalConfirmButton: {
      flex: 1,
      backgroundColor: theme.colorScheme.primary,
      borderRadius: theme.shape.small,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    confirmModalConfirmText: {
      ...theme.typography.labelLarge,
      fontSize: 16,
      color: theme.colorScheme.onPrimary,
      fontWeight: "600",
    },
  });

export const createModalStyles = (theme: MD3Theme, width: number) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContent: {
      width: width * 0.8,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderRadius: theme.shape.medium,
      padding: theme.spacing.xl,
      alignItems: "center",
      ...theme.elevation.level5.shadow,
    },
    modalTitle: {
      ...theme.typography.titleMedium,
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
    },
    modalButton: {
      backgroundColor: theme.colorScheme.primary,
      borderRadius: theme.shape.extraSmall,
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginVertical: 5,
      width: "100%",
      alignItems: "center",
    },
    modalButtonText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onPrimary,
      fontSize: 16,
    },
  });
