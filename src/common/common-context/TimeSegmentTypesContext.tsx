import React, { createContext, useContext, useMemo } from "react";
import type { TimeSegmentType } from "@/common/common-models/model-shift/shiftTypes";
import { useTimeSegmentTypes } from "@/modules/master-view/info-dashboard/useTimeSegmentTypes";

interface TimeSegmentTypesContextValue {
  types: TimeSegmentType[];
  typesMap: Record<string, TimeSegmentType>;
  loading: boolean;
}

const TimeSegmentTypesContext = createContext<TimeSegmentTypesContextValue>({
  types: [],
  typesMap: {},
  loading: true,
});

export function TimeSegmentTypesProvider({ storeId, children }: { storeId: string; children: React.ReactNode }) {
  const { types, typesMap, loading } = useTimeSegmentTypes(storeId);

  const value = useMemo(() => ({ types, typesMap, loading }), [types, typesMap, loading]);

  return (
    <TimeSegmentTypesContext.Provider value={value}>
      {children}
    </TimeSegmentTypesContext.Provider>
  );
}

export function useTimeSegmentTypesContext() {
  return useContext(TimeSegmentTypesContext);
}
