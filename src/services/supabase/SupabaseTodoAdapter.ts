import type {
  ITodoService,
  DailyTodo,
  CreateDailyTodo,
  TodoComment,
  TodoTemplate,
  TodoFlowStep,
  TodoPriority,
} from "../interfaces/ITodoService";
import { getSupabase } from "./supabase-client";

function rowToTodo(row: any): DailyTodo {
  return {
    id: row.id,
    storeId: row.store_id,
    createdBy: row.created_by,
    createdByName: row.created_by_name ?? null,
    assignee: row.assignee ?? null,
    title: row.title,
    templateId: row.template_id ?? null,
    steps: row.steps ?? [],
    stepProgress: row.step_progress ?? {},
    task: row.task ?? null,
    description: row.description ?? null,
    targetDate: row.target_date,
    dueDate: row.due_date ?? null,
    startTime: row.start_time ?? null,
    endTime: row.end_time ?? null,
    priority: row.priority ?? null,
    icon: row.icon ?? null,
    visibleTo: row.visible_to ?? [],
    isCompleted: row.is_completed ?? false,
    completedBy: row.completed_by ?? null,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseTodoAdapter implements ITodoService {
  // ── Todos ──

  async getTodos(storeId: string, targetDate: string): Promise<DailyTodo[]> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("daily_todos")
        .select("*")
        .eq("store_id", storeId)
        .eq("target_date", targetDate)
        .order("created_at", { ascending: true });
      return (data || []).map(rowToTodo);
    } catch {
      return [];
    }
  }

  async addTodo(todo: CreateDailyTodo): Promise<string> {
    const supabase = getSupabase();
    const initProgress: Record<string, any> = {};
    if (todo.steps) {
      for (const s of todo.steps) {
        initProgress[s.id] = { completed: false, completedBy: null, completedAt: null };
      }
    }
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
        step_progress: initProgress,
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
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  async updateTodo(
    id: string,
    updates: Partial<Pick<DailyTodo, "title" | "description" | "visibleTo" | "dueDate" | "startTime" | "endTime" | "priority" | "icon" | "assignee" | "task" | "steps" | "stepProgress">>
  ): Promise<void> {
    const supabase = getSupabase();
    const row: Record<string, any> = { updated_at: new Date().toISOString() };
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
    await supabase.from("daily_todos").update(row).eq("id", id);
  }

  async toggleComplete(id: string, completedBy: string): Promise<void> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("daily_todos")
      .select("is_completed")
      .eq("id", id)
      .single();
    const nowCompleted = !(data?.is_completed ?? false);
    await supabase
      .from("daily_todos")
      .update({
        is_completed: nowCompleted,
        completed_by: nowCompleted ? completedBy : null,
        completed_at: nowCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }

  async updateStepProgress(todoId: string, stepId: string, completed: boolean, completedBy: string): Promise<void> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("daily_todos")
      .select("step_progress")
      .eq("id", todoId)
      .single();
    const progress = data?.step_progress ?? {};
    progress[stepId] = {
      completed,
      completedBy: completed ? completedBy : null,
      completedAt: completed ? new Date().toISOString() : null,
    };
    await supabase
      .from("daily_todos")
      .update({ step_progress: progress, updated_at: new Date().toISOString() })
      .eq("id", todoId);
  }

  async deleteTodo(id: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("daily_todos").delete().eq("id", id);
  }

  // ── Comments ──

  async getComments(todoId: string): Promise<TodoComment[]> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("todo_comments")
        .select("*")
        .eq("todo_id", todoId)
        .order("created_at", { ascending: true });
      return (data || []).map((row: any) => ({
        id: row.id,
        todoId: row.todo_id,
        parentId: row.parent_id ?? null,
        stepId: row.step_id ?? null,
        content: row.content,
        createdBy: row.created_by,
        createdByName: row.created_by_name ?? null,
        createdAt: new Date(row.created_at),
      }));
    } catch {
      return [];
    }
  }

  async addComment(todoId: string, content: string, createdBy: string, createdByName: string | null, parentId?: string, stepId?: string): Promise<string> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("todo_comments")
      .insert({ todo_id: todoId, parent_id: parentId ?? null, step_id: stepId ?? null, content, created_by: createdBy, created_by_name: createdByName })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  async deleteComment(commentId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("todo_comments").delete().eq("id", commentId);
  }

  // ── Templates ──

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

  async updateTemplate(id: string, title: string, description: string | null, icon: string | null, defaultPriority: TodoPriority | null, steps: TodoFlowStep[]): Promise<void> {
    const supabase = getSupabase();
    await supabase
      .from("todo_templates")
      .update({ title, description, icon, default_priority: defaultPriority, steps, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  async deleteTemplate(id: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("todo_templates").delete().eq("id", id);
  }
}
