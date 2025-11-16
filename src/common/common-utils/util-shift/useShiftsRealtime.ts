import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";

/**
 * FirestoreドキュメントからShiftItemに変換するヘルパー関数
 */
const mapDocToShiftItem = (doc: {
  id: string;
  data: () => DocumentData;
}): ShiftItem => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data["userId"] || "",
    storeId: data["storeId"] || "",
    nickname: data["nickname"],
    date: data["date"],
    startTime: data["startTime"],
    endTime: data["endTime"],
    type: data["type"] || "user",
    subject: data["subject"],
    isCompleted: data["isCompleted"] || false,
    status: data["status"] as ShiftStatus,
    duration: data["duration"]?.toString() || "0",
    createdAt: data["createdAt"]?.toDate() || new Date(),
    updatedAt: data["updatedAt"]?.toDate() || new Date(),
    requestedChanges: data["requestedChanges"]?.map((change: unknown) => {
      const c = change as { startTime?: string; endTime?: string };
      return {
        startTime: c.startTime || "",
        endTime: c.endTime || "",
        date: data["date"],
        subject: data["subject"],
      };
    }),
    classes: Array.isArray(data["classes"]) ? data["classes"] : [],
    extendedTasks: Array.isArray(data["extendedTasks"])
      ? data["extendedTasks"]
      : [],
  } as ShiftItem;
};

export const useShiftsRealtime = (storeId?: string) => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 月指定でのシフト取得（リアルタイム）
  const fetchShiftsByMonth = useCallback(
    (year: number, month: number): Unsubscribe | null => {
      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const endDate = `${year}-${String(month + 1).padStart(2, "0")}-31`;

        const shiftsRef = collection(db, "shifts");
        const q = query(
          shiftsRef,
          where("storeId", "==", storeId),
          where("date", ">=", startDate),
          where("date", "<=", endDate)
        );

        // リアルタイムリスナーを設定
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const shiftsData = querySnapshot.docs
              .map((doc) => mapDocToShiftItem(doc))
              .filter((shift) => shift.storeId === storeId)
              .sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare === 0) {
                  return a.startTime.localeCompare(b.startTime);
                }
                return dateCompare;
              });

            setShifts(shiftsData);
            setLoading(false);
          },
          (err) => {
            // ⚠️ リアルタイム更新エラー: 認証エラーの場合は無視（ログアウト時の正常な動作）
            if (err.code === "permission-denied") {
              setShifts([]);
              setLoading(false);
              return;
            }
            // その他のエラー（ネットワークエラーなど）は記録
            if (__DEV__) {
              console.error("Firestore realtime error:", err);
            }
            setError(err as Error);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err) {
        // ⚠️ シフト取得エラー: Firestore接続エラー、クエリ構築エラー、または権限エラーの可能性があります
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

    const shiftsRef = collection(db, "shifts");
    const q = query(shiftsRef, where("storeId", "==", storeId));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const shiftsData = querySnapshot.docs
          .map((doc) => mapDocToShiftItem(doc))
          .filter((shift) => shift.storeId === storeId)
          .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare === 0) {
              return a.startTime.localeCompare(b.startTime);
            }
            return dateCompare;
          });

        setShifts(shiftsData);
        setLoading(false);
      },
      (err) => {
        // ⚠️ リアルタイム更新エラー: ネットワークエラー、権限エラー、またはデータ形式エラーの可能性があります
        if (__DEV__) {
          console.error("Firestore realtime error:", err);
        }
        setError(err as Error);
        setLoading(false);
      }
    );

    // コンポーネントのアンマウント時にリスナーを解除
    return () => unsubscribe();
  }, [storeId]);

  return {
    shifts,
    loading,
    error,
    fetchShiftsByMonth,
  };
};
