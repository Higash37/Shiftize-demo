import React, { useEffect } from "react";
import { useShifts } from "@/common/common-utils/util-shift/useShiftQueries";
import { useUsers } from "@/modules/child-components/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
import {
  addShift,
  updateShift,
  markShiftAsDeleted,
} from "@/services/firebase/firebase-shift";
import { GanttEditView } from "@/modules/master-view/ganttEdit/GanttEditView";
import { ShiftData } from "@/modules/master-view/ganttView/components/ShiftModal";
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
  } = useShifts(user?.storeId);
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
    console.log(
      `Initial currentYearMonth (1ヶ月先):`,
      yearMonth,
      `(${yearMonth.year}年${yearMonth.month + 1}月)`
    );
    return yearMonth;
  });

  const handleMonthChange = async (year: number, month: number) => {
    console.log(`Month changed to: ${year}年${month + 1}月`);
    setCurrentYearMonth({ year, month });
    await fetchShiftsByMonth(year, month);
  };

  const handleShiftUpdate = async () => {
    await fetchShiftsByMonth(currentYearMonth.year, currentYearMonth.month);
  };

  // ページをリフレッシュする関数（スプラッシュスクリーンなし）
  const refreshPage = () => {
    // 同じページに再遷移してコンポーネントを完全に再マウント
    router.replace("/master/gantt-edit");
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

      // 時間変更後にページをリフレッシュ
      console.log("シフト時間変更完了、ページをリフレッシュ中...");
      refreshPage();
    } catch (error) {
      console.error("Time change error:", error);
      Alert.alert("エラー", "シフト時間の変更に失敗しました");
    }
  };

  const handleShiftPress = (shift: any) => {
    console.log("Shift pressed:", shift);
  };

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
      // シフト保存後にページをリフレッシュ
      console.log("シフト保存完了、ページをリフレッシュ中...");
      refreshPage();
    } catch (error) {
      console.error("Shift save error:", error);
      Alert.alert("エラー", "シフトの保存に失敗しました");
      throw error;
    }
  };

  const handleShiftDelete = async (shiftId: string) => {
    try {
      await markShiftAsDeleted(shiftId);
      // シフト削除後にページをリフレッシュ
      console.log("シフト削除完了、ページをリフレッシュ中...");
      refreshPage();
    } catch (error) {
      console.error("Shift delete error:", error);
      Alert.alert("エラー", "シフトの削除に失敗しました");
      throw error;
    }
  };

  const generateDaysForMonth = (year: number, month: number) => {
    console.log(`Generating days for: ${year}年${month + 1}月`); // デバッグ用
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      // ローカルタイムゾーンでの日付文字列を生成（UTCではなく）
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    });
    console.log(`Generated days:`, days.slice(0, 5)); // 最初の5日だけ表示
    console.log(`First day details:`, {
      year,
      month,
      firstDay: days[0],
      dateObject: new Date(year, month, 1),
      dateString: new Date(year, month, 1).toLocaleDateString(),
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
        color: user.color,
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
