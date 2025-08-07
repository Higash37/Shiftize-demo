import { ViewStyle, TextStyle } from "react-native";
import { ShiftStatus, Shift } from "@/common/common-models/ModelIndex";

export interface ShiftListProps {
  shifts: Shift[];
  selectedDate: string;
}

export interface ShiftListStyles {
  container: ViewStyle;
  shiftItem: ViewStyle;
  shiftInfo: ViewStyle;
  dateTime: TextStyle;
  shiftType: TextStyle;
  rightContainer: ViewStyle;
  statusText: TextStyle;
  detailsButton: ViewStyle;
  detailsButtonText: TextStyle;
  detailsContainer: ViewStyle;
  detailSection: ViewStyle;
  detailTitle: TextStyle;
  detailsText: TextStyle;
  changesContainer: ViewStyle;
  changesTitle: TextStyle;
  changesText: TextStyle;
  timelineContainer: ViewStyle;
  timeSlot: ViewStyle;
  classTimeSlot: ViewStyle;
  timeSlotTitle: TextStyle;
}

export type ShiftTypeMap = "user" | "class" | "deleted";

export type ShiftItemProps = {
  shift: Shift;
  isExpanded: boolean;
  onToggle: () => void;
};
