/** @file useStaffTasks.ts
 *  @description スタッフの役割(ロール)・タスク・配置情報を管理するカスタムフック。
 *    Supabase の staff_roles / role_tasks / user_role_assignments /
 *    user_task_assignments テーブルとの CRUD 操作を提供する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React Hooks / Supabase クライアント
 *  - 利用先: InfoDashboard 内のタスク管理セクション
 *
 *  【フックの概要】
 *  - useStaffRoles(storeId)
 *    - 引数: storeId（対象店舗ID）
 *    - 戻り値: ロール一覧、タスク一覧、配置データ、CRUD 関数群、
 *              ヘルパー関数群（getUserRoles, isRoleAssigned 等）
 */
import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/services/supabase/supabase-client";

/** スタッフの役割（ロール）を表すインターフェース */
export interface StaffRole {
  id: string;
  store_id: string;
  icon: string;
  name: string;
  color: string;
  description: string;
  schedule_days: number[];
  schedule_start_time: string | null;
  schedule_duration_minutes: number | null;
  schedule_interval_minutes: number | null;
  required_count: number;
  assignment_mode: "anyone" | "manual";
}

/** ロールに紐づく個別タスクを表すインターフェース */
export interface RoleTask {
  id: string;
  role_id: string;
  store_id: string;
  icon: string;
  name: string;
  color: string;
  description: string;
  schedule_days: number[];
  schedule_start_time: string | null;
  schedule_duration_minutes: number | null;
  schedule_interval_minutes: number | null;
  required_count: number;
  assignment_mode: "anyone" | "manual";
}

/** ユーザーとロールの紐付けを表す型 */
export interface RoleAssignment {
  role_id: string;
  user_id: string;
}

/** ユーザーとタスクの紐付けを表す型 */
export interface TaskAssignment {
  task_id: string;
  user_id: string;
}

