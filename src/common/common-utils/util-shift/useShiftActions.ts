import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useAuth } from "@/services/auth/useAuth";
import { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";

export const useShift = (storeId?: string) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, role } = useAuth();
  const shiftActor =
    user && role
      ? {
          userId: user.uid,
          nickname: user.nickname || "未設定",
          role: role === "master" ? ("master" as const) : ("teacher" as const),
        }
      : null;

  const fetchShifts = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let allShifts: Shift[] = [];

      if (role === "master") {
        // 教室長の場合：指定されたstoreIdまたは自分のstoreIdのシフトを取得
        const targetStoreId = storeId || user?.storeId;
        if (!targetStoreId) {
          throw new Error("Store ID is required");
        }
        allShifts = await ServiceProvider.shifts.getShifts(targetStoreId);
      } else {
        // 講師の場合：連携店舗も含む全てのアクセス可能なシフトを取得
        const userProfile = await ServiceProvider.users.getUserFullProfile(user.uid);

        if (userProfile) {
          // 連携店舗も含むシフトを取得
          const accessParams: { storeId?: string; connectedStores?: string[] } = {
            connectedStores: userProfile.connectedStores || [],
          };
          if (userProfile.storeId) {
            accessParams.storeId = userProfile.storeId;
          }
          allShifts = await ServiceProvider.shifts.getUserAccessibleShifts(accessParams);
        } else {
          // ユーザーデータが見つからない場合は従来の方法
          const targetStoreId = storeId || user?.storeId;
          if (!targetStoreId) {
            throw new Error("Store ID is required for shift access");
          }
          allShifts = await ServiceProvider.shifts.getShifts(targetStoreId);
        }
      }

      const filteredShifts =
        role === "master"
          ? allShifts
          : allShifts.filter((shift: Shift) => shift.userId === user?.uid);

      setShifts(filteredShifts);
    } catch (err) {
      // ⚠️ シフト取得エラー: API接続エラー、権限エラー、またはデータ形式エラーの可能性があります
      const errorMessage =
        err instanceof Error ? err.message : "シフトの取得に失敗しました";
      setError(errorMessage);
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

      await ServiceProvider.shifts.addShift(
        shiftWithStoreId,
        shiftActor || undefined
      );
      await fetchShifts(); // データを即時更新
    } catch (err) {
      // ⚠️ シフト作成エラー: API接続エラー、バリデーションエラー、または権限エラーの可能性があります
      if (__DEV__) {
        console.error("シフト作成エラー:", err);
      }
      throw err;
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
      await ServiceProvider.shifts.updateShift(
        shiftId,
        updatedData,
        shiftActor || undefined
      );
      await fetchShifts(); // データを即時更新
    } catch (err) {
      // ⚠️ シフト編集エラー: API接続エラー、バリデーションエラー、または権限エラーの可能性があります
      if (__DEV__) {
        console.error("シフト編集エラー:", err);
      }
      throw err;
    }
  };

  const markShiftAsDeleted = async (shiftId: string, reason?: string) => {
    try {
      await ServiceProvider.shifts.markShiftAsDeleted(
        shiftId,
        shiftActor || undefined,
        reason
      );
      await fetchShifts();
    } catch (err) {
      // ⚠️ シフト削除エラー: API接続エラー、権限エラー、またはデータ不存在エラーの可能性があります
      if (__DEV__) {
        console.error("シフト削除エラー:", err);
      }
      throw err;
    }
  };

  const approveShift = async (shiftId: string) => {
    try {
      await ServiceProvider.shifts.approveShiftChanges(
        shiftId,
        shiftActor || undefined
      );
      await fetchShifts(); // データを即時更新
    } catch (err) {
      // ⚠️ シフト承認エラー: API接続エラー、権限エラー、またはデータ不存在エラーの可能性があります
      if (__DEV__) {
        console.error("シフト承認エラー:", err);
      }
      throw err;
    }
  };

  const updateShiftStatus = async (shiftId: string, status: ShiftStatus) => {
    try {
      await ServiceProvider.shifts.updateShift(
        shiftId,
        { status },
        shiftActor || undefined
      );
      await fetchShifts(); // データを即時更新
    } catch (err) {
      // ⚠️ シフトステータス更新エラー: API接続エラー、バリデーションエラー、または権限エラーの可能性があります
      if (__DEV__) {
        console.error("シフトステータス更新エラー:", err);
      }
      throw err;
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
    debugInfo: { service: "ServiceProvider.shifts" },
  };
};

export type { Shift } from "@/common/common-models/ModelIndex";
