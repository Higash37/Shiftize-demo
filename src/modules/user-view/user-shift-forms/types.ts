/**
 * User shift forms types
 */
import { StyleSheet, ViewStyle, TextStyle } from "react-native";

export interface TimeSlot {
  start: string;
  end: string;
}

export interface ShiftFormData {
  date: string;
  timeSlots: TimeSlot[];
  memo?: string;
}

export interface DateSelectorProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  currentMonth: string;
}

export interface TimeInputSectionProps {
  value: TimeSlot[];
  onChange: (timeSlots: TimeSlot[]) => void;
  timeOptions: string[];
}

export interface MultiDatePickerProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  setSelectedDates?: (dates: string[]) => void;
  minDate?: string;
  maxDate?: string;
}

export interface SelectedDateListProps {
  selectedDates: string[];
  onRemoveDate: (date: string) => void;
  onRemove?: (date: string) => void;
}

export interface SelectedDateListStyles {
  container: ViewStyle;
  label: TextStyle;
  calendar: ViewStyle;
  title: TextStyle;
  noneText: TextStyle;
  item: ViewStyle;
  removeText: TextStyle;
  picker: ViewStyle;
}

export interface ShiftDateSelectorStyles {
  container: ViewStyle;
  label: TextStyle;
  calendar: ViewStyle;
  picker: ViewStyle;
}

export interface MultiDatePickerStyles {
  container: ViewStyle;
  label: TextStyle;
  calendar: ViewStyle;
}