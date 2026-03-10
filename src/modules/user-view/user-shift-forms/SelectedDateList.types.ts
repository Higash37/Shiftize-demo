/**
 * @file SelectedDateList.types.ts
 * @description SelectedDateList のProps型定義。
 */
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
