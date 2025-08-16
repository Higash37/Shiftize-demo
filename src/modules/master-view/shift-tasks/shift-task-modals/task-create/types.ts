import {
  TaskType,
  TaskTag,
  TaskLevel,
  TimeRange,
} from "@/common/common-models/model-shift/shiftTypes";

export interface TaskFormData {
  title: string;
  shortName: string;
  description: string;
  type: TaskType;
  baseTimeMinutes: number;
  baseCountPerShift: number;
  restrictedTimeRanges: TimeRange[];
  restrictedStartTime: string;
  restrictedEndTime: string;
  requiredRole?: "staff" | "master";
  tags: TaskTag[];
  priority: TaskLevel;
  difficulty: TaskLevel;
  color: string;
  icon: string;
  validFrom?: Date;
  validTo?: Date;
  isActive: boolean;
}

export interface TaskCreateModalProps {
  visible: boolean;
  storeId: string;
  onClose: () => void;
  onTaskCreated: () => void;
  initialShiftId?: string;
  initialShiftData?: {
    date: string;
    startTime: string;
    endTime: string;
    userId: string;
  };
}