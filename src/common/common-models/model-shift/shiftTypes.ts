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
  | "purged"; // 完全非表示

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
];

/**
 * シフトの種類
 */
export type ShiftType = "user" | "class" | "staff" | "deleted";

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
  classes?: Array<ClassTimeSlot>;
  extendedTasks?: Array<ShiftTaskSlot>; // 追加：シフト内のタスクスロット
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
 * シフト内タスクスロット
 */
export interface ShiftTaskSlot {
  id: string;
  taskId: string; // ExtendedTaskのID
  startTime: string; // HH:MM形式
  endTime: string; // HH:MM形式
  title: string; // タスク名
  shortName?: string; // 2文字の略称
  color?: string; // 表示色
  icon?: string; // アイコン
  status?: "pending" | "in_progress" | "completed" | "cancelled"; // 実行状況
  actualStartTime?: string; // 実際の開始時間
  actualEndTime?: string; // 実際の終了時間
  notes?: string; // メモ
  createdAt: Date;
}

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
 * タスク項目
 */
export interface TaskItem {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  shortName?: string; // 2文字の簡潔なタスク名（略称）
  color?: string;
  icon?: string;
  description?: string;
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
  isCompleted: boolean;
  status: ShiftStatus;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
  classes?: Array<ClassTimeSlot>;
  tasks?: Array<TaskItem>; // タスク配列を追加
  extendedTasks?: Array<ShiftTaskSlot>; // 拡張タスク配列を追加
  requestedChanges?: {
    startTime?: string;
    endTime?: string;
    date?: string;
    type?: ShiftType;
    subject?: string;
  };
}

/**
 * タスクのタイプ
 */
export type TaskType =
  | "standard" // 通常タスク
  | "time_specific" // 時間指定タスク
  | "custom" // 独自設定タスク
  | "user_defined"
  | "class";

/**
 * 時間指定タスクの時間範囲
 */
export interface TimeRange {
  startTime: string; // HH:MM形式
  endTime: string; // HH:MM形式
}

/**
 * タスクの特別タグ
 */
export type TaskTag =
  | "limited_time" // 期間限定
  | "staff_only" // スタッフ限定
  | "high_priority" // 高優先度
  | "training" // 研修
  | "event"; // イベント

/**
 * タスクの難易度・重要度レベル
 */
export type TaskLevel = "low" | "medium" | "high";

/**
 * 拡張されたタスク定義
 */
export interface ExtendedTask {
  id: string;
  title: string;
  shortName?: string; // 2文字の簡潔なタスク名（略称）
  description: string;
  type: TaskType;

  // 基本設定
  baseTimeMinutes: number; // 基本実行時間（分）
  baseCountPerShift: number; // シフト1日あたりの基本回数

  // 時間指定タスク用
  restrictedTimeRanges?: TimeRange[]; // 実行可能時間範囲（複数指定可能）
  restrictedStartTime?: string; // 実行可能開始時間（後方互換性のため残す）
  restrictedEndTime?: string; // 実行可能終了時間（後方互換性のため残す）

  // 権限・制限
  requiredRole?: "staff" | "master"; // 必要な権限
  tags: TaskTag[]; // 特別タグ

  // 優先度・評価用
  priority: TaskLevel; // 優先度
  difficulty: TaskLevel; // 難易度

  // 表示設定
  color?: string; // タスクの表示色（デフォルトは#2196F3）
  icon?: string; // Ioniconsのアイコン名（デフォルトはcheckbox-outline）

  // 期間限定用
  validFrom?: Date; // 有効期間開始
  validTo?: Date; // 有効期間終了

  // メタデータ
  storeId: string;
  createdBy: string; // 作成者
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean; // アクティブ状態
}

/**
 * シフト内でのタスク実行記録
 */
export interface TaskExecution {
  taskId: string;
  actualCount: number; // 実際の実行回数
  actualTimeMinutes: number; // 実際の実行時間
  startTime?: string; // 実行開始時間
  endTime?: string; // 実行終了時間
  notes?: string; // メモ
}

/**
 * タスクパフォーマンス分析用データ
 */
export interface TaskPerformance {
  taskId: string;
  userId: string;

  // 基本統計
  totalExecutions: number; // 総実行回数
  totalTimeMinutes: number; // 総実行時間
  averageTimePerExecution: number; // 1回あたりの平均時間

  // 効率性指標
  efficiencyRate: number; // 効率性 (基本時間/実際時間)
  consistencyRate: number; // 一貫性 (標準偏差の逆数)

  // 積極性指標
  proactivityRate: number; // 積極性 (実行回数/基本回数)
  frequencyRate: number; // 頻度 (実行シフト数/総シフト数)

  // 品質指標
  completionRate: number; // 完了率
  accuracyRate: number; // 正確性

  // 期間
  periodStart: Date;
  periodEnd: Date;
  lastUpdated: Date;
}

/**
 * 拡張されたタスクアイテム（ガントチャート表示用）
 */
export interface ExtendedTaskItem extends TaskItem {
  type: TaskType;
  tags: TaskTag[];
  priority: TaskLevel;
  baseTimeMinutes?: number;
  actualTimeMinutes?: number;
  executionCount?: number;
  isUserDefined?: boolean; // ユーザー定義タスクかどうか
  notes?: string;
  shortName?: string; // 2文字の簡潔なタスク名（略称）
}
