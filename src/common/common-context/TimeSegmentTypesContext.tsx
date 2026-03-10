/**
 * @file TimeSegmentTypesContext.tsx
 * @description 途中時間タイプ（休憩・授業など）をアプリ全体で共有するContext
 */
import React, { createContext, useContext, useMemo } from "react";
import type { TimeSegmentType } from "@/common/common-models/model-shift/shiftTypes";
import { useTimeSegmentTypes } from "@/modules/master-view/info-dashboard/useTimeSegmentTypes";

/** Contextで配信する値の型 */
interface TimeSegmentTypesContextValue {
  /** タイプ一覧 */
  types: TimeSegmentType[];
  /** IDをキーにしたマップ */
  typesMap: Record<string, TimeSegmentType>;
  /** 読み込み中か */
  loading: boolean;
}

const TimeSegmentTypesContext = createContext<TimeSegmentTypesContextValue>({
  types: [],
  typesMap: {},
  loading: true,
});

/** 途中時間タイプを子コンポーネントに配信するProvider */
export function TimeSegmentTypesProvider({ storeId, children }: { storeId: string; children: React.ReactNode }) {
  const { types, typesMap, loading } = useTimeSegmentTypes(storeId);

  const value = useMemo(() => ({ types, typesMap, loading }), [types, typesMap, loading]);

  return (
    <TimeSegmentTypesContext.Provider value={value}>
      {children}
    </TimeSegmentTypesContext.Provider>
  );
}

/** 途中時間タイプをContextから取得するフック */
export function useTimeSegmentTypesContext() {
  return useContext(TimeSegmentTypesContext);
}
