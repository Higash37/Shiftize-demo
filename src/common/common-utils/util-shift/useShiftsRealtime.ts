import { useState, useEffect, useCallback, useRef } from "react";
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

  /** 全シフトを手動で再取得（チャネル再作成なし） */
  const refetch = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await ServiceProvider.shifts.getShiftItems(storeId);
      setShifts(data);
    } catch (err) {
      setError(err as Error);
    }
  }, [storeId]);

  return {
    shifts,
    loading,
    error,
    fetchShiftsByMonth,
    refetch,
  };
};

/**
 * 月別シフト専用フック（全件取得を回避）
 * this-month / next-month ページ向けに最適化
 */
export const useShiftsByMonth = (
  storeId: string | undefined,
  initialYear: number,
  initialMonth: number
) => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);
  const currentPeriodRef = useRef({ year: initialYear, month: initialMonth });

  const subscribe = useCallback(
    (year: number, month: number) => {
      // 前のサブスクリプションをクリーンアップ
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }

      currentPeriodRef.current = { year, month };

      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const unsub = ServiceProvider.shifts.onShiftsByMonth(
          storeId,
          year,
          month,
          (data) => {
            setShifts(data);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
          }
        );
        unsubRef.current = unsub;
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    },
    [storeId]
  );

  // 初回マウント時に指定月のみ購読
  useEffect(() => {
    subscribe(initialYear, initialMonth);
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [storeId, initialYear, initialMonth, subscribe]);

  /** 月変更時に呼ぶ（サブスクリプションを切り替え） */
  const changeMonth = useCallback(
    (year: number, month: number) => {
      subscribe(year, month);
    },
    [subscribe]
  );

  /** 現在の月のシフトを手動で再取得（チャネル再作成なし） */
  const refetch = useCallback(async () => {
    if (!storeId) return;
    const { year, month } = currentPeriodRef.current;
    try {
      const data = await ServiceProvider.shifts.getShiftsByMonth(storeId, year, month);
      setShifts(data);
    } catch (err) {
      setError(err as Error);
    }
  }, [storeId]);

  return { shifts, loading, error, changeMonth, refetch };
};
