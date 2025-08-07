import type { ShiftStatus } from "@/common/common-models/ModelIndex";

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

export interface MasterShiftCreateProps {
  mode?: string;
  shiftId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  classes?: string;
}
