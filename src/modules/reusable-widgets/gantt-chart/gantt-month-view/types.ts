import { ShiftItem, ClassTimeSlot } from "@/common/common-models/ModelIndex";
import { ShiftStatusConfig } from "@/common/common-models/model-shift/shiftTypes";

export interface GanttState {
  showEditModal: boolean;
  showAddModal: boolean;
  showDatePicker: boolean;
  editModalType: "edit" | "copy" | "delete" | null;
  editingShift: ShiftItem | null;
  selectedDate: Date;
  selectedUserId: string;
  isLoading: boolean;
  refreshKey: number;
  scrollPosition: number;
  colorMode: "status" | "user";
  showPayrollModal: boolean;
  viewMode: "gantt" | "calendar" | "compact";
  deviceType: "desktop" | "tablet" | "mobile";
  useGoogleLayout: boolean;
  showHistoryModal: boolean;
}

export interface BatchModalState {
  visible: boolean;
  type: "approve" | "delete" | null;
}

export interface GanttDimensions {
  dateColumnWidth: number;
  infoColumnWidth: number;
  ganttColumnWidth: number;
}

export interface GanttHandlers {
  onShiftPress: (shift: ShiftItem, action: string) => void;
  onAddShift: (date: string, userId: string, timeSlot?: { start: string; end: string }) => void;
  onEditShift: (shift: ShiftItem) => void;
  onDeleteShift: (shift: ShiftItem) => void;
  onBatchAction: (type: "approve" | "delete") => void;
  onViewModeChange: (mode: "gantt" | "calendar" | "compact") => void;
  onColorModeChange: (mode: "status" | "user") => void;
}