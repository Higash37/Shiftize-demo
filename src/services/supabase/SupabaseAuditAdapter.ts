/** @file SupabaseAuditAdapter.ts @description シフト変更の監査ログ記録・履歴取得のSupabase実装 */

import type { IAuditService } from "../interfaces/IAuditService";
import type { ShiftItem } from "@/common/common-models/ModelIndex";
import type {
  ShiftActionType,
  ShiftHistoryActor,
  ShiftHistoryEntry,
  ShiftChangeMetadata,
} from "@/services/shift-history/shiftHistoryLogger";
// shiftHistoryLoggerからヘルパー関数を共用する（重複コード削除）
import {
  getStatusLabel,
  toHistorySnapshot,
  generateSummary,
} from "@/services/shift-history/shiftHistoryLogger";
import { getSupabase } from "./supabase-client";

/** 監査ログサービスのSupabase実装 */
export class SupabaseAuditAdapter implements IAuditService {
  /** シフト変更を監査ログに記録する */
  async logShiftChange(
    action: ShiftActionType,
    actor: ShiftHistoryActor,
    storeId: string,
    shift?: ShiftItem | null,
    prevShift?: ShiftItem | null,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      if (!storeId) return;

      const date: string =
        shift?.date ||
        prevShift?.date ||
        new Date().toISOString().split("T")[0] || "";

      const prevEntry = prevShift
        ? {
            startTime: prevShift.startTime,
            endTime: prevShift.endTime,
            userId: prevShift.userId,
            userNickname: prevShift.nickname,
            status: prevShift.status,
            statusLabel: getStatusLabel(prevShift.status),
            type: prevShift.type,
          }
        : null;

      const nextEntry = shift
        ? {
            startTime: shift.startTime,
            endTime: shift.endTime,
            userId: shift.userId,
            userNickname: shift.nickname,
            status: shift.status,
            statusLabel: getStatusLabel(shift.status),
            type: shift.type,
          }
        : null;

      // null → undefined に変換（generateSummaryの型に合わせる）
      const summary = generateSummary(
        action,
        actor,
        date,
        prevEntry ?? undefined,
        nextEntry ?? undefined,
        metadata as ShiftChangeMetadata | undefined
      );

      const row: Record<string, unknown> = {
        store_id: storeId,
        shift_id: shift?.id || prevShift?.id || null,
        action,
        actor,
        date,
        summary,
      };

      if (prevEntry) row['prev'] = prevEntry;
      if (nextEntry) row['next'] = nextEntry;
      if (prevShift) row['prev_snapshot'] = toHistorySnapshot(prevShift);
      if (shift) row['next_snapshot'] = toHistorySnapshot(shift);
      if (metadata && metadata['notes']) row['notes'] = metadata['notes'];

      const supabase = getSupabase();
      const { error } = await supabase.from("shift_change_logs").insert(row);

      // ログ記録の失敗は業務処理をブロックしない
    } catch {
      // ログ記録の失敗は業務処理をブロックしない
    }
  }

  /** シフト一括承認を監査ログに記録する */
  async logBatchApprove(
    actor: ShiftHistoryActor,
    storeId: string,
    yearMonth: string,
    count: number
  ): Promise<void> {
    await this.logShiftChange(
      "batch_approve",
      actor,
      storeId,
      null,
      null,
      { yearMonth, count }
    );
  }

  /** シフト変更履歴をリアルタイム購読する */
  onShiftHistory(
    options: {
      storeId: string;
      actionFilter?: ShiftActionType | "all";
    },
    callback: (entries: ShiftHistoryEntry[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const supabase = getSupabase();
    let channel: import("@supabase/supabase-js").RealtimeChannel | null = null;

    const fetchHistory = async () => {
      let query = supabase
        .from("shift_change_logs")
        .select("*")
        .eq("store_id", options.storeId)
        .order("created_at", { ascending: false })
        .limit(250);

      if (options.actionFilter && options.actionFilter !== "all") {
        query = query.eq("action", options.actionFilter);
      }

      const { data, error } = await query;
      if (error) {
        onError?.(new Error(error.message));
        return;
      }

      const entries: ShiftHistoryEntry[] = (data || []).map((row: any) => ({
        id: row.id,
        storeId: row.store_id,
        shiftId: row.shift_id,
        action: row.action,
        actor: row.actor,
        timestamp: row.created_at || row.timestamp,
        date: row.date,
        prev: row.prev,
        next: row.next,
        prevSnapshot: row.prev_snapshot,
        nextSnapshot: row.next_snapshot,
        summary: row.summary,
        notes: row.notes,
      }));
      callback(entries);
    };

    // 初回データ取得
    fetchHistory().catch((err) => onError?.(err));

    // Realtime購読
    channel = supabase
      .channel(`shift-history-${options.storeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shift_change_logs",
          filter: `store_id=eq.${options.storeId}`,
        },
        () => {
          fetchHistory().catch((err) => onError?.(err));
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }
}
