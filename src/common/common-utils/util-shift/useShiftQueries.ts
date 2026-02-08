import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { Shift, ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";

/**
 * Shift -> ShiftItem 変換ヘルパー
 * ServiceProvider.shifts.getShifts()はShift[]を返すが、
 * このhookはShiftItem[]を使用するため変換が必要
 */
const mapShiftToShiftItem = (shift: Shift): ShiftItem => {
  const item: ShiftItem = {
    id: shift.id,
    userId: shift.userId || "",
    storeId: shift.storeId || "",
    nickname: shift.nickname || "",
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    type: shift.type || "user",
    isCompleted: shift.isCompleted || false,
    status: shift.status as ShiftStatus,
    duration: shift.duration?.toString() || "0",
    createdAt: shift.createdAt || new Date(),
    updatedAt: shift.updatedAt || new Date(),
    classes: Array.isArray(shift.classes) ? shift.classes : [],
  };

  if (shift.subject != null) {
    item.subject = shift.subject;
  }

  if (shift.requestedChanges?.[0]) {
    const rc: ShiftItem["requestedChanges"] = {
      startTime: shift.requestedChanges[0].startTime,
      endTime: shift.requestedChanges[0].endTime,
      date: shift.date,
    };
    if (shift.type != null) rc.type = shift.type;
    if (shift.subject != null) rc.subject = shift.subject;
    item.requestedChanges = rc;
  }

  return item;
};

export const useShifts = (storeId?: string) => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // シフトデータを取得する関数
  const fetchShifts = useCallback(async () => {
    // storeIdが未定義の場合は処理を停止
    if (!storeId) {
      setShifts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const rawShifts = await ServiceProvider.shifts.getShifts(storeId);

      // Shift[] -> ShiftItem[] に変換し、storeIdの安全チェック
      const shiftsData = rawShifts
        .map(mapShiftToShiftItem)
        .filter((shift) => shift.storeId === storeId);

      setShifts(shiftsData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [storeId]); // storeIdを依存配列に追加

  // 特定の月のシフトデータを取得する関数
  const fetchShiftsByMonth = useCallback(
    async (year: number, month: number) => {
      // storeIdが未定義の場合は処理を停止
      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 指定した月の最初と最後の日
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        // ISO文字列形式に変換 (YYYY-MM-DD)
        const startDateStr = startDate.toISOString().split("T")[0] ?? "";
        const endDateStr = endDate.toISOString().split("T")[0] ?? "";

        // ServiceProviderからシフトを取得し、日付範囲でフィルタリング
        const rawShifts = await ServiceProvider.shifts.getShifts(storeId);

        const shiftsData = rawShifts
          .map(mapShiftToShiftItem)
          // storeIdと日付範囲でフィルタリング
          .filter(
            (shift) =>
              shift.storeId === storeId &&
              shift.date >= startDateStr &&
              shift.date <= endDateStr
          )
          // JavaScriptでソート
          .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare === 0) {
              return a.startTime.localeCompare(b.startTime);
            }
            return dateCompare;
          });

        setShifts(shiftsData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [storeId] // storeIdを依存配列に追加
  );

  // コンポーネントマウント時に初期データを取得
  useEffect(() => {
    // storeIdが定義されている場合のみ実行
    if (storeId) {
      fetchShifts();
    } else {
      // storeIdが未定義の場合は空配列を設定してローディング終了
      setShifts([]);
      setLoading(false);
    }
  }, [fetchShifts, storeId]);
  return {
    shifts,
    loading,
    error,
    fetchShifts,
    fetchShiftsByMonth,
  };
};
