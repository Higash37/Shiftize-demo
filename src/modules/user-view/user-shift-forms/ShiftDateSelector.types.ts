/**
 * @file ShiftDateSelector.types.ts
 * @description ShiftDateSelector のProps型定義。
 */
import { ViewStyle } from "react-native";

export interface ShiftDateSelectorProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

export interface ShiftDateSelectorStyles {
  container: ViewStyle;
}
