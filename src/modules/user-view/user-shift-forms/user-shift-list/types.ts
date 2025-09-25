import type {
  ShiftItem,
  ClassTimeSlot,
} from "@/common/common-models/model-shift/shiftTypes";

export interface ShiftListItemProps {
  shift: ShiftItem & {
    classes?: ClassTimeSlot[];
  };
  isSelected: boolean;
  selectedDate: string;
  onPress: () => void;
  onDetailsPress: () => void;
  children?: React.ReactNode;
}
