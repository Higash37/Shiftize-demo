import React from "react";
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
import {
  addShift,
  updateShift,
  markShiftAsDeleted,
} from "@/services/firebase/firebase-shift";
import { GanttEditView } from "@/modules/master-view/ganttEdit/GanttEditView";
import { ShiftData } from "@/modules/master-view/ganttView/gantt-modals/ShiftModal";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

export default function GanttEditScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    shifts,
    fetchShiftsByMonth,
    loading: shiftsLoading,
    error: shiftsError,
  } = useShiftsRealtime(user?.storeId);
  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useUsers(user?.storeId);

  const [currentYearMonth, setCurrentYearMonth] = React.useState(() => {
    const today = new Date();
    // 1ヶ月先の月を表示
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const yearMonth = {
      year: nextMonth.getFullYear(),
      month: nextMonth.getMonth(),
    };
    return yearMonth;
  });

  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    // リアルタイムリスナーで自動更新されるため、明示的なfetch不要
    fetchShiftsByMonth(year, month);
  };

  const handleShiftUpdate = async () => {
    // リアルタイムリスナーで自動更新されるため、何もしない
    // コールバックの互換性のため関数は残す
  };

  // リアルタイムリスナーで自動更新されるため、refreshPageは不要
  // 互換性のためダミー関数を用意
  const refreshPage = () => {
    // リアルタイムリスナーで自動更新されるため何もしない
  };

  // シフト時間のドラッグ変更ハンドラー
  const handleTimeChange = async (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    try {
      // 新しい時間でdurationを計算
      const startTimeDate = new Date(`2000-01-01T${newStartTime}`);
      const endTimeDate = new Date(`2000-01-01T${newEndTime}`);
      const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
      const durationHours =
        Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

      // シフトを更新
      await updateShift(shiftId, {
        startTime: newStartTime,
        endTime: newEndTime,
        duration: durationHours,
      });

      // リアルタイムリスナーで自動更新される
    } catch (error) {
      Alert.alert("エラー", "シフト時間の変更に失敗しました");
    }
  };

  const handleShiftPress = (shift: ShiftData) => {};

  const handleShiftSave = async (data: ShiftData) => {
    try {
      if (data.id) {
        // 時間の差を計算（duration）
        const startTimeDate = new Date(`2000-01-01T${data.startTime}`);
        const endTimeDate = new Date(`2000-01-01T${data.endTime}`);
        const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
        const durationHours =
          Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10; // 小数点第1位まで

        // 既存シフトの更新
        await updateShift(data.id, {
          userId: data.userId,
          storeId: user?.storeId || "", // storeIdを追加
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: "user", // typeフィールドを追加
          subject: data.subject || "",
          isCompleted: false, // isCompletedフィールドを追加
          duration: durationHours, // 計算されたdurationを設定
          status: data.status || "approved", // マスターによる編集は承認済み
          classes: data.classes || [],
          extendedTasks: data.extendedTasks || [],
        });
      } else {
        // 対象ユーザーを取得
        const targetUser = users.find((u) => u.uid === data.userId);

        // 時間の差を計算（duration）
        const startTimeDate = new Date(`2000-01-01T${data.startTime}`);
        const endTimeDate = new Date(`2000-01-01T${data.endTime}`);
        const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
        const durationHours =
          Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10; // 小数点第1位まで

        // 新規シフトの作成
        await addShift({
          userId: data.userId,
          storeId: user?.storeId || "", // 現在のユーザーのstoreIdを設定
          nickname: targetUser?.nickname || "", // 対象ユーザーのニックネームを設定
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: "user",
          subject: data.subject || "",
          isCompleted: false,
          status: "approved", // マスターによる新規作成は常に承認済み
          duration: durationHours, // 計算された時間を設定
          classes: data.classes || [],
          extendedTasks: data.extendedTasks || [],
        });
      }
      // リアルタイムリスナーで自動更新される
    } catch (error) {
      Alert.alert("エラー", "シフトの保存に失敗しました");
      throw error;
    }
  };

  const handleShiftDelete = async (shiftId: string) => {
    try {
      await markShiftAsDeleted(shiftId);
      // リアルタイムリスナーで自動更新される
    } catch (error) {
      Alert.alert("エラー", "シフトの削除に失敗しました");
      throw error;
    }
  };

  const generateDaysForMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      // ローカルタイムゾーンでの日付文字列を生成（UTCではなく）
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    });
    return days;
  };

  const days = generateDaysForMonth(
    currentYearMonth.year,
    currentYearMonth.month
  );

  return (
    <GanttEditView
      shifts={shifts}
      users={users.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        ...(user.color && { color: user.color }),
      }))}
      days={days}
      loading={shiftsLoading || usersLoading}
      error={
        (shiftsError
          ? typeof shiftsError === "string"
            ? shiftsError
            : shiftsError?.message
          : null) ||
        (usersError
          ? typeof usersError === "string"
            ? usersError
            : usersError?.message
          : null)
      }
      currentYearMonth={currentYearMonth}
      onMonthChange={handleMonthChange}
      onShiftUpdate={handleShiftUpdate}
      onShiftPress={handleShiftPress}
      onShiftSave={handleShiftSave}
      onShiftDelete={handleShiftDelete}
      onTimeChange={handleTimeChange}
      refreshPage={refreshPage}
    />
  );
}
