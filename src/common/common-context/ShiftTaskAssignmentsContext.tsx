/**
 * @file ShiftTaskAssignmentsContext.tsx
 * @description シフトへのタスク割り当て情報をアプリ全体で共有するContext
 */
import React, { createContext, useContext, useMemo } from "react";
import type { ShiftTaskAssignment } from "@/modules/master-view/info-dashboard/useShiftTaskAssignments";
import { useShiftTaskAssignments } from "@/modules/master-view/info-dashboard/useShiftTaskAssignments";

/** Contextで配信する値の型 */
interface ShiftTaskAssignmentsContextValue {
  /** 全割り当て一覧 */
  assignments: ShiftTaskAssignment[];
  /** シフトIDをキーにした割り当てマップ */
  assignmentsByShift: Record<string, ShiftTaskAssignment[]>;
  /** 読み込み中か */
  loading: boolean;
  /** 指定月のデータを取得する */
  fetchForMonth: (year: number, month: number) => Promise<void>;
  /** 一括保存する */
  bulkSave: (assignments: Omit<ShiftTaskAssignment, "id">[], year: number, month: number) => Promise<void>;
  /** 1件を追加または更新する */
  upsertAssignment: (assignment: Omit<ShiftTaskAssignment, "id"> & { id?: string }) => Promise<{ data?: any; error?: any }>;
  /** 1件を削除する */
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

/** シフトタスク割り当て情報を子コンポーネントに配信するProvider */
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

/** シフトタスク割り当て情報をContextから取得するフック */
export function useShiftTaskAssignmentsContext() {
  return useContext(ShiftTaskAssignmentsContext);
}
