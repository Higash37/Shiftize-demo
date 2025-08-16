import { ShiftItem, TaskItem } from "@/common/common-models/ModelIndex";
import { ShiftStatusConfig } from "../../GanttChartTypes";

export interface GanttChartGridProps {
  shifts: ShiftItem[];
  cellWidth: number;
  ganttColumnWidth: number;
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  getStatusConfig: (status: string) => ShiftStatusConfig;
  onShiftPress?: (shift: ShiftItem) => void;
  onBackgroundPress?: (x: number) => void;
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  onTaskAdd?: (shiftId: string) => void;
  styles: any;
  userColorsMap: Record<string, string>;
  users?: Array<{ uid: string; role: string; nickname: string }>;
  getTimeWidth?: (time: string) => number;
  colorMode?: "status" | "user";
}

export interface ShiftBarProps {
  shiftId: string;
  x: number;
  width: number;
  color: string;
  isOvernight?: boolean;
  shiftData?: ShiftItem;
  statusConfig?: ShiftStatusConfig;
  hideLabel?: boolean;
  label?: string;
  taskType?: "regular" | "task" | "recruitment";
  taskData?: TaskItem;
  userRole?: string;
  onPress?: () => void;
  onTimeChange?: (newStartTime: string, newEndTime: string) => void;
  onTaskAdd?: () => void;
  styles: any;
}

export interface TimeAxisProps {
  halfHourLines: string[];
  cellWidth: number;
  ganttColumnWidth: number;
  styles: any;
  startHour?: number;
  showTimeLabels?: boolean;
  showClassMarkers?: boolean;
  isClassTime?: (time: string) => boolean;
}

export interface HeaderCellProps {
  user: {
    uid: string;
    nickname: string;
    role: string;
    color?: string;
  };
  onPress?: () => void;
  styles: any;
}

export interface UserRowProps {
  user: {
    uid: string;
    nickname: string;
    role: string;
    color?: string;
  };
  shifts: ShiftItem[];
  cellWidth: number;
  ganttColumnWidth: number;
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  getStatusConfig: (status: string) => ShiftStatusConfig;
  onShiftPress?: (shift: ShiftItem) => void;
  onBackgroundPress?: (x: number) => void;
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  styles: any;
  userColorsMap: Record<string, string>;
  colorMode?: "status" | "user";
}