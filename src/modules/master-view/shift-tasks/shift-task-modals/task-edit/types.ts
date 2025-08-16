import {
  ExtendedTask,
  TaskType,
  TaskTag,
  TaskLevel,
} from "@/common/common-models/model-shift/shiftTypes";

export interface TaskEditModalProps {
  visible: boolean;
  task: ExtendedTask;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export interface TaskEditFormData {
  title: string;
  shortName: string;
  description: string;
  type: TaskType;
  baseTimeMinutes: number;
  baseCountPerShift: number;
  restrictedTimeRanges: Array<{ startTime: string; endTime: string }>;
  restrictedStartTime: string;
  restrictedEndTime: string;
  requiredRole: "staff" | "master" | undefined;
  tags: TaskTag[];
  priority: TaskLevel;
  difficulty: TaskLevel;
  color: string;
  icon: string;
  validFrom: Date | undefined;
  validTo: Date | undefined;
  isActive: boolean;
}

export interface DatePickerState {
  field: "validFrom" | "validTo" | null;
  show: boolean;
}

export interface TaskTypeOption {
  value: TaskType;
  label: string;
  description: string;
}

export interface TaskTagOption {
  value: TaskTag;
  label: string;
}