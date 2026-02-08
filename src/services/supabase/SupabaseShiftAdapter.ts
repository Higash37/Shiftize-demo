import type { IShiftService } from "../interfaces/IShiftService";
import type { Shift, ShiftItem } from "@/common/common-models/ModelIndex";
import type { ShiftHistoryActor } from "@/services/shift-history/shiftHistoryLogger";
import { getSupabase } from "./supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  ShiftNotificationService,
  EmailNotificationService,
} from "@/services/notifications";
import { Platform } from "react-native";
import {
  logShiftChange,
  determineActionType,
} from "@/services/shift-history/shiftHistoryLogger";

const toShiftFromRow = (row: any): Shift => ({
  id: row.id,
  userId: row.user_id || "",
  storeId: row.store_id || "",
  nickname: row.nickname || "",
  date: row.date || "",
  startTime: row.start_time || "",
  endTime: row.end_time || "",
  type: row.type || "user",
  subject: row.subject || "",
  notes: row.notes,
  isCompleted: row.is_completed || false,
  status: row.status || "draft",
  duration: row.duration || "",
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  classes: row.classes || [],
  requestedChanges: row.requested_changes || undefined,
});

const toInsertRow = (shift: Omit<Shift, "id"> & { id?: string }) => {
  const row: Record<string, unknown> = {
    user_id: shift.userId,
    store_id: shift.storeId,
    nickname: shift.nickname,
    date: shift.date,
    start_time: shift.startTime,
    end_time: shift.endTime,
    type: shift.type || "user",
    status: shift.status || "draft",
    duration: shift.duration,
    is_completed: shift.isCompleted,
    subject: shift.subject,
    notes: shift.notes,
    classes: shift.classes || [],
    requested_changes: shift.requestedChanges || null,
  };
  if (shift.id) row['id'] = shift.id;
  return row;
};

const toUpdateRow = (shift: Partial<Shift>) => {
  const row: Record<string, unknown> = {};
  if (shift.userId !== undefined) row['user_id'] = shift.userId;
  if (shift.storeId !== undefined) row['store_id'] = shift.storeId;
  if (shift.nickname !== undefined) row['nickname'] = shift.nickname;
  if (shift.date !== undefined) row['date'] = shift.date;
  if (shift.startTime !== undefined) row['start_time'] = shift.startTime;
  if (shift.endTime !== undefined) row['end_time'] = shift.endTime;
  if (shift.type !== undefined) row['type'] = shift.type;
  if (shift.status !== undefined) row['status'] = shift.status;
  if (shift.duration !== undefined) row['duration'] = shift.duration;
  if (shift.isCompleted !== undefined) row['is_completed'] = shift.isCompleted;
  if (shift.subject !== undefined) row['subject'] = shift.subject;
  if (shift.notes !== undefined) row['notes'] = shift.notes;
  if (shift.classes !== undefined) row['classes'] = shift.classes;
  if (shift.requestedChanges !== undefined) row['requested_changes'] = shift.requestedChanges;
  if (shift.approvedBy !== undefined) row['approved_by'] = shift.approvedBy;
  if (shift.rejectedReason !== undefined) row['rejected_reason'] = shift.rejectedReason;
  return row;
};

const mergeShiftForLogging = (
  id: string,
  prevData: Shift | null | undefined,
  updates: Partial<Shift> | null | undefined
): { prev: ShiftItem | null; next: ShiftItem | null } => {
  const prev = prevData ? ({ ...prevData, id } as ShiftItem) : null;
  if (!updates) return { prev, next: prev };
  const merged = { ...(prevData || {}), ...updates, id } as ShiftItem;
  return { prev, next: merged };
};

