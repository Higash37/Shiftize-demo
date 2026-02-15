import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { MultiDatePickerStyles } from "./types";

export const createMultiDatePickerStyles = (theme: MD3Theme) =>
  StyleSheet.create<MultiDatePickerStyles>({
    container: {
      marginBottom: theme.spacing.xxl,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.large,
      padding: theme.spacing.lg,
      elevation: 2,
      maxWidth: 600,
      alignSelf: "center" as const,
    },
    label: {
      ...theme.typography.titleMedium,
      fontWeight: "bold" as const,
      marginBottom: theme.spacing.md,
      color: theme.colorScheme.onSurface,
    },
    calendar: {
      borderRadius: theme.shape.medium,
      overflow: "hidden" as const,
      marginHorizontal: 0,
    },
  });

export const createCalendarTheme = (theme: MD3Theme) => ({
  todayTextColor: theme.colorScheme.error,
  selectedDayBackgroundColor: theme.colorScheme.primary,
  selectedDayTextColor: theme.colorScheme.onPrimary,
  textDayFontWeight: "bold" as const,
});
