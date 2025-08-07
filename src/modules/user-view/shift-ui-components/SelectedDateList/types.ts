import { ViewStyle, TextStyle } from "react-native";

export interface SelectedDateListProps {
  selectedDates: string[];
  onRemove: (date: string) => void;
}

export interface SelectedDateListStyles {
  container: ViewStyle;
  title: TextStyle;
  item: ViewStyle;
  dateText: TextStyle;
  removeText: TextStyle;
  noneText: TextStyle;
}
