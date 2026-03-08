export type ShiftFormMode = "create" | "edit";

export interface MasterShiftCreateViewProps {
  mode: ShiftFormMode;
  shiftId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  classes?: string;
}
