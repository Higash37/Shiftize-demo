import { useState, useEffect, useCallback } from "react";
// 🔄 API移行テスト: 新しいAPIサービスを使用
import { ShiftAPIService } from "@/services/api";
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
  const shiftActor = user
    ? {
        userId: user.uid,
        nickname: user.nickname || "������",
        role: (role === "master" ? "master" : "teacher") as "master" | "teacher"
      }
    : null;

  const fetchShifts = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 🔄 デバッグ情報表示
      const debugInfo = ShiftAPIService.getDebugInfo();

      let allShifts: Shift[] = [];

      if (role === "master") {
        // 教室長の場合：指定されたstoreIdまたは自分のstoreIdのシフトを取得
        // 🔄 新APIサービス使用
        const targetStoreId = storeId || user?.storeId;
        if (!targetStoreId) {
          throw new Error("Store ID is required");
        }
        allShifts = await ShiftAPIService.getShifts({ 
          storeId: targetStoreId 
        });
      } else {
        // 講師の場合：連携店舗も含む全てのアクセス可能なシフトを取得
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // 連携店舗も含むシフトを取得
          // 🔄 新APIサービス使用
          allShifts = await ShiftAPIService.getUserAccessibleShifts({
            storeId: userData['storeId'],
            connectedStores: userData['connectedStores'] || [],
          });
        } else {
          // ユーザーデータが見つからない場合は従来の方法
          // 🔄 新APIサービス使用
          const targetStoreId = storeId || user?.storeId;
          if (!targetStoreId) {
            throw new Error("Store ID is required for shift access");
          }
          allShifts = await ShiftAPIService.getShifts({ 
            storeId: targetStoreId 
          });
        }
      }

      const filteredShifts =
        role === "master"
          ? allShifts
          : allShifts.filter((shift: Shift) => shift.userId === user?.uid);

      setShifts(filteredShifts);
    } catch (error: any) {
      setError(error.message || 'シフトの取得に失敗しました');
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

      // 🔄 新APIサービス使用
      // 型変換: ShiftAPIServiceは内部でShiftServiceを呼び出すため、
      // 元のShift型をそのまま渡せる
      await ShiftAPIService.createShift(shiftWithStoreId as any, shiftActor || undefined);
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
      // 🔄 新APIサービス使用
      await ShiftAPIService.updateShift(shiftId, updatedData, shiftActor || undefined);
      await fetchShifts(); // データを即時更新
    } catch (error) {
      throw error;
    }
  };

  const markShiftAsDeleted = async (shiftId: string, reason?: string) => {
    try {
      // 🔄 新APIサービス使用（通知付き削除）
      const deletedBy = user ? { nickname: user.nickname, userId: user.uid } : undefined;
      await ShiftAPIService.deleteShift(shiftId, deletedBy, reason, shiftActor || undefined);
      await fetchShifts();
    } catch (error) {
      throw error;
    }
  };

  const approveShift = async (shiftId: string) => {
    try {
      // 🔄 新APIサービス使用
      await ShiftAPIService.approveShiftChanges(shiftId, shiftActor || undefined); // マスターが承認する関数を呼び出し
      await fetchShifts(); // データを即時更新
    } catch (error) {
      throw error;
    }
  };

  const updateShiftStatus = async (shiftId: string, status: ShiftStatus) => {
    try {
      // 🔄 新APIサービス使用
      await ShiftAPIService.updateShift(shiftId, { status }, shiftActor || undefined);
      await fetchShifts(); // データを即時更新
    } catch (error) {
      throw error;
    }
  };

  return {
    shifts,
    loading,
    error, // 🔄 エラー状態を追加
    fetchShifts,
    createShift,
    editShift,
    markShiftAsDeleted,
    approveShift,
    updateShiftStatus,
    // 🔄 デバッグ用情報も追加
    debugInfo: ShiftAPIService.getDebugInfo(),
  };
};

export type { Shift };
