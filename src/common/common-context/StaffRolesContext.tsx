import React, { createContext, useContext, useMemo } from "react";
import type { StaffRole, RoleTask, RoleAssignment, TaskAssignment } from "@/modules/master-view/info-dashboard/useStaffTasks";
import { useStaffRoles } from "@/modules/master-view/info-dashboard/useStaffTasks";

interface StaffRolesContextValue {
  roles: StaffRole[];
  tasks: RoleTask[];
  roleAssignments: RoleAssignment[];
  taskAssignments: TaskAssignment[];
  rolesMap: Record<string, StaffRole>;
  tasksMap: Record<string, RoleTask>;
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

export function useStaffRolesContext() {
  return useContext(StaffRolesContext);
}
