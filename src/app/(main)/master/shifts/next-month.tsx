import React, { useMemo } from "react";
import { Alert, useWindowDimensions } from "react-native";
import { MasterShiftListView } from "@/modules/master-view/master-shift-list/MasterShiftListView";
import { useShiftsByMonth } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
import { ServiceProvider } from "@/services/ServiceProvider";
import { GanttEditView } from "@/modules/master-view/ganttEdit/GanttEditView";
import { ShiftData } from "@/modules/master-view/ganttView/gantt-modals/ShiftModal";

const NEXT_MONTH = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
const INITIAL_YEAR = NEXT_MONTH.getFullYear();
const INITIAL_MONTH = NEXT_MONTH.getMonth();

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
    // リアルタイムリスナーで自動更新されるため、何もしない
  };

  const refreshPage = () => {
    // リアルタイムリスナーで自動更新されるため何もしない
  };

  const handleTimeChange = async (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    try {
      const startTimeDate = new Date(`2000-01-01T${newStartTime}`);
      const endTimeDate = new Date(`2000-01-01T${newEndTime}`);
      const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
      const durationHours =
        Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

      await ServiceProvider.shifts.updateShift(shiftId, {
        startTime: newStartTime,
        endTime: newEndTime,
        duration: durationHours,
      });
    } catch (error) {
      console.error("Failed to update shift time", error);
      Alert.alert("エラー", "シフト時間の変更に失敗しました");
    }
  };

  const handleShiftPress = (shift: ShiftData) => {
    void shift;
  };

  const handleShiftSave = async (data: ShiftData) => {
    try {
      if (data.id) {
        const startTimeDate = new Date(`2000-01-01T${data.startTime}`);
        const endTimeDate = new Date(`2000-01-01T${data.endTime}`);
        const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
        const durationHours =
          Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

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
        const targetUser = users.find((u) => u.uid === data.userId);
        const startTimeDate = new Date(`2000-01-01T${data.startTime}`);
        const endTimeDate = new Date(`2000-01-01T${data.endTime}`);
        const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
        const durationHours =
          Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

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
      console.error("Failed to save shift", error);
      Alert.alert("エラー", "シフトの保存に失敗しました");
      throw error;
    }
  };

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

  // スマホ用：カレンダー+リスト表示
  if (isMobile) {
    return <MasterShiftListView targetMonth="next" />;
  }

  // iPad以上：元のガントチャート編集画面
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



