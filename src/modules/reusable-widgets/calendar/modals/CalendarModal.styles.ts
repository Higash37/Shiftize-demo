import { StyleSheet, Platform, Dimensions } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { CalendarModalStyles } from "./CalendarModal.types";

// 画面幅に基づいてカレンダーのサイズを計算
const SCREEN_WIDTH = Dimensions.get("window").width;
export const CALENDAR_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);
export const DAY_WIDTH = Math.floor(CALENDAR_WIDTH / 7);

export const createCalendarModalStyles = (theme: MD3Theme) =>
  StyleSheet.create<CalendarModalStyles>({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.medium,
      width: Platform.OS === "web" ? CALENDAR_WIDTH : "90%",
      maxWidth: CALENDAR_WIDTH,
      padding: theme.spacing.lg,
      ...theme.elevation.level4.shadow,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.titleMedium,
      fontWeight: "600",
      color: theme.colorScheme.onSurface,
    },
    closeButton: {
      fontSize: 20,
      color: theme.colorScheme.onSurfaceVariant,
      padding: theme.spacing.xs,
    },
    calendar: {
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.small,
    },
    calendarHeader: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
    },
    monthText: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
      color: theme.colorScheme.onSurface,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    button: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.shape.small,
      minWidth: 80,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    confirmButton: {
      backgroundColor: theme.colorScheme.primary,
    },
    cancelButtonText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      fontWeight: "500",
    },
    confirmButtonText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onPrimary,
      fontWeight: "500",
    },
    subtitle: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
  });
