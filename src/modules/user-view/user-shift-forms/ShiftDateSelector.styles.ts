import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { ShiftDateSelectorStyles } from "./types";

export const styles = StyleSheet.create<ShiftDateSelectorStyles>({
  container: {
    borderRadius: 8,
    overflow: "hidden" as const,
    alignItems: "center" as const, // 中央揃えを追加
  },
  label: {
    fontSize: 16,
    fontWeight: "bold" as const,
    marginBottom: 8,
    color: "#333",
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export const calendarTheme = {
  todayTextColor: colors.primary,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: "#ffffff",
};
