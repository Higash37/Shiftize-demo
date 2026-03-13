/** @file SupabaseShiftAdapter.ts @description シフトCRUD・リアルタイム購読・監査ログ連携のSupabase実装 */

import type { IShiftService } from "../interfaces/IShiftService";
import type { Shift, ShiftItem, ShiftType, ShiftStatus, ClassTimeSlot, ShiftRequestedChanges } from "@/common/common-models/ModelIndex";
import type { ShiftHistoryActor } from "@/services/shift-history/shiftHistoryLogger";
import { getSupabase } from "./supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  logShiftChange,
  determineActionType,
} from "@/services/shift-history/shiftHistoryLogger";
import { ServiceProvider } from "../ServiceProvider";

/** Supabase shifts テーブルの行型 */
interface ShiftRow {
  id: string;
  user_id?: string;
  store_id?: string;
  nickname?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  type?: ShiftType;
  subject?: string;
  notes?: string;
  is_completed?: boolean;
  status?: ShiftStatus;
  duration?: number;
  created_at?: string;
  updated_at?: string;
  classes?: ClassTimeSlot[];
  requested_changes?: Shift["requestedChanges"] | null;
  google_calendar_event_id?: string;
  approved_by?: string;
  rejected_reason?: string;
}

/** チャンネル名の一意性を保証するカウンター */
let channelCounter = 0;

/**
 * validateStoreId - store_id のバリデーション（Realtimeフィルタインジェクション対策）
 *
 * Supabase Realtimeのフィルタ文字列にstoreIdを直接埋め込むため、
 * 英数字・ハイフン・アンダースコアのみ許可して不正な文字列の注入を防ぐ。
 *
 * @param storeId - 検証する店舗ID
 * @throws Error 不正な文字が含まれる場合
 */
const validateStoreId = (storeId: string): void => {
  if (!storeId || !/^[a-zA-Z0-9_-]+$/.test(storeId)) {
    throw new Error(`不正な店舗IDです: store_id に使用できない文字が含まれています`);
  }
};

/**
 * validateRealtimeParams - Realtimeサブスクリプション用パラメータのバリデーション
 *
 * storeId, year, month の各パラメータを検証する。
 * フィルタインジェクション防止のため、Realtime購読前に必ず呼び出す。
 *
 * @param storeId - 店舗ID
 * @param year - 年（オプション）
 * @param month - 月（オプション、0-11）
 */
const validateRealtimeParams = (storeId: string, year?: number, month?: number): void => {
  validateStoreId(storeId);
  if (year !== undefined && (!Number.isInteger(year) || year < 2000 || year > 2100)) {
    throw new Error(`不正な年パラメータです: ${year}`);
  }
  if (month !== undefined && (!Number.isInteger(month) || month < 0 || month > 11)) {
    throw new Error(`不正な月パラメータです: ${month}`);
  }
};

/**
 * ShiftItem取得用の必要列のみ指定（select("*") による不要列転送を削減）
 * toShiftItemFromRow が参照する全列を列挙している。
 */
const SHIFT_ITEM_COLUMNS = "id,user_id,store_id,nickname,date,start_time,end_time,type,subject,notes,is_completed,status,duration,created_at,updated_at,classes,google_calendar_event_id,requested_changes" as const;

