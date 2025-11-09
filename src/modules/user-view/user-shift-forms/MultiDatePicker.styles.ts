import { StyleSheet } from "react-native";
import { MultiDatePickerStyles } from "./types";
import { colors } from "@/common/common-constants/ThemeConstants";

export const styles = StyleSheet.create<MultiDatePickerStyles>({
  container: {
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    maxWidth: 600, // PC画面での最大幅を設定
    alignSelf: "center" as const, // 中央揃え
  },
  label: {
    fontSize: 16,
    fontWeight: "bold" as const,
    marginBottom: 12,
    color: colors.text.primary,
  },
  calendar: {
    borderRadius: 12,
    overflow: "hidden" as const,
    marginHorizontal: 0, // PC画面での中央揃え
  },
});

export const calendarTheme = {
  todayTextColor: colors.error,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: colors.text.white,
  textDayFontWeight: "bold" as const,
};
