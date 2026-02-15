import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { ShiftListStyles } from "./ShiftList.types";
import { ShiftStatus } from "@/common/common-models/ModelIndex";

export const getStatusColor = (theme: MD3Theme, status: ShiftStatus) => {
  return theme.colorScheme.shift[status] ?? theme.colorScheme.onSurface;
};

export const createShiftListStyles = (theme: MD3Theme) =>
  StyleSheet.create<ShiftListStyles>({
    container: {
      padding: theme.spacing.lg,
    },
    shiftItem: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      padding: 6,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
    },
    shiftInfo: {
      flex: 1,
    },
    dateTime: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      marginBottom: theme.spacing.xs,
    },
    shiftType: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
    rightContainer: {
      alignItems: "flex-end",
    },
    statusText: {
      ...theme.typography.bodyMedium,
      marginBottom: theme.spacing.xs,
    },
    detailsButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    detailsButtonText: {
      ...theme.typography.bodyMedium,
      marginRight: theme.spacing.xs,
      color: theme.colorScheme.primary,
    },
    detailsContainer: {
      marginTop: theme.spacing.sm,
      padding: theme.spacing.xs,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderRadius: theme.shape.extraSmall,
    },
    detailSection: {
      marginBottom: theme.spacing.lg,
    },
    detailTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      marginBottom: theme.spacing.sm,
    },
    detailsText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
    timelineContainer: {
      marginBottom: theme.spacing.lg,
    },
    timeSlot: {
      paddingVertical: 2,
      paddingHorizontal: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    classTimeSlot: {
      backgroundColor: theme.colorScheme.primary,
    },
    timeSlotTitle: {
      ...theme.typography.bodyMedium,
      fontWeight: "bold",
    },
    changesContainer: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.sm,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderRadius: theme.shape.extraSmall,
    },
    changesTitle: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      marginBottom: theme.spacing.sm,
    },
    changesText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
  });
