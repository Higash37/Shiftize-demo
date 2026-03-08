import { useState, useCallback, useMemo } from "react";
import { getSupabase } from "@/services/supabase/supabase-client";

export interface ShiftTaskAssignment {
  id: string;
  shiftId: string;
  taskId: string | null;
  roleId: string | null;
  storeId: string;
  userId: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  source: "auto" | "manual";
}

export function useShiftTaskAssignments(storeId: string) {
  const [assignments, setAssignments] = useState<ShiftTaskAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchForMonth = useCallback(
    async (year: number, month: number) => {
      setLoading(true);
      const supabase = getSupabase();
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endMonth = month === 12 ? 1 : month + 1;
      const endYear = month === 12 ? year + 1 : year;
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

      const { data } = await supabase
        .from("shift_task_assignments")
        .select("id, shift_id, task_id, role_id, store_id, user_id, scheduled_date, scheduled_start_time, scheduled_end_time, source")
        .eq("store_id", storeId)
        .gte("scheduled_date", startDate)
        .lt("scheduled_date", endDate);

      if (data) {
        setAssignments(
          data.map((row: any) => ({
            id: row.id,
            shiftId: row.shift_id,
            taskId: row.task_id,
            roleId: row.role_id,
            storeId: row.store_id,
            userId: row.user_id,
            scheduledDate: row.scheduled_date,
            scheduledStartTime: row.scheduled_start_time,
            scheduledEndTime: row.scheduled_end_time,
            source: row.source,
          }))
        );
      }
      setLoading(false);
    },
    [storeId]
  );

  const bulkSave = useCallback(
    async (
      newAssignments: Omit<ShiftTaskAssignment, "id">[],
      year: number,
      month: number
    ) => {
      const supabase = getSupabase();
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endMonth = month === 12 ? 1 : month + 1;
      const endYear = month === 12 ? year + 1 : year;
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

      // 月の自動配置を削除してから一括挿入
      await supabase
        .from("shift_task_assignments")
        .delete()
        .eq("store_id", storeId)
        .eq("source", "auto")
        .gte("scheduled_date", startDate)
        .lt("scheduled_date", endDate);

      const rows = newAssignments.map((a) => ({
        shift_id: a.shiftId,
        task_id: a.taskId,
        role_id: a.roleId,
        store_id: a.storeId,
        user_id: a.userId,
        scheduled_date: a.scheduledDate,
        scheduled_start_time: a.scheduledStartTime,
        scheduled_end_time: a.scheduledEndTime,
        source: a.source,
      }));

      if (rows.length > 0) {
        await supabase.from("shift_task_assignments").insert(rows);
      }

      await fetchForMonth(year, month);
    },
    [storeId, fetchForMonth]
  );

  const upsertAssignment = useCallback(
    async (assignment: Omit<ShiftTaskAssignment, "id"> & { id?: string }) => {
      const supabase = getSupabase();
      const row = {
        ...(assignment.id ? { id: assignment.id } : {}),
        shift_id: assignment.shiftId,
        task_id: assignment.taskId,
        role_id: assignment.roleId,
        store_id: assignment.storeId,
        user_id: assignment.userId,
        scheduled_date: assignment.scheduledDate,
        scheduled_start_time: assignment.scheduledStartTime,
        scheduled_end_time: assignment.scheduledEndTime,
        source: assignment.source,
      };

      if (assignment.id) {
        const { error } = await supabase
          .from("shift_task_assignments")
          .update(row)
          .eq("id", assignment.id);
        if (!error) {
          setAssignments((prev) =>
            prev.map((a) => (a.id === assignment.id ? { ...a, ...assignment } as ShiftTaskAssignment : a))
          );
        }
        return { error };
      } else {
        const { data, error } = await supabase
          .from("shift_task_assignments")
          .insert(row)
          .select()
          .single();
        if (!error && data) {
          const newA: ShiftTaskAssignment = {
            id: data.id,
            shiftId: data.shift_id,
            taskId: data.task_id,
            roleId: data.role_id,
            storeId: data.store_id,
            userId: data.user_id,
            scheduledDate: data.scheduled_date,
            scheduledStartTime: data.scheduled_start_time,
            scheduledEndTime: data.scheduled_end_time,
            source: data.source,
          };
          setAssignments((prev) => [...prev, newA]);
        }
        return { data, error };
      }
    },
    []
  );

  const deleteAssignment = useCallback(async (assignmentId: string) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("shift_task_assignments")
      .delete()
      .eq("id", assignmentId);
    if (!error) {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    }
    return { error };
  }, []);

  const assignmentsByShift = useMemo(() => {
    const map: Record<string, ShiftTaskAssignment[]> = {};
    for (const a of assignments) {
      if (!map[a.shiftId]) map[a.shiftId] = [];
      map[a.shiftId]!.push(a);
    }
    return map;
  }, [assignments]);

  return { assignments, assignmentsByShift, loading, fetchForMonth, bulkSave, upsertAssignment, deleteAssignment };
}
