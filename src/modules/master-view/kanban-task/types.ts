/**
 * カンバンタスク管理の型定義
 */

export type TaskStatus = "not_started" | "in_progress" | "completed";

export interface TaskMemo {
  id: string;
  text: string;
  createdBy: string; // ユーザーUID
  createdByName: string; // ユーザー名
  createdAt: Date;
}

export interface NormalTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  createdBy: string; // ユーザーUID
  createdByName: string; // ユーザー名
  assignedTo?: string; // 担当者UID（オプション）
  assignedToName?: string; // 担当者名
  currentAssignedTo?: string; // 現在実施中の担当者UID
  currentAssignedToName?: string; // 現在実施中の担当者名
  storeId: string; // 店舗ID
  dueDate?: Date; // 期限
  startDate?: Date; // 取り組み開始予定日
  completedDate?: Date; // 完了日
  completedBy?: string; // 完了者UID
  completedByName?: string; // 完了者名
  createdAt: Date;
  updatedAt: Date;
  lastActionAt: Date; // 最終アクション時間（スタートボタンなど）
  tags?: string[]; // タグ
  isPublic: boolean; // 教室長が発行したタスクかどうか
  memos?: TaskMemo[]; // メモ一覧
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: NormalTask[];
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate?: Date;
  startDate?: Date;
  tags: string[];
  isPublic: boolean;
}

// 旧KanbanTask型は互換性のためにNormalTaskのエイリアスとして残す
export type KanbanTask = NormalTask;
export type KanbanTaskFormData = TaskFormData;
