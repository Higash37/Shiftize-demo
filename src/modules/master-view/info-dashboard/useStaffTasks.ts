import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/services/supabase/supabase-client";

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

export interface RoleAssignment {
  role_id: string;
  user_id: string;
}

export interface TaskAssignment {
  task_id: string;
  user_id: string;
}

export function useStaffRoles(storeId: string) {
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [tasks, setTasks] = useState<RoleTask[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);

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

  // --- Role CRUD ---
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

  const deleteRole = useCallback(async (roleId: string) => {
    const supabase = getSupabase();
    await supabase.from("staff_roles").delete().eq("id", roleId);
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    setTasks((prev) => prev.filter((t) => t.role_id !== roleId));
    setRoleAssignments((prev) => prev.filter((a) => a.role_id !== roleId));
  }, []);

  // --- Task CRUD ---
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

  const deleteTask = useCallback(async (taskId: string) => {
    const supabase = getSupabase();
    await supabase.from("role_tasks").delete().eq("id", taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTaskAssignments((prev) => prev.filter((a) => a.task_id !== taskId));
  }, []);

  // --- Role assignment toggle ---
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

  // --- Task assignment toggle ---
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

  // --- Helpers ---
  const getUserRoles = useCallback(
    (userId: string): StaffRole[] => {
      const userRoleIds = roleAssignments
        .filter((a) => a.user_id === userId)
        .map((a) => a.role_id);
      return roles.filter((r) => userRoleIds.includes(r.id));
    },
    [roles, roleAssignments]
  );

  const getUserTasks = useCallback(
    (userId: string): RoleTask[] => {
      const userTaskIds = taskAssignments
        .filter((a) => a.user_id === userId)
        .map((a) => a.task_id);
      return tasks.filter((t) => userTaskIds.includes(t.id));
    },
    [tasks, taskAssignments]
  );

  const isRoleAssigned = useCallback(
    (roleId: string, userId: string): boolean =>
      roleAssignments.some((a) => a.role_id === roleId && a.user_id === userId),
    [roleAssignments]
  );

  const isTaskAssigned = useCallback(
    (taskId: string, userId: string): boolean =>
      taskAssignments.some((a) => a.task_id === taskId && a.user_id === userId),
    [taskAssignments]
  );

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
