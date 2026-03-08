import React, { createContext, useContext, useMemo } from "react";
import type { ShiftTaskAssignment } from "@/modules/master-view/info-dashboard/useShiftTaskAssignments";
import { useShiftTaskAssignments } from "@/modules/master-view/info-dashboard/useShiftTaskAssignments";

interface ShiftTaskAssignmentsContextValue {
  assignments: ShiftTaskAssignment[];
  assignmentsByShift: Record<string, ShiftTaskAssignment[]>;
  loading: boolean;
  fetchForMonth: (year: number, month: number) => Promise<void>;
  bulkSave: (assignments: Omit<ShiftTaskAssignment, "id">[], year: number, month: number) => Promise<void>;
  upsertAssignment: (assignment: Omit<ShiftTaskAssignment, "id"> & { id?: string }) => Promise<{ data?: any; error?: any }>;
  deleteAssignment: (assignmentId: string) => Promise<{ error?: any }>;
}

const ShiftTaskAssignmentsContext = createContext<ShiftTaskAssignmentsContextValue>({
  assignments: [],
  assignmentsByShift: {},
  loading: false,
  fetchForMonth: async () => {},
  bulkSave: async () => {},
  upsertAssignment: async () => ({}),
  deleteAssignment: async () => ({}),
});

export function ShiftTaskAssignmentsProvider({ storeId, children }: { storeId: string; children: React.ReactNode }) {
  const { assignments, assignmentsByShift, loading, fetchForMonth, bulkSave, upsertAssignment, deleteAssignment } = useShiftTaskAssignments(storeId);

  const value = useMemo(
    () => ({ assignments, assignmentsByShift, loading, fetchForMonth, bulkSave, upsertAssignment, deleteAssignment }),
    [assignments, assignmentsByShift, loading, fetchForMonth, bulkSave, upsertAssignment, deleteAssignment]
  );

  return (
    <ShiftTaskAssignmentsContext.Provider value={value}>
      {children}
    </ShiftTaskAssignmentsContext.Provider>
  );
}

export function useShiftTaskAssignmentsContext() {
  return useContext(ShiftTaskAssignmentsContext);
}
