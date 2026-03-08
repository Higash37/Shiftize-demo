import { getSupabase } from "@/services/supabase/supabase-client";
import { ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";

export type ShiftActionType =
  | "create"
  | "update_time"
  | "update_user"
  | "update_status"
  | "delete"
  | "teacher_create"
  | "teacher_update"
  | "batch_approve";

/** シフト変更のアクター（操作実行者）のロール */
export type ActorRole = "master" | "teacher" | "system";

export interface ShiftHistoryActor {
  userId: string;
  nickname: string;
  role: ActorRole;
}

/** ユーザー情報から監査ログ用のアクターを構築する */
export const createActor = (
  user: { uid: string; nickname?: string; role?: string } | null | undefined,
  defaultRole: ActorRole = "master"
): ShiftHistoryActor | undefined => {
  if (!user) return undefined;
  return {
    userId: user.uid,
    nickname: user.nickname || "教室長",
    role: (user.role as ActorRole) || defaultRole,
  };
};

/** シフト変更前後の差分スナップショット */
export interface ShiftChangeSnapshot {
  startTime?: string;
  endTime?: string;
  userId?: string;
  userNickname?: string;
  status?: ShiftStatus;
  statusLabel?: string;
  type?: string;
}

/** シフト変更時のメタデータ */
export interface ShiftChangeMetadata {
  yearMonth?: string;
  count?: number;
  notes?: string;
  reason?: string;
}

export interface ShiftHistoryEntry {
  id?: string;
  storeId: string;
  shiftId?: string | null;
  action: ShiftActionType;
  actor: ShiftHistoryActor;
  timestamp?: string;
  date: string; // YYYY-MM-DD
  prev?: ShiftChangeSnapshot;
  next?: ShiftChangeSnapshot;
  summary: string;
  notes?: string;
  prevSnapshot?: Partial<ShiftItem>;
  nextSnapshot?: Partial<ShiftItem>;
}

// ステータスラベルの変換
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    approved: "承認済み",
    pending: "申請中",
    rejected: "却下",
    deleted: "削除済み",
    completed: "完了",
  };
  return statusMap[status] || status;
};

const toHistorySnapshot = (shift: ShiftItem): Partial<ShiftItem> => {
  const snapshot: Partial<ShiftItem> = {
    id: shift.id,
    storeId: shift.storeId,
    userId: shift.userId,
    nickname: shift.nickname,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    status: shift.status,
    type: shift.type,
  };

  if (shift.subject !== undefined) {
    snapshot.subject = shift.subject;
  }

  if (shift.notes !== undefined) {
    snapshot.notes = shift.notes;
  }

  if (shift.classes !== undefined) {
    snapshot.classes = shift.classes;
  }

  return snapshot;
};

// アクションに基づいた要約文の生成
const generateSummary = (
  action: ShiftActionType,
  actor: ShiftHistoryActor,
  date: string,
  prev?: ShiftChangeSnapshot,
  next?: ShiftChangeSnapshot,
  metadata?: ShiftChangeMetadata
): string => {
  const actorName = actor.role === "teacher" ? `講師 ${actor.nickname}` : actor.nickname;

  switch (action) {
    case "create":
      return `${actorName} が ${date} のシフトを追加しました（${next?.startTime}-${next?.endTime}, 担当: ${next?.userNickname}）`;

    case "teacher_create":
      return `講師 ${actor.nickname} が ${date} にシフトを申請しました（${next?.startTime}-${next?.endTime}）`;

    case "update_time":
      return `${actorName} が ${date} のシフト時間を ${prev?.startTime}-${prev?.endTime} → ${next?.startTime}-${next?.endTime} に変更しました（担当: ${next?.userNickname}）`;

    case "update_user":
      return `${actorName} が ${date} の担当を ${prev?.userNickname} → ${next?.userNickname} に変更しました（${next?.startTime}-${next?.endTime}）`;

    case "update_status":
      return `${actorName} が ${date} のシフトステータスを ${prev?.statusLabel} → ${next?.statusLabel} に変更しました（${next?.userNickname}）`;

    case "delete":
      return `${actorName} が ${date} のシフトを削除しました（${prev?.startTime}-${prev?.endTime}, 担当: ${prev?.userNickname}）`;

    case "batch_approve":
      return `${actorName} が ${metadata?.yearMonth || date} のシフトを一括承認しました（対象: ${metadata?.count || 0}件）`;

    case "teacher_update":
      return `講師 ${actor.nickname} が ${date} のシフトを変更しました`;

    default:
      return `${actorName} が ${date} のシフトを変更しました`;
  }
};

