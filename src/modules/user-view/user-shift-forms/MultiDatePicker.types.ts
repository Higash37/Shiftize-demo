/**
 * @file MultiDatePicker.types.ts
 * @description MultiDatePicker のProps型とスタイル型の定義。
 */
import { ViewStyle, TextStyle } from "react-native";

export interface MultiDatePickerProps {
  selectedDates: string[];
  setSelectedDates: (dates: string[]) => void;
}

export interface MultiDatePickerStyles {
  container: ViewStyle;
  label: TextStyle;
  calendar: ViewStyle;
}
