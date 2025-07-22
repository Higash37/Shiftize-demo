import { useState, useEffect, useCallback } from "react";
import {
  getShifts,
  addShift,
  updateShift,
  approveShiftChanges,
  getUserAccessibleShifts,
} from "@/services/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { useAuth } from "@/services/auth/useAuth";
import {
  Shift,
  ShiftItem,
  ShiftStatus,
} from "@/common/common-models/ModelIndex";

export const useShift = (storeId?: string) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, role } = useAuth();

  const fetchShifts = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      let allShifts: Shift[] = [];

      if (role === "master") {
        // 教室長の場合：指定されたstoreIdまたは自分のstoreIdのシフトを取得
        allShifts = await getShifts(storeId || user?.storeId);
      } else {
        // 講師の場合：連携店舗も含む全てのアクセス可能なシフトを取得
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // 連携店舗も含むシフトを取得
          allShifts = await getUserAccessibleShifts({
            storeId: userData.storeId,
            connectedStores: userData.connectedStores || [],
          });
        } else {
          // ユーザーデータが見つからない場合は従来の方法
          allShifts = await getShifts(storeId || user?.storeId);
        }
      }

      const filteredShifts =
        role === "master"
          ? allShifts
          : allShifts.filter((shift: Shift) => shift.userId === user?.uid);

      setShifts(filteredShifts);
    } catch (error) {
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.storeId, role, storeId]); // 必要な依存関係のみ

  // ユーザー情報やroleが変更された時にデータを再取得
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = async (shiftData: Omit<Shift, "id">) => {
    try {
      // storeIdが指定されていない場合はユーザーのstoreIdを使用
      const shiftWithStoreId = {
        ...shiftData,
        storeId: shiftData.storeId || user?.storeId || "",
      };

      await addShift(shiftWithStoreId);
      await fetchShifts(); // データを即時更新
    } catch (error) {
      throw error;
    }
  };

  const editShift = async (shiftId: string, shiftData: Partial<Shift>) => {
    try {
      const updatedData: Partial<Shift> = {
        ...shiftData,
        status: "draft", // 型を明示的にキャスト
        requestedChanges: [
          {
            startTime: shiftData.startTime || "", // 空文字列でデフォルト値を設定
            endTime: shiftData.endTime || "", // 空文字列でデフォルト値を設定
            status: "draft",
            requestedAt: new Date(),
          },
        ],
      };
      await updateShift(shiftId, updatedData);
      await fetchShifts(); // データを即時更新
    } catch (error) {
      throw error;
    }
  };

  const markShiftAsDeleted = async (shiftId: string) => {
    try {
      await updateShift(shiftId, { status: "deleted" });
      await fetchShifts();
    } catch (error) {
      throw error;
    }
  };

  const approveShift = async (shiftId: string) => {
    try {
      await approveShiftChanges(shiftId); // マスターが承認する関数を呼び出し
      await fetchShifts(); // データを即時更新
    } catch (error) {
      throw error;
    }
  };

  const updateShiftStatus = async (shiftId: string, status: ShiftStatus) => {
    try {
      await updateShift(shiftId, { status });
      await fetchShifts(); // データを即時更新
    } catch (error) {
      throw error;
    }
  };

  return {
    shifts,
    loading,
    fetchShifts,
    createShift,
    editShift,
    markShiftAsDeleted,
    approveShift,
    updateShiftStatus,
  };
};

export type { Shift };
