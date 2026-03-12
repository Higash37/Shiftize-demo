/**
 * @file master/shifts/next-month.tsx
 * @description 翌月シフト編集画面。デバイスサイズに応じてUIを切り替える。
 *
 * 【this-month.tsx との違い】
 * - this-month.tsx: 当月のシフトを閲覧（GanttViewView = 閲覧専用）
 * - next-month.tsx: ★このファイル。翌月のシフトを編集（GanttEditView = 編集可能）
 *
 * 翌月のシフトを事前に編集・承認するための画面。
 * スマホではカレンダー+リスト、タブレット/PCではガントチャート編集UIを表示する。
 */

import React, { useMemo } from "react";
import { Alert, useWindowDimensions } from "react-native";
import { MasterShiftListView } from "@/modules/master-view/master-shift-list/MasterShiftListView";
import { useShiftsByMonth } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
import { ServiceProvider } from "@/services/ServiceProvider";
// GanttEditView: 編集可能なガントチャートUIコンポーネント
import { GanttEditView } from "@/modules/master-view/ganttEdit/GanttEditView";
import { ShiftData } from "@/modules/master-view/ganttView/gantt-modals/ShiftModal";
import { calculateDurationHours } from "@/common/common-utils/util-shift/wageCalculator";

// 翌月の年月を定数として初期化
const NEXT_MONTH = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
const INITIAL_YEAR = NEXT_MONTH.getFullYear();
const INITIAL_MONTH = NEXT_MONTH.getMonth();

/**
 * MasterNextMonthShiftScreen: 翌月シフト編集画面。
 */
export default function MasterNextMonthShiftScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { user } = useAuth();
  const [currentYearMonth, setCurrentYearMonth] = React.useState({
    year: INITIAL_YEAR,
    month: INITIAL_MONTH,
  });

  const {
    shifts,
    changeMonth,
    refetch,
    loading: shiftsLoading,
    error: shiftsError,
  } = useShiftsByMonth(user?.storeId, currentYearMonth.year, currentYearMonth.month);
  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useUsers(user?.storeId);

  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    changeMonth(year, month);
  };

  const handleShiftUpdate = async () => {
    await refetch();
  };

  /** リアルタイムリスナーで自動更新されるためダミー関数 */
  const refreshPage = () => {};

  /**
   * handleTimeChange: ドラッグによるシフト時間変更ハンドラー。
   */
  const handleTimeChange = async (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    try {
      const durationHours = calculateDurationHours(newStartTime, newEndTime);

      await ServiceProvider.shifts.updateShift(shiftId, {
        startTime: newStartTime,
        endTime: newEndTime,
        duration: durationHours,
      });
    } catch (error) {
      Alert.alert("エラー", "シフト時間の変更に失敗しました");
    }
  };

  const handleShiftPress = (shift: ShiftData) => {
    void shift;
  };

  /**
   * handleShiftSave: シフトの保存（新規作成 or 更新）ハンドラー。
   * gantt-edit.tsx の handleShiftSave と同じロジック。
   */
  const handleShiftSave = async (data: ShiftData) => {
    try {
      if (data.id) {
        // 既存シフトの更新
        const durationHours = calculateDurationHours(data.startTime, data.endTime);

        await ServiceProvider.shifts.updateShift(data.id, {
          userId: data.userId,
          storeId: user?.storeId || "",
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: "user",
          subject: data.subject || "",
          isCompleted: false,
          duration: durationHours,
          status: data.status || "approved",
          classes: data.classes || [],
        });
      } else {
        // 新規シフトの作成
        const targetUser = users.find((u) => u.uid === data.userId);
        const durationHours = calculateDurationHours(data.startTime, data.endTime);

        await ServiceProvider.shifts.addShift({
          userId: data.userId,
          storeId: user?.storeId || "",
          nickname: targetUser?.nickname || "",
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: "user",
          subject: data.subject || "",
          isCompleted: false,
          status: "approved",
          duration: durationHours,
          classes: data.classes || [],
        });
      }
    } catch (error) {
      Alert.alert("エラー", "シフトの保存に失敗しました");
      throw error;
    }
  };

  /**
   * handleShiftDelete: シフトの論理削除ハンドラー。
   */
  const handleShiftDelete = async (shiftId: string) => {
    try {
      await ServiceProvider.shifts.markShiftAsDeleted(shiftId);
    } catch (error) {
      Alert.alert("エラー", "シフトの削除に失敗しました");
      throw error;
    }
  };

  const days = useMemo(() => {
    const { year, month } = currentYearMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    });
  }, [currentYearMonth]);

  // --- レスポンシブ分岐 ---

  // スマホ用: カレンダー + リスト表示
  if (isMobile) {
    // targetMonth="next" で翌月のシフトを表示
    return <MasterShiftListView targetMonth="next" />;
  }

  // iPad以上: ガントチャート編集画面
  return (
    <GanttEditView
      shifts={shifts}
      users={users.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        color: user.color || "#000000",
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