export class SupabaseShiftAdapter implements IShiftService {
  async getShift(id: string): Promise<Shift | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return toShiftFromRow(data);
  }

  async getShifts(storeId?: string): Promise<Shift[]> {
    const supabase = getSupabase();
    let query = supabase.from("shifts").select("*");

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []).map(toShiftFromRow);
  }

  async addShift(
    shift: Omit<Shift, "id">,
    actor?: ShiftHistoryActor
  ): Promise<string> {
    const supabase = getSupabase();
    const row = toInsertRow(shift);

    const { data, error } = await supabase
      .from("shifts")
      .insert(row)
      .select("id")
      .single();

    if (error) throw error;
    const shiftId = data.id;

    // 通知
    try {
      const createdShift: Shift = { id: shiftId, ...shift };
      const creatorNickname = shift.nickname || "Unknown User";

      if (Platform.OS === "web") {
        await EmailNotificationService.notifyShiftCreatedByEmail(
          createdShift,
          creatorNickname
        );
      } else {
        await ShiftNotificationService.notifyShiftCreated(
          createdShift,
          creatorNickname
        );
      }
    } catch (_) {}

    // 監査ログ
    if (actor) {
      const next = {
        ...shift,
        id: shiftId,
        status: shift.status || "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ShiftItem;
      const action = determineActionType(null, next as any, actor);
      await logShiftChange(action, actor, next.storeId, next as any, undefined);
    }

    return shiftId;
  }

  async updateShift(
    id: string,
    shift: Partial<Shift>,
    actor?: ShiftHistoryActor
  ): Promise<void> {
    const supabase = getSupabase();

    // 変更前のデータ取得
    const { data: prevRow } = await supabase
      .from("shifts")
      .select("*")
      .eq("id", id)
      .single();

    const previousData = prevRow ? toShiftFromRow(prevRow) : null;

    const row = toUpdateRow(shift);
    const { error } = await supabase.from("shifts").update(row).eq("id", id);
    if (error) throw error;

    if (actor && previousData) {
      const { prev, next } = mergeShiftForLogging(id, previousData, {
        ...shift,
        updatedAt: new Date(),
      });
      if (next) {
        const action = determineActionType(prev as any, next as any, actor);
        await logShiftChange(
          action,
          actor,
          next.storeId || prev?.storeId || "",
          next as any,
          prev as any
        );
      }
    }
  }

  async markShiftAsDeleted(
    id: string,
    deletedBy?: ShiftHistoryActor,
    reason?: string
  ): Promise<void> {
    const supabase = getSupabase();

    // 削除前にシフト情報を取得（通知・ログ用）
    const { data: shiftRow } = await supabase
      .from("shifts")
      .select("*")
      .eq("id", id)
      .single();

    const shiftData = shiftRow ? toShiftFromRow(shiftRow) : null;

    // 通知
    if (shiftData && deletedBy) {
      try {
        if (Platform.OS === "web") {
          await EmailNotificationService.notifyShiftDeletedByEmail(
            shiftData,
            deletedBy.nickname,
            reason
          );
        } else {
          await ShiftNotificationService.notifyShiftDeleted(
            shiftData,
            deletedBy.nickname,
            reason
          );
        }
      } catch (_) {}
    }

    // 削除
    const { error } = await supabase.from("shifts").delete().eq("id", id);
    if (error) throw error;

    // 監査ログ
    if (deletedBy && shiftData) {
      const prev = { ...shiftData, id } as ShiftItem;
      const action = determineActionType(prev as any, null, deletedBy);
      await logShiftChange(
        action,
        deletedBy,
        prev.storeId,
        undefined,
        prev as any,
        reason ? { reason } : undefined
      );
    }
  }

  async approveShiftChanges(
    id: string,
    approver?: ShiftHistoryActor
  ): Promise<void> {
    const supabase = getSupabase();

    const { data: shiftRow } = await supabase
      .from("shifts")
      .select("*")
      .eq("id", id)
      .single();

    if (!shiftRow) return;

    const shiftData = toShiftFromRow(shiftRow);
    const isPendingToApproved = shiftData.status === "pending";
    const hasRequestedChanges = shiftData.requestedChanges;

    if (hasRequestedChanges) {
      const changes =
        Array.isArray(hasRequestedChanges)
          ? hasRequestedChanges[0]
          : hasRequestedChanges;
      const updateData: Record<string, unknown> = {
        status: "approved",
        requested_changes: null,
      };
      if (changes && changes.startTime) updateData['start_time'] = changes.startTime;
      if (changes && changes.endTime) updateData['end_time'] = changes.endTime;
      if (changes && changes.date) updateData['date'] = changes.date;
      if (changes && changes.type) updateData['type'] = changes.type;
      if (changes && changes.subject) updateData['subject'] = changes.subject;

      const { error } = await supabase
        .from("shifts")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    } else if (isPendingToApproved) {
      const { error } = await supabase
        .from("shifts")
        .update({ status: "approved" })
        .eq("id", id);
      if (error) throw error;
    }

    // 通知
    if ((isPendingToApproved || hasRequestedChanges) && approver) {
      try {
        if (Platform.OS === "web") {
          await EmailNotificationService.notifyShiftApprovedByEmail(
            shiftData,
            approver.nickname
          );
        } else {
          await ShiftNotificationService.notifyShiftApproved(
            shiftData,
            approver.nickname,
            shiftData.nickname || "Unknown User"
          );
        }
      } catch (_) {}
    }

    // 監査ログ
    if (
      approver &&
      shiftData &&
      (isPendingToApproved || hasRequestedChanges)
    ) {
      const changesObj = (Array.isArray(hasRequestedChanges)
        ? hasRequestedChanges[0]
        : hasRequestedChanges) || {};
      const updates: Partial<Shift> = hasRequestedChanges
        ? {
            ...changesObj,
            status: "approved",
            updatedAt: new Date(),
          }
        : { status: "approved", updatedAt: new Date() };
      // Clear requestedChanges from the merged result
      delete updates.requestedChanges;

      const { prev, next } = mergeShiftForLogging(id, shiftData, updates);
      if (next) {
        const action = determineActionType(prev as any, next as any, approver);
        await logShiftChange(
          action,
          approver,
          next.storeId || prev?.storeId || "",
          next as any,
          prev as any
        );
      }
    }
  }

  async markShiftAsCompleted(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("shifts")
      .update({ status: "completed" })
      .eq("id", id);
    if (error) throw error;
  }

  async addShiftReport(
    shiftId: string,
    reportData: {
      taskCounts: Record<string, { count: number; time: number }>;
      comments: string;
    }
  ): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from("reports").insert({
      shift_id: shiftId,
      task_counts: reportData.taskCounts,
      comments: reportData.comments,
    });
    if (error) throw error;
  }

  /**
   * 複数店舗のシフト一覧を取得（Firestoreの10件制限なし）
   */
  async getShiftsFromMultipleStores(storeIds: string[]): Promise<Shift[]> {
    if (storeIds.length === 0) return [];

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .in("store_id", storeIds)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []).map(toShiftFromRow);
  }

  async getUserAccessibleShifts(userData: {
    storeId?: string;
    connectedStores?: string[];
  }): Promise<Shift[]> {
    const accessibleStoreIds: string[] = [];

    if (userData.storeId) {
      accessibleStoreIds.push(userData.storeId);
    }

    if (userData.connectedStores) {
      userData.connectedStores.forEach((storeId) => {
        if (!accessibleStoreIds.includes(storeId)) {
          accessibleStoreIds.push(storeId);
        }
      });
    }

    return this.getShiftsFromMultipleStores(accessibleStoreIds);
  }

  onShiftsChanged(
    storeId: string,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    // 初回データ取得
    this.getShifts(storeId)
      .then((shifts) => callback(shifts as unknown as ShiftItem[]))
      .catch((err) => onError?.(err));

    // Realtime購読
    channel = supabase
      .channel(`shifts-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shifts",
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          // 変更検知時に再取得
          this.getShifts(storeId)
            .then((shifts) => callback(shifts as unknown as ShiftItem[]))
            .catch((err) => onError?.(err));
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }

  onShiftsByMonth(
    storeId: string,
    year: number,
    month: number,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-31`;

    const fetchMonthShifts = async () => {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("store_id", storeId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      return (data || []).map(toShiftFromRow) as unknown as ShiftItem[];
    };

    // 初回データ取得
    fetchMonthShifts()
      .then(callback)
      .catch((err) => onError?.(err));

    // Realtime購読
    channel = supabase
      .channel(`shifts-month-${storeId}-${year}-${month}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shifts",
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          fetchMonthShifts()
            .then(callback)
            .catch((err) => onError?.(err));
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
