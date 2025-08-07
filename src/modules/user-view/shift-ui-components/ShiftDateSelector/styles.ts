import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { ShiftDateSelectorStyles } from "./types";

export const styles = StyleSheet.create<ShiftDateSelectorStyles>({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center", // 中央揃えを追加
  },
});

export const calendarTheme = {
  todayTextColor: colors.primary,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: "#ffffff",
};
