import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { ShiftCalendarStyles } from "./ShiftCalendar.types";

export const createShiftCalendarStyles = (theme: MD3Theme) =>
  StyleSheet.create<ShiftCalendarStyles>({
    container: {
      alignItems: "center",
      paddingVertical: 0,
      borderRadius: theme.shape.large,
      borderWidth: 0,
      elevation: 0,
      ...theme.elevation.level0.shadow,
      margin: 0,
      paddingHorizontal: 0,
      width: "96%",
      alignSelf: "center",
    },
    containerFullWidth: {
      paddingHorizontal: theme.spacing.lg,
    },
    calendar: {
      borderRadius: theme.shape.large,
      marginHorizontal: "auto",
      borderWidth: 0,
      ...theme.elevation.level0.shadow,
    },
    calendarShadow: {
      ...theme.elevation.level0.shadow,
      marginBottom: 0,
    },
  });
