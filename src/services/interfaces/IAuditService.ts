/** @file IAuditService.ts @description シフト操作の監査ログサービスのインターフェース */

import { ShiftItem } from "@/common/common-models/ModelIndex";
import {
  ShiftActionType,
  ShiftHistoryActor,
  ShiftHistoryEntry,
} from "@/services/shift-history/shiftHistoryLogger";

/** シフト変更の監査ログを記録・取得するサービス */
export interface IAuditService {
  /** シフト変更をログに記録する */
  logShiftChange(
    action: ShiftActionType,
    actor: ShiftHistoryActor,
    storeId: string,
    shift?: ShiftItem | null,
    prevShift?: ShiftItem | null,
    metadata?: Record<string, unknown>
  ): Promise<void>;

  /** 一括承認をログに記録する */
  logBatchApprove(
    actor: ShiftHistoryActor,
    storeId: string,
    yearMonth: string,
    count: number
  ): Promise<void>;

  /** シフト履歴をリアルタイム監視する */
  onShiftHistory(
    options: {
      storeId: string;
      actionFilter?: ShiftActionType | "all";
    },
    callback: (entries: ShiftHistoryEntry[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