export function useStaffRoles(storeId: string) {
  // --- State ---
  /** ロール一覧 */
  const [roles, setRoles] = useState<StaffRole[]>([]);
  /** タスク一覧 */
  const [tasks, setTasks] = useState<RoleTask[]>([]);
  /** ロール×ユーザーの配置 */
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  /** タスク×ユーザーの配置 */
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  /** 初回ロード中フラグ */
  const [loading, setLoading] = useState(true);

  // --- データ取得 ---
  /**
   * 4つのテーブルを Promise.all で並列取得する。
   * Promise.all は全ての Promise が解決するまで待ち、結果を配列で返す。
   */
  const fetchData = useCallback(async () => {
    const supabase = getSupabase();
    const [rolesRes, tasksRes, roleAssignRes, taskAssignRes] = await Promise.all([
      supabase
        .from("staff_roles")
        .select("id, store_id, icon, name, color, description, schedule_days, schedule_start_time, schedule_duration_minutes, schedule_interval_minutes, required_count, assignment_mode")
        .eq("store_id", storeId)
        .order("created_at"),
      supabase
        .from("role_tasks")
        .select("id, role_id, store_id, icon, name, color, description, schedule_days, schedule_start_time, schedule_duration_minutes, schedule_interval_minutes, required_count, assignment_mode")
        .eq("store_id", storeId)
        .order("created_at"),
      supabase
        .from("user_role_assignments")
        .select("role_id, user_id")
        .eq("store_id", storeId),
      supabase
        .from("user_task_assignments")
        .select("task_id, user_id")
        .eq("store_id", storeId),
    ]);

    if (rolesRes.data) setRoles(rolesRes.data);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (roleAssignRes.data) setRoleAssignments(roleAssignRes.data);
    if (taskAssignRes.data) setTaskAssignments(taskAssignRes.data);
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Role CRUD（ロールの追加・更新・削除） ---
  /** 新しいロールを追加し、成功したら state にも反映する */
  const addRole = useCallback(
    async (icon: string, name: string, color: string, description: string) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("staff_roles")
        .insert({ store_id: storeId, icon, name, color, description })
        .select()
        .single();
      if (!error && data) {
        setRoles((prev) => [...prev, data]);
      }
      return { data, error };
    },
    [storeId]
  );

  /**
   * ロールを部分更新する。
   * ---- TypeScript 構文メモ ----
   * Partial<Pick<StaffRole, "icon" | "name" | ...>>
   *   → Pick でフィールドを絞り、Partial で全てオプショナルにした型。
   *     更新したいフィールドだけを渡せる。
   */
  const updateRole = useCallback(
    async (roleId: string, fields: Partial<Pick<StaffRole, "icon" | "name" | "color" | "description" | "schedule_days" | "schedule_start_time" | "schedule_duration_minutes" | "schedule_interval_minutes" | "required_count" | "assignment_mode">>) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("staff_roles").update(fields).eq("id", roleId);
      if (!error) {
        setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, ...fields } : r)));
      }
    },
    []
  );

  /** ロールを削除し、紐づくタスクと配置も state から除去する */
  const deleteRole = useCallback(async (roleId: string) => {
    const supabase = getSupabase();
    await supabase.from("staff_roles").delete().eq("id", roleId);
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    setTasks((prev) => prev.filter((t) => t.role_id !== roleId));
    setRoleAssignments((prev) => prev.filter((a) => a.role_id !== roleId));
  }, []);

  // --- Task CRUD（タスクの追加・更新・削除） ---
  /** 指定ロールに新しいタスクを追加する */
  const addTask = useCallback(
    async (roleId: string, icon: string, name: string, color: string, description: string) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("role_tasks")
        .insert({ role_id: roleId, store_id: storeId, icon, name, color, description })
        .select()
        .single();
      if (!error && data) {
        setTasks((prev) => [...prev, data]);
      }
      return { data, error };
    },
    [storeId]
  );

  const updateTask = useCallback(
    async (taskId: string, fields: Partial<Pick<RoleTask, "icon" | "name" | "color" | "description" | "schedule_days" | "schedule_start_time" | "schedule_duration_minutes" | "schedule_interval_minutes" | "required_count" | "assignment_mode">>) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("role_tasks").update(fields).eq("id", taskId);
      if (!error) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...fields } : t)));
      }
    },
    []
  );

  /** タスクを削除し、紐づく配置も state から除去する */
  const deleteTask = useCallback(async (taskId: string) => {
    const supabase = getSupabase();
    await supabase.from("role_tasks").delete().eq("id", taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTaskAssignments((prev) => prev.filter((a) => a.task_id !== taskId));
  }, []);

  // --- Role assignment toggle（ロール配置の切り替え） ---
  /**
   * ユーザー×ロールの配置をトグルする。
   * 既に配置されていれば解除、なければ新規配置する。
   */
  const toggleRoleAssignment = useCallback(
    async (roleId: string, userId: string) => {
      const supabase = getSupabase();
      const exists = roleAssignments.some(
        (a) => a.role_id === roleId && a.user_id === userId
      );

      if (exists) {
        await supabase
          .from("user_role_assignments")
          .delete()
          .eq("role_id", roleId)
          .eq("user_id", userId);
        setRoleAssignments((prev) =>
          prev.filter((a) => !(a.role_id === roleId && a.user_id === userId))
        );
      } else {
        await supabase
          .from("user_role_assignments")
          .insert({ role_id: roleId, user_id: userId, store_id: storeId });
        setRoleAssignments((prev) => [...prev, { role_id: roleId, user_id: userId }]);
      }
    },
    [roleAssignments, storeId]
  );

  // --- Task assignment toggle（タスク配置の切り替え） ---
  /** ユーザー×タスクの配置をトグルする */
  const toggleTaskAssignment = useCallback(
    async (taskId: string, userId: string) => {
      const supabase = getSupabase();
      const exists = taskAssignments.some(
        (a) => a.task_id === taskId && a.user_id === userId
      );

      if (exists) {
        await supabase
          .from("user_task_assignments")
          .delete()
          .eq("task_id", taskId)
          .eq("user_id", userId);
        setTaskAssignments((prev) =>
          prev.filter((a) => !(a.task_id === taskId && a.user_id === userId))
        );
      } else {
        await supabase
          .from("user_task_assignments")
          .insert({ task_id: taskId, user_id: userId, store_id: storeId });
        setTaskAssignments((prev) => [...prev, { task_id: taskId, user_id: userId }]);
      }
    },
    [taskAssignments, storeId]
  );

  // --- Helpers（ヘルパー関数） ---
  /** 指定ユーザーに割り当てられたロール一覧を返す */
  const getUserRoles = useCallback(
    (userId: string): StaffRole[] => {
      const userRoleIds = roleAssignments
        .filter((a) => a.user_id === userId)
        .map((a) => a.role_id);
      return roles.filter((r) => userRoleIds.includes(r.id));
    },
    [roles, roleAssignments]
  );

  /** 指定ユーザーに割り当てられたタスク一覧を返す */
  const getUserTasks = useCallback(
    (userId: string): RoleTask[] => {
      const userTaskIds = taskAssignments
        .filter((a) => a.user_id === userId)
        .map((a) => a.task_id);
      return tasks.filter((t) => userTaskIds.includes(t.id));
    },
    [tasks, taskAssignments]
  );

  /** 指定ユーザーにロールが割り当てられているか判定する */
  const isRoleAssigned = useCallback(
    (roleId: string, userId: string): boolean =>
      roleAssignments.some((a) => a.role_id === roleId && a.user_id === userId),
    [roleAssignments]
  );

  /** 指定ユーザーにタスクが割り当てられているか判定する */
  const isTaskAssigned = useCallback(
    (taskId: string, userId: string): boolean =>
      taskAssignments.some((a) => a.task_id === taskId && a.user_id === userId),
    [taskAssignments]
  );

  /** 指定ロールに紐づくタスク一覧を返す */
  const getRoleTasks = useCallback(
    (roleId: string): RoleTask[] => {
      return tasks.filter((t) => t.role_id === roleId);
    },
    [tasks]
  );

  return {
    roles,
    tasks,
    roleAssignments,
    taskAssignments,
    loading,
    refetch: fetchData,
    addRole,
    updateRole,
    deleteRole,
    addTask,
    updateTask,
    deleteTask,
    toggleRoleAssignment,
    toggleTaskAssignment,
    getUserRoles,
    getUserTasks,
    isRoleAssigned,
    isTaskAssigned,
    getRoleTasks,
  };
}
