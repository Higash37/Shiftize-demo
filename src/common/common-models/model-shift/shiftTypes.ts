/**
 * シフト管理に関する基本的な型定義
 */

/**
 * シフトのステータス
 */
export type ShiftStatus =
  | "draft" // 下書き
  | "pending" // 申請中
  | "approved" // 承認済み
  | "rejected" // 却下
  | "deletion_requested" // 削除申請中
  | "deleted" // 削除済み
  | "completed" // 完了
  | "purged" // 完全非表示
  | "recruitment"; // 募集中

/**
 * シフトステータスの設定情報
 */
export interface ShiftStatusConfig {
  status: ShiftStatus;
  label: string;
  color: string;
  canEdit: boolean;
  description: string;
}

/**
 * デフォルトのシフトステータス設定
 */
export const DEFAULT_SHIFT_STATUS_CONFIG: ShiftStatusConfig[] = [
  {
    status: "pending",
    label: "申請中",
    color: "#FFD700",
    canEdit: true,
    description: "新規申請されたシフト",
  },
  {
    status: "approved",
    label: "承認済み",
    color: "#90caf9",
    canEdit: false,
    description: "承認されたシフト",
  },
  {
    status: "rejected",
    label: "却下",
    color: "#ffcdd2",
    canEdit: true,
    description: "却下されたシフト",
  },
  {
    status: "deletion_requested",
    label: "削除申請中",
    color: "#FFA500",
    canEdit: false,
    description: "削除申請中のシフト",
  },
  {
    status: "deleted",
    label: "削除済み",
    color: "#9e9e9e",
    canEdit: false,
    description: "削除されたシフト",
  },
  {
    status: "completed",
    label: "完了",
    color: "#4CAF50",
    canEdit: false,
    description: "完了したシフト",
  },
  {
    status: "draft",
    label: "下書き",
    color: "#e0e0e0",
    canEdit: true,
    description: "下書き状態のシフト",
  },
  {
    status: "recruitment",
    label: "募集中",
    color: "#9e9e9e",
    canEdit: false,
    description: "募集中のシフト",
  },
];

/**
 * シフトの種類
 */
export type ShiftType = "user" | "class" | "staff" | "deleted" | "recruitment";

/**
 * 基本的なシフト情報
 */
export interface BaseShift {
  id: string;
  userId: string;
  storeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
}

/**
 * シフト情報（拡張版）
 */
export interface Shift extends BaseShift {
  nickname?: string;
  type?: ShiftType;
  subject?: string;
  notes?: string;
  approvedBy?: string;
  rejectedReason?: string;
  isCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  duration?: number;
  googleCalendarEventId?: string;
  classes?: Array<ClassTimeSlot>;
  requestedChanges?: Array<{
    startTime: string;
    endTime: string;
    status: ShiftStatus;
    requestedAt: Date;
    date?: string;
    type?: ShiftType;
    subject?: string;
  }>;
}

/**
 * 時間スロット（開始時間と終了時間）
 */
export type TimeSlot = {
  start: string;
  end: string;
};

/**
 * 授業時間スロット
 */
export type ClassTimeSlot = {
  startTime: string;
  endTime: string;
  id?: string;
};

/**
 * 繰り返し設定
 */
export interface RecurringSettings {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

/**
 * シフトデータ（表示用）
 */
export interface ShiftData {
  id: string;
  userName: string;
  startTime: string;
  endTime: string;
  color?: string;
  status: ShiftStatus;
}

/**
 * シフト項目（表示用の拡張情報を含む）
 */
export interface ShiftItem {
  id: string;
  userId: string;
  storeId: string;
  nickname: string;
  date: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  subject?: string;
  notes?: string; // メモを追加
  isCompleted: boolean;
  status: ShiftStatus;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
  googleCalendarEventId?: string;
  classes?: Array<ClassTimeSlot>;
  requestedChanges?: {
    startTime?: string;
    endTime?: string;
    date?: string;
    type?: ShiftType;
    subject?: string;
  };
}

/**
 * 募集シフト情報
 */
export interface RecruitmentShift {
  id: string;
  storeId: string;
  date: string;
  startTime: string;
  endTime: string;
  subject?: string;
  notes?: string;
  createdBy: string; // マスターのユーザーID
  createdAt: Date;
  updatedAt: Date;
  maxApplicants?: number; // 最大応募者数
  applications: RecruitmentApplication[]; // 応募情報の配列
  status: "open" | "closed" | "cancelled"; // 募集状態
  deadline?: Date; // 応募締切日時
}

/**
 * 募集シフトへの応募情報
 */
export interface RecruitmentApplication {
  userId: string; // 応募した講師のユーザーID
  nickname: string; // 講師のニックネーム
  requestedStartTime: string; // 希望開始時間
  requestedEndTime: string; // 希望終了時間
  appliedAt: Date; // 応募日時
  status: "pending" | "approved" | "rejected"; // 応募状態
  notes?: string; // 応募時のメモ
}

