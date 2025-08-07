import { BaseTimeProps, BaseStyles } from "../../shift-ui-utils/ui-interfaces";
import { ViewStyle, TextStyle } from "react-native";

export interface TimeSelectProps extends BaseTimeProps {
  startTime?: string;
  endTime?: string;
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
  zIndex?: number;
}

export interface TimeSelectStyles extends BaseStyles {
  timeContainer: ViewStyle;
  timeSelect: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  optionsContainer: ViewStyle;
  scrollContainer: ViewStyle;
  optionItem: ViewStyle;
  selectedOption: ViewStyle;
  optionText: TextStyle;
  selectedOptionText: TextStyle;
}