const toShiftItemFromRow = (row: ShiftRow): ShiftItem => {
  const item: ShiftItem = {
    id: row.id,
    userId: row.user_id || "",
    storeId: row.store_id || "",
    nickname: row.nickname || "",
    date: row.date || "",
    startTime: row.start_time || "",
    endTime: row.end_time || "",
    type: row.type || "user",
    isCompleted: row.is_completed || false,
    status: row.status || "draft",
    duration: String(row.duration ?? ""),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
  if (row.subject != null) item.subject = row.subject;
  if (row.notes != null) item.notes = row.notes;
  if (row.classes) item.classes = row.classes;
  if (row.google_calendar_event_id) item.googleCalendarEventId = row.google_calendar_event_id;
  const firstChange = row.requested_changes?.[0];
  if (firstChange) item.requestedChanges = { startTime: firstChange.startTime, endTime: firstChange.endTime };
  return item;
};

const toShiftFromRow = (row: ShiftRow): Shift => {
  const shift: Shift = {
    id: row.id,
    userId: row.user_id || "",
    storeId: row.store_id || "",
    date: row.date || "",
    startTime: row.start_time || "",
    endTime: row.end_time || "",
    status: row.status || "draft",
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
  if (row.nickname != null) shift.nickname = row.nickname;
  if (row.type) shift.type = row.type;
  if (row.subject != null) shift.subject = row.subject;
  if (row.notes != null) shift.notes = row.notes;
  if (row.is_completed != null) shift.isCompleted = row.is_completed;
  if (row.duration != null) shift.duration = row.duration;
  if (row.classes) shift.classes = row.classes;
  if (row.requested_changes) shift.requestedChanges = row.requested_changes;
  if (row.google_calendar_event_id) shift.googleCalendarEventId = row.google_calendar_event_id;
  return shift;
};

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

const shiftToShiftItem = (shift: Shift & { id: string }): ShiftItem => {
  const item: ShiftItem = {
    id: shift.id,
    userId: shift.userId || "",
    storeId: shift.storeId || "",
    nickname: shift.nickname || "",
    date: shift.date || "",
    startTime: shift.startTime || "",
    endTime: shift.endTime || "",
    type: shift.type || "user",
    isCompleted: shift.isCompleted || false,
    status: shift.status || "draft",
    duration: String(shift.duration || ""),
    createdAt: shift.createdAt || new Date(),
    updatedAt: shift.updatedAt || new Date(),
  };
  if (shift.subject !== undefined) item.subject = shift.subject;
  if (shift.notes !== undefined) item.notes = shift.notes;
  if (shift.classes !== undefined) item.classes = shift.classes;
  const firstChange =
    shift.requestedChanges && Array.isArray(shift.requestedChanges) && shift.requestedChanges.length > 0
      ? shift.requestedChanges[0]
      : null;
  if (firstChange) {
    item.requestedChanges = { startTime: firstChange.startTime, endTime: firstChange.endTime };
  }
  return item;
};

const mergeShiftForLogging = (
  id: string,
  prevData: Shift | null | undefined,
  updates: Partial<Shift> | null | undefined
): { prev: ShiftItem | null; next: ShiftItem | null } => {
  const prev = prevData ? shiftToShiftItem({ ...prevData, id }) : null;
  if (!updates) return { prev, next: prev };
  const base: Partial<Shift> = prevData || {};
  const merged = shiftToShiftItem({ ...base, ...updates, id } as Shift & { id: string });
  return { prev, next: merged };
};

// --- 副作用ヘルパー（監査ログ / Google Calendar 同期） ---

/** 監査ログを記録する。ログ失敗時は握りつぶさず警告のみ。 */
const recordAuditLog = async (
  actor: ShiftHistoryActor,
  prev: ShiftItem | null,
  next: ShiftItem | null,
) => {
  const storeId = next?.storeId || prev?.storeId || "";
  const action = determineActionType(prev, next, actor);
  await logShiftChange(action, actor, storeId, next, prev);
};

/** Google Calendar にシフトを同期する（fire-and-forget）。 */
const syncCalendar = (shift: Shift & { id: string }) => {
  ServiceProvider.googleCalendar
    .syncShiftToCalendar(shift)
    .catch(() => {/* Google Calendar同期失敗は無視 */});
};

/** Google Calendar からシフトを削除する（fire-and-forget）。 */
const removeFromCalendar = (shiftId: string, eventId: string) => {
  ServiceProvider.googleCalendar
    .removeShiftFromCalendar(shiftId, eventId)
    .catch(() => {/* Google Calendarイベント削除失敗は無視 */});
};

/** シフトサービスのSupabase実装 */
export class SupabaseShiftAdapter implements IShiftService {
  private async fetchShiftById(id: string): Promise<Shift | null> {
    const supabase = getSupabase();
    const { data } = await supabase.from("shifts").select("*").eq("id", id).single();
    return data ? toShiftFromRow(data) : null;
  }

  /** IDでシフトを1件取得する */
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

  /** 店舗のシフト一覧を取得する */
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

  /** シフトを追加して監査ログを記録する */
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

    if (actor) {
      const next = shiftToShiftItem({
        ...shift, id: shiftId,
        status: shift.status || "draft",
        createdAt: new Date(), updatedAt: new Date(),
      });
      await recordAuditLog(actor, null, next);
    }

    if (shift.status === "approved") {
      syncCalendar({ id: shiftId, ...shift } as Shift & { id: string });
    }

    return shiftId;
  }

  /** シフトを更新して監査ログ・Calendar同期を行う */
  async updateShift(
    id: string,
    shift: Partial<Shift>,
    actor?: ShiftHistoryActor
  ): Promise<void> {
    const supabase = getSupabase();

    const previousData = await this.fetchShiftById(id);

    const row = toUpdateRow(shift);
    const { error } = await supabase.from("shifts").update(row).eq("id", id);
    if (error) throw error;

    if (actor && previousData) {
      const { prev, next } = mergeShiftForLogging(id, previousData, {
        ...shift, updatedAt: new Date(),
      });
      if (next) {
        await recordAuditLog(actor, prev, next);
      }
    }

    const merged = { ...previousData, ...shift, id } as Shift & { id: string };
    const shouldSync = merged.status === "approved" || merged.googleCalendarEventId;
    if (shouldSync) {
      syncCalendar(merged);
    }
  }

  /** シフトを削除してCalendarからも除去する */
  async markShiftAsDeleted(
    id: string,
    deletedBy?: ShiftHistoryActor,
    reason?: string
  ): Promise<void> {
    const supabase = getSupabase();

    const shiftData = await this.fetchShiftById(id);

    if (shiftData?.googleCalendarEventId) {
      removeFromCalendar(id, shiftData.googleCalendarEventId);
    }

    const { error } = await supabase.from("shifts").delete().eq("id", id);
    if (error) throw error;

    if (deletedBy && shiftData) {
      const prev = shiftToShiftItem({ ...shiftData, id });
      await recordAuditLog(deletedBy, prev, null);
    }
  }

  /** シフトの変更リクエストを承認して適用する */
  async approveShiftChanges(
    id: string,
    approver?: ShiftHistoryActor
  ): Promise<void> {
    const supabase = getSupabase();

    // 1. 現在のシフトデータを取得
    const shiftData = await this.fetchShiftById(id);
    if (!shiftData) return;

    const isPending = shiftData.status === "pending";
    const hasRequestedChanges = shiftData.requestedChanges;
    if (!isPending && !hasRequestedChanges) return;

    // 2. DB更新：変更リクエスト適用 or 単純ステータス変更
    await this.applyApproval(id, shiftData);

    // 3. Google Calendar同期（fire-and-forget）
    const updatedShift = await this.fetchShiftById(id);
    if (updatedShift) {
      syncCalendar({ ...updatedShift, id } as Shift & { id: string });
    }

    // 4. 監査ログ
    if (approver) {
      const updates = this.buildApprovalUpdates(shiftData);
      const { prev, next } = mergeShiftForLogging(id, shiftData, updates);
      if (next) {
        await recordAuditLog(approver, prev, next);
      }
    }
  }

  /** 承認時のDB更新を実行する */
  private async applyApproval(id: string, shiftData: Shift): Promise<void> {
    const supabase = getSupabase();
    const hasRequestedChanges = shiftData.requestedChanges;

    if (!hasRequestedChanges) {
      // 単純承認：ステータスのみ変更
      const { error } = await supabase
        .from("shifts")
        .update({ status: "approved" })
        .eq("id", id);
      if (error) throw error;
      return;
    }

    // 変更リクエスト適用：リクエスト内容をシフトに反映
    const changes = Array.isArray(hasRequestedChanges)
      ? hasRequestedChanges[0]
      : hasRequestedChanges;

    // 空配列だった場合、適用する変更がないので単純承認にフォールバック
    if (!changes) {
      const { error } = await supabase
        .from("shifts")
        .update({ status: "approved", requested_changes: null })
        .eq("id", id);
      if (error) throw error;
      return;
    }

    const updateData: Record<string, unknown> = {
      status: "approved",
      requested_changes: null,
    };
    if (changes.startTime) updateData['start_time'] = changes.startTime;
    if (changes.endTime) updateData['end_time'] = changes.endTime;
    if (changes.date) updateData['date'] = changes.date;
    if (changes.type) updateData['type'] = changes.type;
    if (changes.subject) updateData['subject'] = changes.subject;

    const { error } = await supabase
      .from("shifts")
      .update(updateData)
      .eq("id", id);
    if (error) throw error;
  }

  /** 承認内容から監査ログ用の更新差分を構築する */
  private buildApprovalUpdates(shiftData: Shift): Partial<Shift> {
    const hasRequestedChanges = shiftData.requestedChanges;
    if (!hasRequestedChanges) {
      return { status: "approved", updatedAt: new Date() };
    }

    const changes = Array.isArray(hasRequestedChanges)
      ? hasRequestedChanges[0]
      : hasRequestedChanges;

    // 空配列で changes が undefined の場合は単純承認と同じ
    if (!changes) {
      return { status: "approved", updatedAt: new Date() };
    }

    const updates: Partial<Shift> = {
      ...changes,
      status: "approved",
      updatedAt: new Date(),
    };
    delete updates.requestedChanges;
    return updates;
  }

  /** シフトを完了状態にする */
  async markShiftAsCompleted(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("shifts")
      .update({ status: "completed" })
      .eq("id", id);
    if (error) throw error;
  }

  /** シフトの業務報告を保存する */
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

  /** 複数店舗のシフト一覧を取得する */
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

  /** ユーザーがアクセス可能な全店舗のシフトを取得する */
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

  /** 店舗のシフトをShiftItem形式で取得する */
  async getShiftItems(storeId: string): Promise<ShiftItem[]> {
    const supabase = getSupabase();
    // 必要列のみ取得してデータ転送量を削減
    const { data, error } = await supabase
      .from("shifts")
      .select(SHIFT_ITEM_COLUMNS)
      .eq("store_id", storeId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []).map(toShiftItemFromRow);
  }

  /** シフト変更をリアルタイム購読する（デバウンス付き） */
  onShiftsChanged(
    storeId: string,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    // セキュリティ修正: Realtimeフィルタインジェクション防止のため storeId をバリデーション
    validateRealtimeParams(storeId);

    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    const fetchAsShiftItems = async (): Promise<ShiftItem[]> => {
      // 必要列のみ取得してデータ転送量を削減
      const { data, error } = await supabase
        .from("shifts")
        .select(SHIFT_ITEM_COLUMNS)
        .eq("store_id", storeId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data || []).map(toShiftItemFromRow);
    };

    let aborted = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const debouncedFetch = () => {
      if (aborted) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (aborted) return;
        fetchAsShiftItems()
          .then((items) => { if (!aborted) callback(items); })
          .catch((err) => { if (!aborted) onError?.(err); });
      }, 300);
    };

    // 初回データ取得（デバウンスなし）
    fetchAsShiftItems()
      .then((items) => { if (!aborted) callback(items); })
      .catch((err) => { if (!aborted) onError?.(err); });

    // Realtime購読（デバウンスあり）
    channel = supabase
      .channel(`shifts-${storeId}-${++channelCounter}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shifts",
          filter: `store_id=eq.${storeId}`,
        },
        debouncedFetch
      )
      .subscribe();

    return () => {
      aborted = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }

  /** 指定月のシフトを取得する */
  async getShiftsByMonth(
    storeId: string,
    year: number,
    month: number
  ): Promise<ShiftItem[]> {
    const supabase = getSupabase();
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-31`;

    // 必要列のみ取得してデータ転送量を削減
    const { data, error } = await supabase
      .from("shifts")
      .select(SHIFT_ITEM_COLUMNS)
      .eq("store_id", storeId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []).map(toShiftItemFromRow);
  }

  /** 指定月のシフト変更をリアルタイム購読する */
  onShiftsByMonth(
    storeId: string,
    year: number,
    month: number,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    // セキュリティ修正: Realtimeフィルタインジェクション防止のため全パラメータをバリデーション
    validateRealtimeParams(storeId, year, month);

    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-31`;

    const fetchMonthShifts = async () => {
      // 必要列のみ取得してデータ転送量を削減
      const { data, error } = await supabase
        .from("shifts")
        .select(SHIFT_ITEM_COLUMNS)
        .eq("store_id", storeId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      return (data || []).map(toShiftItemFromRow);
    };

    let aborted = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const debouncedFetch = () => {
      if (aborted) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (aborted) return;
        fetchMonthShifts()
          .then((items) => { if (!aborted) callback(items); })
          .catch((err) => { if (!aborted) onError?.(err); });
      }, 300);
    };

    // 初回データ取得（デバウンスなし）
    fetchMonthShifts()
      .then((items) => { if (!aborted) callback(items); })
      .catch((err) => { if (!aborted) onError?.(err); });

    // Realtime購読（デバウンスあり）
    channel = supabase
      .channel(`shifts-month-${storeId}-${year}-${month}-${++channelCounter}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shifts",
          filter: `store_id=eq.${storeId}`,
        },
        debouncedFetch
      )
      .subscribe();

    return () => {
      aborted = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }
}
