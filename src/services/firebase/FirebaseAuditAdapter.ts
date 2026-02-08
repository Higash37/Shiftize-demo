import type { IAuditService } from "../interfaces/IAuditService";
import { logShiftChange, logBatchApprove } from "@/services/shift-history/shiftHistoryLogger";
import type { ShiftItem } from "@/common/common-models/ModelIndex";
import type { ShiftActionType, ShiftHistoryActor, ShiftHistoryEntry } from "@/services/shift-history/shiftHistoryLogger";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase-core";

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

  onShiftHistory(
    options: {
      storeId: string;
      actionFilter?: ShiftActionType | "all";
    },
    callback: (entries: ShiftHistoryEntry[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const constraints: any[] = [
      where("storeId", "==", options.storeId),
    ];

    if (options.actionFilter && options.actionFilter !== "all") {
      constraints.push(where("action", "==", options.actionFilter));
    }

    constraints.push(orderBy("timestamp", "desc"));
    constraints.push(limit(250));

    const historyQuery = query(
      collection(db, "shiftChangeLogs"),
      ...constraints
    );

    return onSnapshot(
      historyQuery,
      (snapshot) => {
        const entries: ShiftHistoryEntry[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({
            id: doc.id,
            storeId: data["storeId"],
            shiftId: data["shiftId"],
            action: data["action"],
            actor: data["actor"],
            timestamp: data["timestamp"],
            date: data["date"],
            prev: data["prev"],
            next: data["next"],
            prevSnapshot: data["prevSnapshot"],
            nextSnapshot: data["nextSnapshot"],
            summary: data["summary"],
            notes: data["notes"],
          });
        });
        callback(entries);
      },
      (err) => {
        if (err.code === "permission-denied") {
          onError?.(new Error("履歴データへのアクセス権限がありません。教室長としてログインしているか確認してください。"));
          return;
        }
        if (err.code === "failed-precondition") {
          const indexLink = err.message?.includes("https://")
            ? err.message.match(/https:\/\/[^\s]+/)?.[0]
            : null;
          if (indexLink) {
            onError?.(new Error(`Firestoreのインデックスが必要です。以下のリンクからインデックスを作成してください:\n${indexLink}`));
          } else {
            onError?.(new Error(`Firestoreのインデックスが必要です。エラー詳細: ${err.message || "インデックスが不足しています"}`));
          }
          return;
        }
        onError?.(err as Error);
      }
    );
  }
}
