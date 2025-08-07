import { ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftData } from "../ganttView/components/ShiftModal";

export interface GanttEditViewProps {
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string }>;
  days: string[];
  loading: boolean;
  error: string | null;
  currentYearMonth: { year: number; month: number };
  onMonthChange: (year: number, month: number) => void;
  onShiftUpdate: () => void;
  onShiftPress: (shift: ShiftItem) => void;
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  onShiftSave?: (data: ShiftData) => void;
  onShiftDelete?: (shiftId: string) => void;
  refreshPage?: () => void;
}
