import { ShiftStatus } from "@/common/common-models/model-shift/shiftTypes";

export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  classes?: any[];
  userId: string;
}

export interface ShiftListItemProps {
  shift: Shift;
  isSelected: boolean;
  selectedDate: string;
  onPress: () => void;
  onDetailsPress: () => void;
  children?: React.ReactNode;
}

export interface ShiftListViewProps {
  // 必要に応じて追加
}
