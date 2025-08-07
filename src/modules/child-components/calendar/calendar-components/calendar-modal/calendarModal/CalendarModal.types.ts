import { ViewStyle, TextStyle } from "react-native";

export interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dates: string[]) => void;
  initialDates?: string[];
}

export interface CalendarModalStyles {
  overlay: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  closeButton: TextStyle;
  calendar: ViewStyle;
  calendarHeader: ViewStyle;
  monthText: TextStyle;
  footer: ViewStyle;
  button: ViewStyle;
  cancelButton: ViewStyle;
  confirmButton: ViewStyle;
  cancelButtonText: TextStyle;
  confirmButtonText: TextStyle;
  subtitle: TextStyle;
}
