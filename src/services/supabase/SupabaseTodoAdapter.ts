/**
 * @file SupabaseTodoAdapter.ts
 * @description 日次タスク（Todo）のCRUD操作をSupabase経由で行うアダプター。
 *
 * 【このファイルの位置づけ】
 * ITodoService インターフェースを実装し、daily_todos / todo_comments / todo_templates
 * テーブルへの読み書きを行う。業務管理画面（InfoDashboard）で使用。
 *
 *   業務管理画面（InfoDashboard）
 *        ↓ ServiceProvider.todos.getTodos() 等
 *   SupabaseTodoAdapter（★このファイル）
 *        ↓ Supabase クエリ
 *   Supabase DB（daily_todos, todo_comments, todo_templates テーブル）
 *
 * 【3つのテーブルの関係】
 * - daily_todos: 日付ごとのタスク。店舗 × 日付で管理
 * - todo_comments: タスクへのコメント（スレッド形式）
 * - todo_templates: タスクのテンプレート（繰り返しタスクの雛形）
 *
 * 【DBカラム名の変換】
 * Supabase（PostgreSQL）は snake_case（store_id）、
 * TypeScript側は camelCase（storeId）を使う。
 * このファイル内で手動変換している。
 */

// ITodoService: Todoサービスのインターフェース（契約）
// DailyTodo: 日次タスクの型
// CreateDailyTodo: タスク作成時の入力型
// TodoComment: コメントの型
// TodoTemplate: テンプレートの型
// TodoFlowStep: テンプレートのステップ（チェックリスト項目）の型
// TodoPriority: 優先度の型（"high" | "medium" | "low" 等）
import type {
  ITodoService,
  DailyTodo,
  CreateDailyTodo,
  TodoComment,
  TodoTemplate,
  TodoFlowStep,
  TodoPriority,
} from "../interfaces/ITodoService";
// getSupabase: Supabaseクライアント取得
import { getSupabase } from "./supabase-client";

/**
 * rowToTodo: DBの行データ（snake_case）をアプリの型（camelCase）に変換するヘルパー関数。
 *
 * row: any としているのは、Supabaseのレスポンス型が動的なため。
 * ?? : null合体演算子。左辺がnull/undefinedの場合に右辺の値を返す。
 *   例: row.assignee ?? null → row.assigneeがnull/undefinedなら null を返す
 *
 * @param row - DBから取得した1行のデータ
 * @returns DailyTodo - アプリ内部で使う型に変換されたタスク
 */
function rowToTodo(row: any): DailyTodo {
  return {
    id: row.id,
    storeId: row.store_id,                          // snake_case → camelCase
    createdBy: row.created_by,                      // 作成者のUID
    createdByName: row.created_by_name ?? null,     // 作成者名（なければnull）
    assignee: row.assignee ?? null,                 // 担当者（なければnull）
    title: row.title,                               // タスクタイトル
    templateId: row.template_id ?? null,            // テンプレートID（なければnull）
    steps: row.steps ?? [],                         // ステップ一覧（なければ空配列）
    stepProgress: row.step_progress ?? {},          // ステップの進捗状況（なければ空オブジェクト）
    task: row.task ?? null,                         // タスク内容
    description: row.description ?? null,           // 説明文
    targetDate: row.target_date,                    // 対象日（YYYY-MM-DD）
    dueDate: row.due_date ?? null,                  // 期限日
    startTime: row.start_time ?? null,              // 開始時刻
    endTime: row.end_time ?? null,                  // 終了時刻
    priority: row.priority ?? null,                 // 優先度
    icon: row.icon ?? null,                         // アイコン
    visibleTo: row.visible_to ?? [],                // 表示対象ユーザーの配列
    isCompleted: row.is_completed ?? false,          // 完了フラグ
    completedBy: row.completed_by ?? null,          // 完了者のUID
    completedAt: row.completed_at ? new Date(row.completed_at) : null,  // 完了日時（Date型に変換）
    createdAt: new Date(row.created_at),            // 作成日時
    updatedAt: new Date(row.updated_at),            // 更新日時
  };
}

