import { Shift, ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftHistoryActor } from "@/services/shift-history/shiftHistoryLogger";

export interface IShiftService {
  getShift(id: string): Promise<Shift | null>;

  getShifts(storeId?: string): Promise<Shift[]>;

  addShift(shift: Omit<Shift, "id">, actor?: ShiftHistoryActor): Promise<string>;

  updateShift(id: string, shift: Partial<Shift>, actor?: ShiftHistoryActor): Promise<void>;

  markShiftAsDeleted(id: string, deletedBy?: ShiftHistoryActor, reason?: string): Promise<void>;

  approveShiftChanges(id: string, approver?: ShiftHistoryActor): Promise<void>;

  markShiftAsCompleted(id: string): Promise<void>;

  addShiftReport(
    shiftId: string,
    reportData: {
      taskCounts: Record<string, { count: number; time: number }>;
      comments: string;
    }
  ): Promise<void>;

  getShiftsFromMultipleStores(storeIds: string[]): Promise<Shift[]>;

  getUserAccessibleShifts(userData: {
    storeId?: string;
    connectedStores?: string[];
  }): Promise<Shift[]>;

  onShiftsChanged(
    storeId: string,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void;

  onShiftsByMonth(
    storeId: string,
    year: number,
    month: number,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
