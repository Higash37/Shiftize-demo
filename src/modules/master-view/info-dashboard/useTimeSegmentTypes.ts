/** @file useTimeSegmentTypes.ts
 *  @description 時間区分タイプ（授業・休憩など）の CRUD を管理するカスタムフック。
 *    Supabase の time_segment_types テーブルとやり取りする。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React Hooks / Supabase クライアント / TimeSegmentType 型
 *  - 利用先: InfoDashboard 内の時間区分管理セクション、
 *            ShiftTimeSlot など時間区分表示が必要な箇所
 *
 *  【フックの概要】
 *  - useTimeSegmentTypes(storeId)
 *    - 引数: storeId（対象店舗ID）
 *    - 戻り値: { types, typesMap, loading, addType, updateType, deleteType }
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "@/services/supabase/supabase-client";
import type { TimeSegmentType, WageMode } from "@/common/common-models/model-shift/shiftTypes";

export function useTimeSegmentTypes(storeId: string) {
  // --- State ---
  /** 時間区分タイプの一覧 */
  const [types, setTypes] = useState<TimeSegmentType[]>([]);
  /** 初回ロード中フラグ */
  const [loading, setLoading] = useState(true);

  // --- データ取得 ---
  /**
   * Supabase から時間区分タイプを取得する。
   * sort_order → created_at の順でソートする。
   * 取得した snake_case のカラム名を camelCase に変換して state に格納する。
   */
  const fetchData = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("time_segment_types")
      .select("id, store_id, name, icon, color, wage_mode, custom_rate, sort_order, allow_task_overlap")
      .eq("store_id", storeId)
      .order("sort_order")
      .order("created_at");

    if (data) {
      setTypes(
        data.map((row: any) => ({
          id: row.id,
          storeId: row.store_id,
          name: row.name,
          icon: row.icon,
          color: row.color,
          wageMode: row.wage_mode as WageMode,
          customRate: row.custom_rate ?? 0,
          sortOrder: row.sort_order ?? 0,
          allowTaskOverlap: row.allow_task_overlap ?? true,
        }))
      );
    }
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CRUD 操作 ---
  /** 新しい時間区分タイプを追加する */
  const addType = useCallback(
    async (name: string, icon: string, color: string, wageMode: WageMode, customRate: number) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("time_segment_types")
        .insert({ store_id: storeId, name, icon, color, wage_mode: wageMode, custom_rate: customRate })
        .select()
        .single();
      if (!error && data) {
        setTypes((prev) => [
          ...prev,
          {
            id: data.id,
            storeId: data.store_id,
            name: data.name,
            icon: data.icon,
            color: data.color,
            wageMode: data.wage_mode as WageMode,
            customRate: data.custom_rate ?? 0,
            sortOrder: data.sort_order ?? 0,
            allowTaskOverlap: data.allow_task_overlap ?? true,
          },
        ]);
      }
      return { data, error };
    },
    [storeId]
  );

  /**
   * 時間区分タイプを部分更新する。
   * camelCase のフィールド名を snake_case に変換して Supabase に送る。
   * ---- TypeScript 構文メモ ----
   * Partial<Pick<TimeSegmentType, "name" | "icon" | ...>>
   *   → 更新対象に限定したフィールドだけ、任意で渡せる型。
   */
  const updateType = useCallback(
    async (
      typeId: string,
      fields: Partial<Pick<TimeSegmentType, "name" | "icon" | "color" | "wageMode" | "customRate" | "allowTaskOverlap">>
    ) => {
      const supabase = getSupabase();
      const row: Record<string, unknown> = {};
      if (fields.name !== undefined) row["name"] = fields.name;
      if (fields.icon !== undefined) row["icon"] = fields.icon;
      if (fields.color !== undefined) row["color"] = fields.color;
      if (fields.wageMode !== undefined) row["wage_mode"] = fields.wageMode;
      if (fields.customRate !== undefined) row["custom_rate"] = fields.customRate;
      if (fields.allowTaskOverlap !== undefined) row["allow_task_overlap"] = fields.allowTaskOverlap;

      const { error } = await supabase.from("time_segment_types").update(row).eq("id", typeId);
      if (!error) {
        setTypes((prev) => prev.map((t) => (t.id === typeId ? { ...t, ...fields } : t)));
      }
    },
    []
  );

  /** 時間区分タイプを削除し、state からも除去する */
  const deleteType = useCallback(async (typeId: string) => {
    const supabase = getSupabase();
    await supabase.from("time_segment_types").delete().eq("id", typeId);
    setTypes((prev) => prev.filter((t) => t.id !== typeId));
  }, []);

  // --- 派生データ ---
  /**
   * id をキーにした辞書。O(1) で特定タイプにアクセスできる。
   * Record<string, TimeSegmentType> は「文字列キー → TimeSegmentType 値」の型。
   */
  const typesMap = useMemo(() => {
    const map: Record<string, TimeSegmentType> = {};
    for (const t of types) map[t.id] = t;
    return map;
  }, [types]);

  return { types, typesMap, loading, addType, updateType, deleteType };
}
