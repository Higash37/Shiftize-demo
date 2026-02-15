import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createExtendedShiftReportStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surface,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colorScheme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    headerTitle: {
      ...theme.typography.titleLarge,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    submitButton: {
      backgroundColor: theme.colorScheme.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.shape.small,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colorScheme.outline,
    },
    submitButtonText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "600",
    },
    shiftInfo: {
      backgroundColor: theme.colorScheme.primaryContainer,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    shiftInfoText: {
      ...theme.typography.bodyLarge,
      fontWeight: "500",
      color: theme.colorScheme.onSurface,
      textAlign: "center",
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    section: {
      marginVertical: theme.spacing.sm,
    },
    sectionTitle: {
      ...theme.typography.titleMedium,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.md,
    },
    noTasksContainer: {
      alignItems: "center",
      paddingVertical: theme.spacing.xxxxl,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
    },
    noTasksText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.md,
    },
    taskItem: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: "transparent",
    },
    taskItemSelected: {
      borderColor: theme.colorScheme.primary,
      ...theme.elevation.level1.shadow,
    },
    taskHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: theme.spacing.sm,
    },
    taskInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    taskTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.xs,
    },
    taskDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      lineHeight: 18,
    },
    taskBadges: {
      alignItems: "flex-end",
      gap: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    typeBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 10,
    },
    priorityBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 10,
    },
    badgeText: {
      color: theme.colorScheme.onPrimary,
      fontSize: 10,
      fontWeight: "bold",
    },
    timeRestriction: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.shape.extraSmall,
    },
    timeRestrictionText: {
      fontSize: 12,
      color: theme.colorScheme.tertiary,
      fontWeight: "500",
    },
    baseInfo: {
      marginBottom: theme.spacing.sm,
    },
    baseInfoText: {
      fontSize: 12,
      color: theme.colorScheme.onSurfaceVariant,
    },
    executionInputs: {
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      padding: theme.spacing.md,
      borderRadius: theme.shape.small,
      marginTop: theme.spacing.sm,
    },
    inputRow: {
      flexDirection: "row",
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    inputGroup: {
      flex: 1,
    },
    inputLabel: {
      ...theme.typography.bodyMedium,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.sm,
    },
    counterContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    counterButton: {
      backgroundColor: theme.colorScheme.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    counterValue: {
      ...theme.typography.titleMedium,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
      minWidth: 40,
      textAlign: "center",
    },
    notesInput: {
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.small,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      ...theme.typography.bodyMedium,
      backgroundColor: theme.colorScheme.surface,
      textAlignVertical: "top",
    },
    commentsInput: {
      backgroundColor: theme.colorScheme.surface,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.small,
      padding: theme.spacing.md,
      ...theme.typography.bodyLarge,
      textAlignVertical: "top",
      minHeight: 100,
    },
  });
