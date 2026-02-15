import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { ShiftDetailsStyles } from "./ShiftDetails.types";

export const createShiftDetailsStyles = (theme: MD3Theme) =>
  StyleSheet.create<ShiftDetailsStyles>({
    container: {
      overflow: "hidden",
      backgroundColor: theme.colorScheme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    header: {
      marginBottom: theme.spacing.sm,
    },
    nickname: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    date: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: 2,
    },
    timeSlots: {
      gap: theme.spacing.sm,
    },
    timeSlot: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.xs,
    },
    classTimeSlot: {
      backgroundColor: theme.colorScheme.primary + "10",
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.shape.extraSmall,
    },
    timeSlotLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      width: 60,
    },
    classLabel: {
      color: theme.colorScheme.primary,
    },
    timeText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
    },
    classTime: {
      color: theme.colorScheme.primary,
      fontWeight: "bold",
    },
  });
