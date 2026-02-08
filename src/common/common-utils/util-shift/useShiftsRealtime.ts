import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { ShiftItem } from "@/common/common-models/ModelIndex";

export const useShiftsRealtime = (storeId?: string) => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 月指定でのシフト取得（リアルタイム）
  const fetchShiftsByMonth = useCallback(
    (year: number, month: number): (() => void) | null => {
      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const unsubscribe = ServiceProvider.shifts.onShiftsByMonth(
          storeId,
          year,
          month,
          (shiftsData) => {
            setShifts(shiftsData);
            setLoading(false);
          },
          (err) => {
            if (__DEV__) {
              console.error("Realtime shift error:", err);
            }
            setError(err);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        return null;
      }
    },
    [storeId]
  );

  // 全シフト取得（リアルタイム）
  useEffect(() => {
    if (!storeId) {
      setShifts([]);
      setLoading(false);
      return;
    }

    const unsubscribe = ServiceProvider.shifts.onShiftsChanged(
      storeId,
      (shiftsData) => {
        setShifts(shiftsData);
        setLoading(false);
      },
      (err) => {
        if (__DEV__) {
          console.error("Realtime shift error:", err);
        }
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [storeId]);

  return {
    shifts,
    loading,
    error,
    fetchShiftsByMonth,
  };
};
