/**
 * @file shiftTypes.ts
 * @description シフト管理に関する型定義（ステータス、シフト本体、募集シフト等）
 */

/** シフトのステータス */
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

/** シフトステータスの設定情報（表示ラベル・色・編集可否など） */
export interface ShiftStatusConfig {
  /** ステータスコード */
  status: ShiftStatus;
  /** 表示ラベル */
  label: string;
  /** 表示色 */
  color: string;
  /** 編集可能か */
  canEdit: boolean;
  /** 説明文 */
  description: string;
}

/** 各ステータスの表示設定デフォルト値 */
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
    color: "#FFD700",
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

/** シフトの種類 */
export type ShiftType = "user" | "class" | "staff" | "deleted" | "recruitment";

/** シフトの基本情報。全シフト型の共通フィールド */
export interface BaseShift {
  /** UUID */
  id: string;
  /** シフト所有者のUID */
  userId: string;
  /** 店舗ID */
  storeId: string;
  /** "YYYY-MM-DD"形式 */
  date: string;
  /** "HH:MM"形式 */
  startTime: string;
  /** "HH:MM"形式 */
  endTime: string;
  /** 現在のステータス */
  status: ShiftStatus;
}

/** シフト情報（拡張版）。BaseShiftに表示・管理用の追加フィールドを持つ */
export interface Shift extends BaseShift {
  /** ユーザーのニックネーム（表示用） */
  nickname?: string;
  /** シフトの種類 */
  type?: ShiftType;
  /** 教科 */
  subject?: string;
  /** メモ */
  notes?: string;
  /** 承認者のUID */
  approvedBy?: string;
  /** 却下理由 */
  rejectedReason?: string;
  /** 完了済みか */
  isCompleted?: boolean;
  /** 作成日時 */
  createdAt?: Date;
  /** 更新日時 */
  updatedAt?: Date;
  /** 勤務時間（分） */
  duration?: number;
  /** Googleカレンダー連携用のイベントID */
  googleCalendarEventId?: string;
  /** 途中時間スロットの配列 */
  classes?: Array<ClassTimeSlot>;
  /** 変更リクエストの履歴 */
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

/** 開始時間と終了時間のペア */
export type TimeSlot = {
  /** "HH:MM"形式 */
  start: string;
  /** "HH:MM"形式 */
  end: string;
};

/** 途中時間スロット（休憩・授業など） */
export type ClassTimeSlot = {
  /** "HH:MM"形式 */
  startTime: string;
  /** "HH:MM"形式 */
  endTime: string;
  /** スロットID */
  id?: string;
  /** time_segment_types.id */
  typeId?: string;
  /** タイプ名（非正規化。タイプ削除後も表示用に保持） */
  typeName?: string;
};

/** 途中時間タイプの給与計算モード */
export type WageMode = "exclude" | "include" | "custom_rate";

/** 途中時間タイプ（マスター管理）。DBのtime_segment_typesテーブルに対応 */
export interface TimeSegmentType {
  /** UUID */
  id: string;
  /** 店舗ID */
  storeId: string;
  /** タイプ名（例: "休憩", "授業"） */
  name: string;
  /** アイコン名 */
  icon: string;
  /** 表示色 */
  color: string;
  /** 給与計算モード */
  wageMode: WageMode;
  /** custom_rate時の時給倍率 */
  customRate: number;
  /** 表示順 */
  sortOrder: number;
  /** タスクとの重複を許可するか */
  allowTaskOverlap: boolean;
}

/** 曜日ごとの繰り返し設定 */
export interface RecurringSettings {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

/** シフトデータ（ガントチャート等の表示用） */
export interface ShiftData {
  /** UUID */
  id: string;
  /** ユーザー名 */
  userName: string;
  /** "HH:MM"形式 */
  startTime: string;
  /** "HH:MM"形式 */
  endTime: string;
  /** ユーザー固有色 */
  color?: string;
  /** ステータス */
  status: ShiftStatus;
}

/** シフトの変更リクエスト内容 */
export interface ShiftRequestedChanges {
  startTime?: string;
  endTime?: string;
  date?: string;
  type?: ShiftType;
  subject?: string;
}

/** シフト項目（一覧表示用。表示に必要な拡張情報を含む） */
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
  notes?: string;
  isCompleted: boolean;
  status: ShiftStatus;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
  googleCalendarEventId?: string;
  classes?: Array<ClassTimeSlot>;
  requestedChanges?: ShiftRequestedChanges;
}

/** 募集シフト情報。マスターが作成し、ユーザーが応募する */
export interface RecruitmentShift {
  /** UUID */
  id: string;
  /** 店舗ID */
  storeId: string;
  /** "YYYY-MM-DD"形式 */
  date: string;
  /** "HH:MM"形式 */
  startTime: string;
  /** "HH:MM"形式 */
  endTime: string;
  /** 教科 */
  subject?: string;
  /** メモ */
  notes?: string;
  /** 作成したマスターのUID */
  createdBy: string;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
  /** 最大応募者数 */
  maxApplicants?: number;
  /** 応募情報の配列 */
  applications: RecruitmentApplication[];
  /** 募集状態 */
  status: "open" | "closed" | "cancelled";
  /** 応募締切日時 */
  deadline?: Date;
}

/** 募集シフトへの応募情報 */
export interface RecruitmentApplication {
  /** 応募した講師のUID */
  userId: string;
  /** 講師のニックネーム */
  nickname: string;
  /** 希望開始時間 */
  requestedStartTime: string;
  /** 希望終了時間 */
  requestedEndTime: string;
  /** 応募日時 */
  appliedAt: Date;
  /** 応募状態 */
  status: "pending" | "approved" | "rejected";
  /** 応募時のメモ */
  notes?: string;
}

