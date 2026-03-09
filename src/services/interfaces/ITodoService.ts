export type TodoPriority = "urgent" | "high" | "medium" | "low";

export interface TodoFlowStep {
  id: string;
  label: string;
  order: number;
  children?: TodoFlowStep[];
}

export interface TodoTemplate {
  id: string;
  storeId: string;
  title: string;
  description: string | null;
  icon: string | null;
  defaultPriority: TodoPriority | null;
  steps: TodoFlowStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StepProgressEntry {
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
}

export interface DailyTodo {
  id: string;
  storeId: string;
  createdBy: string;
  createdByName: string | null;
  assignee: string | null;
  title: string;
  templateId: string | null;
  steps: TodoFlowStep[];
  stepProgress: Record<string, StepProgressEntry>;
  task: string | null;
  description: string | null;
  targetDate: string;
  dueDate: string | null;
  startTime: string | null;
  endTime: string | null;
  priority: TodoPriority | null;
  icon: string | null;
  visibleTo: string[];
  isCompleted: boolean;
  completedBy: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDailyTodo = Pick<
  DailyTodo,
  "storeId" | "createdBy" | "createdByName" | "title" | "targetDate"
> &
  Partial<Pick<DailyTodo, "description" | "visibleTo" | "dueDate" | "startTime" | "endTime" | "priority" | "icon" | "assignee" | "task" | "templateId" | "steps">>;

export interface TodoComment {
  id: string;
  todoId: string;
  parentId: string | null;
  stepId: string | null;
  content: string;
  createdBy: string;
  createdByName: string | null;
  createdAt: Date;
}

export interface ITodoService {
  // Todos
  getTodos(storeId: string, targetDate: string): Promise<DailyTodo[]>;
  addTodo(todo: CreateDailyTodo): Promise<string>;
  updateTodo(id: string, updates: Partial<Pick<DailyTodo, "title" | "description" | "visibleTo" | "dueDate" | "startTime" | "endTime" | "priority" | "icon" | "assignee" | "task" | "steps" | "stepProgress">>): Promise<void>;
  toggleComplete(id: string, completedBy: string): Promise<void>;
  updateStepProgress(todoId: string, stepId: string, completed: boolean, completedBy: string): Promise<void>;
  deleteTodo(id: string): Promise<void>;
  // Comments
  getComments(todoId: string): Promise<TodoComment[]>;
  addComment(todoId: string, content: string, createdBy: string, createdByName: string | null, parentId?: string, stepId?: string): Promise<string>;
  deleteComment(commentId: string): Promise<void>;
  // Templates
  getTemplates(storeId: string): Promise<TodoTemplate[]>;
  addTemplate(storeId: string, title: string, description: string | null, icon: string | null, defaultPriority: TodoPriority | null, steps: TodoFlowStep[]): Promise<string>;
  updateTemplate(id: string, title: string, description: string | null, icon: string | null, defaultPriority: TodoPriority | null, steps: TodoFlowStep[]): Promise<void>;
  deleteTemplate(id: string): Promise<void>;
}