// シフト変更ログを記録
export const logShiftChange = async (
  action: ShiftActionType,
  actor: ShiftHistoryActor,
  storeId: string,
  shift?: ShiftItem | null,
  prevShift?: ShiftItem | null,
  metadata?: ShiftChangeMetadata
): Promise<void> => {
  try {
    if (!storeId) {
      console.warn("logShiftChange: storeId is missing, skipping history log");
      return;
    }

    // ログエントリの準備
    const entry: ShiftHistoryEntry = {
      storeId,
      shiftId: shift?.id || prevShift?.id || null,
      action,
      actor,
      date: shift?.date || prevShift?.date || new Date().toISOString().split("T")[0]!,
      summary: "",
      ...(metadata?.notes && { notes: metadata.notes }),
    };

    // 変更前後のデータを設定
    if (prevShift) {
      entry.prev = {
        startTime: prevShift.startTime,
        endTime: prevShift.endTime,
        userId: prevShift.userId,
        userNickname: prevShift.nickname,
        status: prevShift.status,
        statusLabel: getStatusLabel(prevShift.status),
        type: prevShift.type,
      };
      entry.prevSnapshot = toHistorySnapshot(prevShift);
    }

    if (shift) {
      entry.next = {
        startTime: shift.startTime,
        endTime: shift.endTime,
        userId: shift.userId,
        userNickname: shift.nickname,
        status: shift.status,
        statusLabel: getStatusLabel(shift.status),
        type: shift.type,
      };
      entry.nextSnapshot = toHistorySnapshot(shift);
    }

    // 要約文を生成
    entry.summary = generateSummary(
      action,
      actor,
      entry.date,
      entry.prev,
      entry.next,
      metadata
    );

    // Supabaseに保存
    const supabase = getSupabase();
    const { error } = await supabase.from("shift_change_logs").insert({
      store_id: entry.storeId,
      shift_id: entry.shiftId,
      action: entry.action,
      actor: entry.actor,
      date: entry.date,
      prev: entry.prev || null,
      next: entry.next || null,
      summary: entry.summary,
      notes: entry.notes || null,
      prev_snapshot: entry.prevSnapshot || null,
      next_snapshot: entry.nextSnapshot || null,
    });

    if (error) {
      console.error("Shift history logging failed:", error.message);
    }
  } catch (error: any) {
    console.error("Shift history logging failed:", error);
  }
};

// 一括承認のログ記録
export const logBatchApprove = async (
  actor: ShiftHistoryActor,
  storeId: string,
  yearMonth: string,
  count: number
): Promise<void> => {
  await logShiftChange(
    "batch_approve",
    actor,
    storeId,
    null,
    null,
    { yearMonth, count }
  );
};

// アクションタイプの判定
export const determineActionType = (
  prevShift: ShiftItem | null,
  nextShift: ShiftItem | null,
  actor: ShiftHistoryActor
): ShiftActionType => {
  // 新規作成
  if (!prevShift && nextShift) {
    return actor.role === "teacher" ? "teacher_create" : "create";
  }

  // 削除
  if (prevShift && !nextShift) {
    return "delete";
  }

  // 更新
  if (prevShift && nextShift) {
    // 講師による変更
    if (actor.role === "teacher") {
      return "teacher_update";
    }

    // 時間変更
    if (prevShift.startTime !== nextShift.startTime ||
        prevShift.endTime !== nextShift.endTime) {
      return "update_time";
    }

    // 担当者変更
    if (prevShift.userId !== nextShift.userId) {
      return "update_user";
    }

    // ステータス変更
    if (prevShift.status !== nextShift.status) {
      return "update_status";
    }
  }

  return "create"; // デフォルト
};
