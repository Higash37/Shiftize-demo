import { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "@/services/supabase/supabase-client";
import type { TimeSegmentType, WageMode } from "@/common/common-models/model-shift/shiftTypes";

export function useTimeSegmentTypes(storeId: string) {
  const [types, setTypes] = useState<TimeSegmentType[]>([]);
  const [loading, setLoading] = useState(true);

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

  const deleteType = useCallback(async (typeId: string) => {
    const supabase = getSupabase();
    await supabase.from("time_segment_types").delete().eq("id", typeId);
    setTypes((prev) => prev.filter((t) => t.id !== typeId));
  }, []);

  const typesMap = useMemo(() => {
    const map: Record<string, TimeSegmentType> = {};
    for (const t of types) map[t.id] = t;
    return map;
  }, [types]);

  return { types, typesMap, loading, addType, updateType, deleteType };
}
