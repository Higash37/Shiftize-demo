import { ShiftItem } from "@/common/common-models/ModelIndex";
import {
  ShiftActionType,
  ShiftHistoryActor,
  ShiftHistoryEntry,
} from "@/services/shift-history/shiftHistoryLogger";

export interface IAuditService {
  logShiftChange(
    action: ShiftActionType,
    actor: ShiftHistoryActor,
    storeId: string,
    shift?: ShiftItem | null,
    prevShift?: ShiftItem | null,
    metadata?: Record<string, unknown>
  ): Promise<void>;

  logBatchApprove(
    actor: ShiftHistoryActor,
    storeId: string,
    yearMonth: string,
    count: number
  ): Promise<void>;

  onShiftHistory(
    options: {
      storeId: string;
      actionFilter?: ShiftActionType | "all";
    },
    callback: (entries: ShiftHistoryEntry[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
