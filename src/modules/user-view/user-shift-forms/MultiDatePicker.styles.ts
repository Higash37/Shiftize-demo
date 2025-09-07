import { StyleSheet } from "react-native";
import { MultiDatePickerStyles } from "./types";

export const styles = StyleSheet.create<MultiDatePickerStyles>({
  container: {
    marginBottom: 24,
    backgroundColor: "#fff",
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
    color: "#003366",
  },
  calendar: {
    borderRadius: 12,
    overflow: "hidden" as const,
    marginHorizontal: 0, // PC画面での中央揃え
  },
});

export const calendarTheme = {
  todayTextColor: "#CC0033",
  selectedDayBackgroundColor: "#4A90E2",
  selectedDayTextColor: "#fff",
  textDayFontWeight: "bold" as const,
};