/**
 * SupabaseTodoAdapter: Todoサービスの実装クラス。
 * implements ITodoService で全メソッドの実装を強制する。
 */
export class SupabaseTodoAdapter implements ITodoService {
  // ════════════════════════════════════════════
  // ── Todos（日次タスク） ──
  // ════════════════════════════════════════════

  /**
   * getTodos: 指定店舗・指定日のタスク一覧を取得する。
   *
   * @param storeId - 店舗ID
   * @param targetDate - 対象日（"YYYY-MM-DD"形式）
   * @returns Promise<DailyTodo[]> - タスク一覧（作成日時の昇順）
   */
  async getTodos(storeId: string, targetDate: string): Promise<DailyTodo[]> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("daily_todos")
        .select("*")                                  // 全カラム取得
        .eq("store_id", storeId)                     // WHERE store_id = storeId
        .eq("target_date", targetDate)               // AND target_date = targetDate
        .order("created_at", { ascending: true });   // ORDER BY created_at ASC
      // 各行をDailyTodo型に変換して返す
      return (data || []).map(rowToTodo);
    } catch {
      return [];
    }
  }

  /**
   * addTodo: 新しいタスクを追加する。
   *
   * ステップの進捗状況（stepProgress）を初期化する:
   * 各ステップのIDをキーにして、completed=false の初期値を設定する。
   *
   * .select("id").single() でINSERT後に生成されたIDを取得する。
   *
   * @param todo - 作成するタスクのデータ
   * @returns Promise<string> - 作成されたタスクのID
   * @throws Error - INSERT失敗時
   */
  async addTodo(todo: CreateDailyTodo): Promise<string> {
    const supabase = getSupabase();

    // ステップ進捗の初期化: { stepId: { completed: false, ... } } の形式
    const initProgress: Record<string, any> = {};
    if (todo.steps) {
      for (const s of todo.steps) {
        initProgress[s.id] = { completed: false, completedBy: null, completedAt: null };
      }
    }

    // INSERT文: camelCase → snake_case に手動変換してDBに保存
    const { data, error } = await supabase
      .from("daily_todos")
      .insert({
        store_id: todo.storeId,
        created_by: todo.createdBy,
        created_by_name: todo.createdByName,
        assignee: todo.assignee ?? null,
        title: todo.title,
        template_id: todo.templateId ?? null,
        steps: todo.steps ?? [],
        step_progress: initProgress,              // 初期化した進捗データ
        task: todo.task ?? null,
        description: todo.description ?? null,
        target_date: todo.targetDate,
        due_date: todo.dueDate ?? null,
        start_time: todo.startTime ?? null,
        end_time: todo.endTime ?? null,
        priority: todo.priority ?? null,
        icon: todo.icon ?? null,
        visible_to: todo.visibleTo ?? [],
      })
      .select("id")    // INSERT後にidカラムだけ取得
      .single();       // 1行だけ期待する（配列ではなくオブジェクトで返る）
    if (error) throw error;
    return data.id;
  }

  /**
   * updateTodo: 既存タスクの一部フィールドを更新する。
   *
   * Partial<Pick<DailyTodo, ...>> の意味:
   * - Pick<DailyTodo, "title" | "description" | ...>: DailyTodoから指定プロパティだけ抽出
   * - Partial<...>: 全プロパティをオプショナル（?）にする
   * → 「title, description, ... のうち、渡されたものだけ更新する」という型
   *
   * @param id - 更新対象のタスクID
   * @param updates - 更新するフィールド（指定されたフィールドのみ更新）
   */
  async updateTodo(
    id: string,
    updates: Partial<Pick<DailyTodo, "title" | "description" | "visibleTo" | "dueDate" | "startTime" | "endTime" | "priority" | "icon" | "assignee" | "task" | "steps" | "stepProgress">>
  ): Promise<void> {
    const supabase = getSupabase();

    // 更新対象のフィールドを動的に構築
    // updated_at は常に更新する
    const row: Record<string, any> = { updated_at: new Date().toISOString() };

    // !== undefined チェック: 明示的にundefinedでない場合のみ更新対象に追加
    // null は「値をクリアする」意図があるため、undefined とは区別する
    if (updates.assignee !== undefined) row["assignee"] = updates.assignee;
    if (updates.title !== undefined) row["title"] = updates.title;
    if (updates.task !== undefined) row["task"] = updates.task;
    if (updates.description !== undefined) row["description"] = updates.description;
    if (updates.visibleTo !== undefined) row["visible_to"] = updates.visibleTo;
    if (updates.dueDate !== undefined) row["due_date"] = updates.dueDate;
    if (updates.startTime !== undefined) row["start_time"] = updates.startTime;
    if (updates.endTime !== undefined) row["end_time"] = updates.endTime;
    if (updates.priority !== undefined) row["priority"] = updates.priority;
    if (updates.icon !== undefined) row["icon"] = updates.icon;
    if (updates.steps !== undefined) row["steps"] = updates.steps;
    if (updates.stepProgress !== undefined) row["step_progress"] = updates.stepProgress;

    // UPDATE文: 構築したオブジェクトで指定IDのレコードを更新
    await supabase.from("daily_todos").update(row).eq("id", id);
  }

  /**
   * toggleComplete: タスクの完了/未完了を切り替える（トグル）。
   *
   * 処理の流れ:
   * 1. 現在の完了状態をDBから取得
   * 2. 逆の状態に更新（完了→未完了、未完了→完了）
   * 3. 完了時は完了者と完了日時をセット、未完了時はクリア
   *
   * @param id - タスクID
   * @param completedBy - 完了操作を行ったユーザーのUID
   */
  async toggleComplete(id: string, completedBy: string): Promise<void> {
    const supabase = getSupabase();

    // 現在の完了状態を取得
    const { data } = await supabase
      .from("daily_todos")
      .select("is_completed")
      .eq("id", id)
      .single();

    // 現在の状態を反転: true → false、false → true
    // ! は論理否定演算子
    const nowCompleted = !(data?.is_completed ?? false);

    // 更新: 完了なら完了者と日時を設定、未完了ならnullに
    await supabase
      .from("daily_todos")
      .update({
        is_completed: nowCompleted,
        completed_by: nowCompleted ? completedBy : null,   // 三項演算子
        completed_at: nowCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }

  /**
   * updateStepProgress: タスク内の個別ステップの進捗を更新する。
   *
   * ステップ進捗はJSONBカラムに保存されており、以下の構造を持つ:
   * {
   *   "step-1": { completed: true, completedBy: "uid-xxx", completedAt: "2025-..." },
   *   "step-2": { completed: false, completedBy: null, completedAt: null },
   * }
   *
   * @param todoId - タスクID
   * @param stepId - ステップID
   * @param completed - 完了したかどうか
   * @param completedBy - 完了操作を行ったユーザーのUID
   */
  async updateStepProgress(todoId: string, stepId: string, completed: boolean, completedBy: string): Promise<void> {
    const supabase = getSupabase();

    // 現在のステップ進捗を取得
    const { data } = await supabase
      .from("daily_todos")
      .select("step_progress")
      .eq("id", todoId)
      .single();

    // 進捗データの更新: 指定ステップだけ書き換え
    const progress = data?.step_progress ?? {};
    progress[stepId] = {
      completed,
      completedBy: completed ? completedBy : null,
      completedAt: completed ? new Date().toISOString() : null,
    };

    // 更新した進捗データをDBに書き戻し
    await supabase
      .from("daily_todos")
      .update({ step_progress: progress, updated_at: new Date().toISOString() })
      .eq("id", todoId);
  }

  /**
   * deleteTodo: タスクを削除する。
   *
   * @param id - 削除するタスクのID
   */
  async deleteTodo(id: string): Promise<void> {
    const supabase = getSupabase();
    // DELETE文: WHERE id = :id のレコードを削除
    await supabase.from("daily_todos").delete().eq("id", id);
  }

  // ════════════════════════════════════════════
  // ── Comments（コメント） ──
  // ════════════════════════════════════════════

  /**
   * getComments: タスクに紐づくコメント一覧を取得する。
   *
   * @param todoId - タスクID
   * @returns Promise<TodoComment[]> - コメント一覧（作成日時の昇順）
   */
  async getComments(todoId: string): Promise<TodoComment[]> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("todo_comments")
        .select("*")
        .eq("todo_id", todoId)
        .order("created_at", { ascending: true });

      // snake_case → camelCase 変換
      return (data || []).map((row: any) => ({
        id: row.id,
        todoId: row.todo_id,
        parentId: row.parent_id ?? null,             // 返信先のコメントID（スレッド用）
        stepId: row.step_id ?? null,                 // 特定ステップへのコメント
        content: row.content,                        // コメント本文
        createdBy: row.created_by,                   // 投稿者UID
        createdByName: row.created_by_name ?? null,  // 投稿者名
        createdAt: new Date(row.created_at),         // 投稿日時
      }));
    } catch {
      return [];
    }
  }

  /**
   * addComment: タスクにコメントを追加する。
   *
   * @param todoId - タスクID
   * @param content - コメント本文
   * @param createdBy - 投稿者のUID
   * @param createdByName - 投稿者の表示名
   * @param parentId - 返信先コメントID（スレッド返信の場合）
   * @param stepId - 特定ステップへのコメントの場合のステップID
   * @returns Promise<string> - 作成されたコメントのID
   */
  async addComment(todoId: string, content: string, createdBy: string, createdByName: string | null, parentId?: string, stepId?: string): Promise<string> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("todo_comments")
      .insert({
        todo_id: todoId,
        parent_id: parentId ?? null,
        step_id: stepId ?? null,
        content,
        created_by: createdBy,
        created_by_name: createdByName,
      })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  /**
   * deleteComment: コメントを削除する。
   *
   * @param commentId - 削除するコメントのID
   */
  async deleteComment(commentId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("todo_comments").delete().eq("id", commentId);
  }

  // ════════════════════════════════════════════
  // ── Templates（テンプレート） ──
  // ════════════════════════════════════════════

  /**
   * getTemplates: 店舗のタスクテンプレート一覧を取得する。
   * テンプレートは繰り返し使うタスクの雛形で、ワンクリックでタスクを作成できる。
   *
   * @param storeId - 店舗ID
   * @returns Promise<TodoTemplate[]> - テンプレート一覧
   */
  async getTemplates(storeId: string): Promise<TodoTemplate[]> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("todo_templates")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: true });

      return (data || []).map((row: any) => ({
        id: row.id,
        storeId: row.store_id,
        title: row.title,
        description: row.description ?? null,
        icon: row.icon ?? null,
        defaultPriority: row.default_priority ?? null,
        steps: row.steps ?? [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch {
      return [];
    }
  }

  /**
   * addTemplate: 新しいテンプレートを追加する。
   *
   * @param storeId - 店舗ID
   * @param title - テンプレートタイトル
   * @param description - 説明文
   * @param icon - アイコン
   * @param defaultPriority - デフォルト優先度
   * @param steps - ステップ（チェックリスト項目）の配列
   * @returns Promise<string> - 作成されたテンプレートのID
   */
  async addTemplate(storeId: string, title: string, description: string | null, icon: string | null, defaultPriority: TodoPriority | null, steps: TodoFlowStep[]): Promise<string> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("todo_templates")
      .insert({ store_id: storeId, title, description, icon, default_priority: defaultPriority, steps })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  /**
   * updateTemplate: 既存テンプレートを更新する。
   *
   * @param id - テンプレートID
   * @param title - タイトル
   * @param description - 説明文
   * @param icon - アイコン
   * @param defaultPriority - デフォルト優先度
   * @param steps - ステップ配列
   */
  async updateTemplate(id: string, title: string, description: string | null, icon: string | null, defaultPriority: TodoPriority | null, steps: TodoFlowStep[]): Promise<void> {
    const supabase = getSupabase();
    await supabase
      .from("todo_templates")
      .update({ title, description, icon, default_priority: defaultPriority, steps, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  /**
   * deleteTemplate: テンプレートを削除する。
   *
   * @param id - 削除するテンプレートのID
   */
  async deleteTemplate(id: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("todo_templates").delete().eq("id", id);
  }
}
