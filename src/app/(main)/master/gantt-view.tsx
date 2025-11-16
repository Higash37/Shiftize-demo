import React from "react";
import { ShiftData } from "@/modules/master-view/ganttView/gantt-modals/ShiftModal";
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
import { GanttViewView } from "@/modules/master-view/ganttView/GanttViewView";

export default function GanttViewScreen() {
  const { user } = useAuth();
  const { shifts, fetchShiftsByMonth } = useShiftsRealtime(user?.storeId);
  const { users } = useUsers(user?.storeId);

  const [currentYearMonth, setCurrentYearMonth] = React.useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

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

  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    // リアルタイムリスナーで自動更新されるため、明示的なfetch不要
    fetchShiftsByMonth(year, month);
  };

  const handleShiftUpdate = async () => {
    // リアルタイムリスナーで自動更新されるため、何もしない
    // コールバックの互換性のため関数は残す
  };

  const handleShiftPress = (shift: ShiftData) => {
    void shift;
  };

  return (
    <GanttViewView
      shifts={shifts}
      users={users.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        color: user.color || '#000000',
      }))}
      days={days}
      currentYearMonth={currentYearMonth}
      onMonthChange={handleMonthChange}
      onShiftUpdate={handleShiftUpdate}
      onShiftPress={handleShiftPress}
    />
  );
}
