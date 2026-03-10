/**
 * @file MasterShiftCreate.types.ts
 * @description MasterShiftCreate のProps型・フォームデータ型の定義。
 */
import type { ShiftStatus } from "@/common/common-models/ModelIndex";
import type { ShiftFormMode } from "@/modules/master-view/master-shift-create-view/MasterShiftCreateView.types";

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
  mode?: ShiftFormMode;
  shiftId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  classes?: string;
}
