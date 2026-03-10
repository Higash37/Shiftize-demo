/** @file useShiftTaskAssignments.ts
 *  @description シフト×タスク配置データを管理するカスタムフック。
 *    Supabase の shift_task_assignments テーブルから月単位でデータを取得し、
 *    一括保存・個別 upsert・削除の操作を提供する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React Hooks / Supabase クライアント
 *  - 利用先: InfoDashboard（情報ダッシュボード）配下のタスク配置セクション
 *
 *  【フックの概要】
 *  - useShiftTaskAssignments(storeId)
 *    - 引数: storeId（対象店舗ID）
 *    - 戻り値: { assignments, assignmentsByShift, loading,
 *               fetchForMonth, bulkSave, upsertAssignment, deleteAssignment }
 */
import { useState, useCallback, useMemo } from "react";
import { getSupabase } from "@/services/supabase/supabase-client";

/**
 * シフトタスク配置の1レコードを表すインターフェース。
 * source は "auto"（自動配置）または "manual"（手動配置）の
 * ユニオンリテラル型。
 */
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
  // --- State ---
  /** 取得済みの配置データ一覧 */
  const [assignments, setAssignments] = useState<ShiftTaskAssignment[]>([]);
  /** データ取得中かどうか */
  const [loading, setLoading] = useState(false);

  // --- データ取得 ---
  /**
   * 指定した年月の配置データを Supabase から取得する。
   * 月初〜翌月初の範囲で store_id フィルタを掛ける。
   */
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

  // --- 一括保存 ---
  /**
   * 月の自動配置データを全て削除してから新しいデータを一括挿入する。
   * ---- TypeScript 構文メモ ----
   * Omit<ShiftTaskAssignment, "id">
   *   → ユーティリティ型。ShiftTaskAssignment から id フィールドを除外した型。
   *     新規作成時は id がまだないため、この型を使う。
   */
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

  // --- 個別 upsert ---
  /**
   * 1件の配置データを挿入または更新する。
   * id があれば update、なければ insert を実行する。
   * ---- TypeScript 構文メモ ----
   * Omit<ShiftTaskAssignment, "id"> & { id?: string }
   *   → 交差型（&）で「id を除外した型」に「id をオプションで追加」した型。
   *     id がある場合は更新、ない場合は新規挿入となる。
   */
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

  // --- 削除 ---
  /** 指定 ID の配置データを削除し、ローカル state からも除外する */
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

  // --- 派生データ ---
  /**
   * assignments を shiftId でグループ化した辞書。
   * Record<string, ShiftTaskAssignment[]> は「キーが文字列、値が配列」のオブジェクト型。
   * useMemo で assignments が変わった時だけ再計算する。
   */
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
