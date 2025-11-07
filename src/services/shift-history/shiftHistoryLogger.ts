import { 
  addDoc, 
  collection, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
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

export interface ShiftHistoryActor {
  userId: string;
  nickname: string;
  role: "master" | "teacher" | "system";
}

export interface ShiftHistoryEntry {
  id?: string;
  storeId: string;
  shiftId?: string | null;
  action: ShiftActionType;
  actor: ShiftHistoryActor;
  timestamp?: Timestamp;
  date: string; // YYYY-MM-DD
  prev?: {
    startTime?: string;
    endTime?: string;
    userId?: string;
    userNickname?: string;
    status?: ShiftStatus;
    statusLabel?: string;
    type?: string;
  };
  next?: {
    startTime?: string;
    endTime?: string;
    userId?: string;
    userNickname?: string;
    status?: ShiftStatus;
    statusLabel?: string;
    type?: string;
  };
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
  
  // undefinedの場合はプロパティを除外
  if (shift.subject !== undefined) {
    snapshot.subject = shift.subject;
  }
  
  if (shift.notes !== undefined) {
    snapshot.notes = shift.notes;
  }
  
  if (shift.classes !== undefined) {
    snapshot.classes = shift.classes;
  }
  
  if (shift.extendedTasks !== undefined) {
    snapshot.extendedTasks = shift.extendedTasks;
  }
  
  return snapshot;
};

// アクションに基づいた要約文の生成
const generateSummary = (
  action: ShiftActionType,
  actor: ShiftHistoryActor,
  date: string,
  prev?: any,
  next?: any,
  metadata?: any
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
  metadata?: any
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
      date: shift?.date || prevShift?.date || new Date().toISOString().split("T")[0],
      summary: "",
      ...(metadata?.notes && { notes: metadata.notes }), // undefinedの場合はフィールドを除外
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

    // Firestoreに保存（undefinedフィールドを除外）
    const dataToSave = {
      ...entry,
      timestamp: serverTimestamp(),
    };
    
    // undefinedフィールドを除外
    Object.keys(dataToSave).forEach(key => {
      if (dataToSave[key as keyof typeof dataToSave] === undefined) {
        delete dataToSave[key as keyof typeof dataToSave];
      }
    });
    
    await addDoc(collection(db, "shiftChangeLogs"), dataToSave);
  } catch (error: any) {
    // ログ記録の失敗をコンソールに記録（通常の操作は継続）
    console.error("Shift history logging failed:", error);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    console.error("Action:", action);
    console.error("StoreId:", storeId);
    console.error("Actor:", actor);
    // ログ記録の失敗は通常の操作を妨げないようにする
    // Silent error handling for shift change logging
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
