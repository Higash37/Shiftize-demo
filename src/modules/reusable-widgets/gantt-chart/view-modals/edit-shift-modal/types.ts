export interface EditShiftModalViewProps {
  visible: boolean;
  newShiftData: any;
  users: { uid: string; nickname: string }[];
  timeOptions: string[];
  statusConfigs: any[];
  isLoading: boolean;
  styles: any;
  onChange: (field: string, value: any) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (shift: any) => void;
  extendedTasks?: any[];
}

export interface ClassTime {
  startTime: string;
  endTime: string;
}

export interface EditShiftState {
  isAddingClassTime: boolean;
  isManagingTasks: boolean;
  isAddingTask: boolean;
  selectedTaskTemplate: string | null;
  tempTaskStartTime: string;
  tempTaskEndTime: string;
  customTaskTitle: string;
  isManualInput: boolean;
  manualStartTime: string;
  manualEndTime: string;
}

export interface TimeInputSectionProps {
  timeOptions: string[];
  newShiftData: any;
  onChange: (field: string, value: any) => void;
  isManualInput: boolean;
  manualStartTime: string;
  manualEndTime: string;
  onTimeChange: (value: string, isStart: boolean) => void;
  onToggleManualInput: () => void;
}

export interface UserSelectSectionProps {
  users: { uid: string; nickname: string }[];
  newShiftData: any;
  onChange: (field: string, value: any) => void;
}

export interface StatusSelectSectionProps {
  statusConfigs: any[];
  newShiftData: any;
  onChange: (field: string, value: any) => void;
  userRole?: string;
}