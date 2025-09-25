import { ShiftItem } from "@/common/common-models/ModelIndex";

// --- Edit 用 ---
export interface GanttChartMonthEditProps {
  shifts: ShiftItem[];
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  classTimes?: { start: string; end: string }[];
}

// --- View 用 ---
export interface GanttChartMonthViewProps {
  shifts: ShiftItem[];
  days: string[];
  users: {
    uid: string;
    nickname: string;
    color?: string;
    hourlyWage?: number;
  }[];
  selectedDate: Date;
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: () => void;
  onMonthChange?: (year: number, month: number) => void;
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  onTaskAdd?: (shiftId: string) => void; // タスク追加ハンドラーを追加
  classTimes?: { start: string; end: string }[];
  refreshPage?: () => void;
}
