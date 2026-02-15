import { StyleSheet, Platform } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

/**
 * LayoutHeader MD3スタイルファクトリ
 */
export const createHeaderStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.xs,
      backgroundColor: theme.colorScheme.surfaceContainer,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colorScheme.outlineVariant,
      position: "relative",
      zIndex: 10,
      elevation: 0,
      ...(Platform.OS === "web" &&
        ({
          backdropFilter: "blur(18px)",
        } as any)),
      width: "100%",
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    headerCompact: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    leftContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    leftContainerCompact: {
      marginRight: theme.spacing.sm,
    },
    rightContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    rightContainerCompact: {
      gap: theme.spacing.xs,
    },
    backButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.sm,
    },
    title: {
      ...theme.typography.titleLarge,
      color: theme.colorScheme.onSurface,
    },
    titleCompact: {
      fontSize: theme.typography.titleMedium.fontSize,
    },
    signOutButton: {
      padding: theme.spacing.sm,
    },
    serviceIntroButton: {
      padding: theme.spacing.sm,
    },
    compactActionButton: {
      paddingHorizontal: 6,
      paddingVertical: 6,
    },
    storeButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colorScheme.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.shape.small,
      gap: theme.spacing.xs,
      flexShrink: 1,
    },
    storeButtonCompact: {
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    storeButtonText: {
      color: theme.colorScheme.onPrimary,
      ...theme.typography.labelLarge,
      flexShrink: 1,
    },
    storeButtonTextCompact: {
      fontSize: theme.typography.labelMedium.fontSize,
    },
    kanbanButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.xs,
    },
    notificationButton: {
      padding: theme.spacing.sm,
      position: "relative",
    },
    lineNotificationButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.xs,
    },
    badge: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: theme.colorScheme.error,
      borderRadius: theme.shape.full,
      minWidth: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    badgeText: {
      color: theme.colorScheme.onError,
      ...theme.typography.labelSmall,
      fontWeight: "bold",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.32)",
      justifyContent: "center",
      alignItems: "center",
    },
    storeModalContainer: {
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      width: "80%",
      maxWidth: 400,
      borderRadius: theme.shape.extraLarge,
      maxHeight: "70%",
    },
    storeModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    storeModalTitle: {
      ...theme.typography.titleLarge,
      color: theme.colorScheme.onSurface,
    },
    storeList: {
      maxHeight: 300,
    },
    storeItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    storeItemSelected: {
      backgroundColor: theme.colorScheme.primaryContainer,
    },
    storeItemText: {
      ...theme.typography.bodyLarge,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
      flex: 1,
    },
    storeItemTextSelected: {
      color: theme.colorScheme.primary,
    },
    storeItemName: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginHorizontal: theme.spacing.sm,
    },
    storeManagementOptions: {
      paddingTop: theme.spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colorScheme.outlineVariant,
    },
    managementOption: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: theme.spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    managementOptionText: {
      ...theme.typography.bodyLarge,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
    },
    managementOptionSubtext: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: 2,
    },
  });
