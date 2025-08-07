import { ViewStyle, TextStyle } from "react-native";
import { BaseTimeProps, BaseStyles } from "../../shift-ui-utils/ui-interfaces";

export type TimeSlot = {
  start: string;
  end: string;
};

export interface TimeInputSectionProps extends BaseTimeProps {
  value: TimeSlot[];
  onChange: (newValue: TimeSlot[]) => void;
}

export interface TimeInputSectionStyles extends BaseStyles {
  timeContainer: ViewStyle;
  timeInput: ViewStyle;
  timeLabel: TextStyle;
  separator: TextStyle;
  timeButton: ViewStyle;
  timeButtonText: TextStyle;
  pickerContainer: ViewStyle;
  pickerHeader: ViewStyle;
  pickerCancelText: TextStyle;
  pickerDoneText: TextStyle;
  picker: ViewStyle;
}
