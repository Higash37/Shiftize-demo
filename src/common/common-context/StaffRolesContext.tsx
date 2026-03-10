/**
 * @file StaffRolesContext.tsx
 * @description スタッフの役割・タスク情報をアプリ全体で共有するContext
 */
import React, { createContext, useContext, useMemo } from "react";
import type { StaffRole, RoleTask, RoleAssignment, TaskAssignment } from "@/modules/master-view/info-dashboard/useStaffTasks";
import { useStaffRoles } from "@/modules/master-view/info-dashboard/useStaffTasks";

/** Contextで配信する値の型 */
interface StaffRolesContextValue {
  /** 役割一覧 */
  roles: StaffRole[];
  /** タスク一覧 */
  tasks: RoleTask[];
  /** 役割のユーザー紐付け一覧 */
  roleAssignments: RoleAssignment[];
  /** タスクのシフト紐付け一覧 */
  taskAssignments: TaskAssignment[];
  /** IDをキーにした役割マップ */
  rolesMap: Record<string, StaffRole>;
  /** IDをキーにしたタスクマップ */
  tasksMap: Record<string, RoleTask>;
  /** 読み込み中か */
  loading: boolean;
}

const StaffRolesContext = createContext<StaffRolesContextValue>({
  roles: [],
  tasks: [],
  roleAssignments: [],
  taskAssignments: [],
  rolesMap: {},
  tasksMap: {},
  loading: true,
});

/** スタッフの役割・タスク情報を子コンポーネントに配信するProvider */
export function StaffRolesProvider({ storeId, children }: { storeId: string; children: React.ReactNode }) {
  const { roles, tasks, roleAssignments, taskAssignments, loading } = useStaffRoles(storeId);

  const rolesMap = useMemo(() => {
    const map: Record<string, StaffRole> = {};
    for (const r of roles) map[r.id] = r;
    return map;
  }, [roles]);

  const tasksMap = useMemo(() => {
    const map: Record<string, RoleTask> = {};
    for (const t of tasks) map[t.id] = t;
    return map;
  }, [tasks]);

  const value = useMemo(
    () => ({ roles, tasks, roleAssignments, taskAssignments, rolesMap, tasksMap, loading }),
    [roles, tasks, roleAssignments, taskAssignments, rolesMap, tasksMap, loading]
  );

  return (
    <StaffRolesContext.Provider value={value}>
      {children}
    </StaffRolesContext.Provider>
  );
}

/** スタッフの役割・タスク情報をContextから取得するフック */
export function useStaffRolesContext() {
  return useContext(StaffRolesContext);
}
