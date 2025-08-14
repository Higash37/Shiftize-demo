export interface ShiftData {
  startTime: string;
  endTime: string;
  dates: string[];
  hasClass: boolean;
  classes: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export interface ShiftCreateFormProps {
  initialMode?: string;
  initialShiftId?: string;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialClasses?: string;
}
