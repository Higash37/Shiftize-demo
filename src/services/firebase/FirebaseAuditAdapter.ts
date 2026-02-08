import type { IAuditService } from "../interfaces/IAuditService";
import { logShiftChange, logBatchApprove } from "@/services/shift-history/shiftHistoryLogger";
import type { ShiftItem } from "@/common/common-models/ModelIndex";
import type { ShiftActionType, ShiftHistoryActor } from "@/services/shift-history/shiftHistoryLogger";

export class FirebaseAuditAdapter implements IAuditService {
  async logShiftChange(
    action: ShiftActionType,
    actor: ShiftHistoryActor,
    storeId: string,
    shift?: ShiftItem | null,
    prevShift?: ShiftItem | null,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await logShiftChange(action, actor, storeId, shift, prevShift, metadata);
  }

  async logBatchApprove(
    actor: ShiftHistoryActor,
    storeId: string,
    yearMonth: string,
    count: number
  ): Promise<void> {
    await logBatchApprove(actor, storeId, yearMonth, count);
  }
}
