import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";

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
      const shiftsRef = collection(db, "shifts");
      // 必ずstoreIdでフィルタリング
      const q = query(shiftsRef, where("storeId", "==", storeId));

      const querySnapshot = await getDocs(q);

      // フィルタリング済みデータのみを処理
      const shiftsData = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            userId: data.userId || "",
            storeId: data.storeId || "", // storeIdを追加
            nickname: data.nickname,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            type: data.type || "user",
            subject: data.subject,
            isCompleted: data.isCompleted || false,
            status: data.status as ShiftStatus,
            duration: data.duration?.toString() || "0",
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            requestedChanges: data.requestedChanges?.map((change: any) => ({
              startTime: change.startTime,
              endTime: change.endTime,
              date: data.date,
              type: data.type || "user",
              subject: data.subject,
            })),
            classes: Array.isArray(data.classes) ? data.classes : [],
            extendedTasks: Array.isArray(data.extendedTasks)
              ? data.extendedTasks
              : [],
          } as ShiftItem;
        })
        // 追加の安全チェック: storeIdが一致することを再確認
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
        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        const shiftsRef = collection(db, "shifts");

        // storeIdと日付範囲の両方でクエリ
        const q = query(
          shiftsRef,
          where("storeId", "==", storeId),
          where("date", ">=", startDateStr),
          where("date", "<=", endDateStr)
        );

        const querySnapshot = await getDocs(q);


        // 既にFirestoreクエリでフィルタリング済みなので、追加のJavaScriptフィルタリングは不要
        const shiftsData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId || "",
              storeId: data.storeId || "", // storeIdを追加
              nickname: data.nickname,
              date: data.date,
              startTime: data.startTime,
              endTime: data.endTime,
              type: data.type || "user",
              subject: data.subject,
              isCompleted: data.isCompleted || false,
              status: data.status as ShiftStatus,
              duration: data.duration?.toString() || "0",
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              requestedChanges: data.requestedChanges?.map((change: any) => ({
                startTime: change.startTime,
                endTime: change.endTime,
                date: data.date,
                subject: data.subject,
              })),
              classes: Array.isArray(data.classes) ? data.classes : [],
              extendedTasks: Array.isArray(data.extendedTasks)
                ? data.extendedTasks
                : [],
            } as ShiftItem;
          })
          // 追加の安全チェック: storeIdが一致することを再確認
          .filter((shift) => shift.storeId === storeId)
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
