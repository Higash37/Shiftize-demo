/**
 * @file ShiftDateSelector.styles.ts
 * @description ShiftDateSelector のスタイル定義 + カレンダーテーマ生成関数。
 */
import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { ShiftDateSelectorStyles } from "./types";

export const createShiftDateSelectorStyles = (theme: MD3Theme) =>
  StyleSheet.create<ShiftDateSelectorStyles>({
    container: {
      borderRadius: theme.shape.small,
      overflow: "hidden" as const,
      alignItems: "center" as const,
    },
    label: {
      ...theme.typography.titleMedium,
      fontWeight: "bold" as const,
      marginBottom: theme.spacing.sm,
      color: theme.colorScheme.onSurface,
    },
    calendar: {
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.small,
    },
    picker: {
      height: 50,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
    },
  });

export const createCalendarTheme = (theme: MD3Theme) => ({
  todayTextColor: theme.colorScheme.primary,
  selectedDayBackgroundColor: theme.colorScheme.primary,
  selectedDayTextColor: theme.colorScheme.onPrimary,
});
