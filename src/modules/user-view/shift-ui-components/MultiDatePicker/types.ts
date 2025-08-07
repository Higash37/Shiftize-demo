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
