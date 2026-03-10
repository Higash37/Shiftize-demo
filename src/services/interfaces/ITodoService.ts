/** @file ITodoService.ts @description 日次TODO・コメント・テンプレートの管理インターフェース */

/** TODOの優先度 */
export type TodoPriority = "urgent" | "high" | "medium" | "low";

/** TODOフローのステップ */
export interface TodoFlowStep {
  /** ステップID */
  id: string;
  /** ステップのラベル */
  label: string;
  /** 表示順序 */
  order: number;
  /** 子ステップ */
  children?: TodoFlowStep[];
}

/** TODOテンプレート */
export interface TodoTemplate {
  /** テンプレートID */
  id: string;
  /** 店舗ID */
  storeId: string;
  /** タイトル */
  title: string;
  /** 説明 */
  description: string | null;
  /** アイコン */
  icon: string | null;
  /** デフォルトの優先度 */
  defaultPriority: TodoPriority | null;
  /** フローのステップ一覧 */
  steps: TodoFlowStep[];
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}

/** ステップの進捗エントリ */
export interface StepProgressEntry {
  /** 完了済みかどうか */
  completed: boolean;
  /** 完了者のユーザーID */
  completedBy: string | null;
  /** 完了日時 */
  completedAt: string | null;
}

/** 日次TODOのデータ構造 */
export interface DailyTodo {
  /** TODO ID */
  id: string;
  /** 店舗ID */
  storeId: string;
  /** 作成者のユーザーID */
  createdBy: string;
  /** 作成者の名前 */
  createdByName: string | null;
  /** 担当者のユーザーID */
  assignee: string | null;
  /** タイトル */
  title: string;
  /** テンプレートID */
  templateId: string | null;
  /** フローのステップ一覧 */
  steps: TodoFlowStep[];
  /** ステップごとの進捗 */
  stepProgress: Record<string, StepProgressEntry>;
  /** 業務名 */
  task: string | null;
  /** 説明 */
  description: string | null;
  /** 対象日（YYYY-MM-DD形式） */
  targetDate: string;
  /** 期限日 */
  dueDate: string | null;
  /** 開始時刻 */
  startTime: string | null;
  /** 終了時刻 */
  endTime: string | null;
  /** 優先度 */
  priority: TodoPriority | null;
  /** アイコン */
  icon: string | null;
  /** 閲覧可能なユーザーID一覧 */
  visibleTo: string[];
  /** 完了済みかどうか */
  isCompleted: boolean;
  /** 完了者のユーザーID */
  completedBy: string | null;
  /** 完了日時 */
  completedAt: Date | null;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}

/** 日次TODO作成時の入力データ */
export type CreateDailyTodo = Pick<
  DailyTodo,
  "storeId" | "createdBy" | "createdByName" | "title" | "targetDate"
> &
  Partial<Pick<DailyTodo, "description" | "visibleTo" | "dueDate" | "startTime" | "endTime" | "priority" | "icon" | "assignee" | "task" | "templateId" | "steps">>;

/** TODOへのコメント */
export interface TodoComment {
  /** コメントID */
  id: string;
  /** 対象のTODO ID */
  todoId: string;
  /** 親コメントID（返信の場合） */
  parentId: string | null;
  /** 対象ステップID */
  stepId: string | null;
  /** コメント内容 */
  content: string;
  /** 投稿者のユーザーID */
  createdBy: string;
  /** 投稿者の名前 */
  createdByName: string | null;
  /** 投稿日時 */
  createdAt: Date;
}

/** 日次TODO・コメント・テンプレートを管理するサービス */
export interface ITodoService {
  // --- Todos ---

  /** 指定日のTODO一覧を取得する */
  getTodos(storeId: string, targetDate: string): Promise<DailyTodo[]>;
  /** TODOを追加する */
  addTodo(todo: CreateDailyTodo): Promise<string>;
  /** TODOを更新する */
  updateTodo(id: string, updates: Partial<Pick<DailyTodo, "title" | "description" | "visibleTo" | "dueDate" | "startTime" | "endTime" | "priority" | "icon" | "assignee" | "task" | "steps" | "stepProgress">>): Promise<void>;
  /** TODOの完了状態を切り替える */
  toggleComplete(id: string, completedBy: string): Promise<void>;
  /** ステップの進捗を更新する */
  updateStepProgress(todoId: string, stepId: string, completed: boolean, completedBy: string): Promise<void>;
  /** TODOを削除する */
  deleteTodo(id: string): Promise<void>;

  // --- Comments ---

  /** TODOのコメント一覧を取得する */
  getComments(todoId: string): Promise<TodoComment[]>;
  /** TODOにコメントを追加する */
  addComment(todoId: string, content: string, createdBy: string, createdByName: string | null, parentId?: string, stepId?: string): Promise<string>;
  /** コメントを削除する */
  deleteComment(commentId: string): Promise<void>;

  // --- Templates ---

  /** 店舗のテンプレート一覧を取得する */
  getTemplates(storeId: string): Promise<TodoTemplate[]>;
  /** テンプレートを追加する */
  addTemplate(storeId: string, title: string, description: string | null, icon: string | null, defaultPriority: TodoPriority | null, steps: TodoFlowStep[]): Promise<string>;
  /** テンプレートを更新する */
  updateTemplate(id: string, title: string, description: string | null, icon: string | null, defaultPriority: TodoPriority | null, steps: TodoFlowStep[]): Promise<void>;
  /** テンプレートを削除する */
  deleteTemplate(id: string): Promise<void>;
}
