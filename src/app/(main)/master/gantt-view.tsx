import React from "react";
import { ShiftData } from "@/modules/master-view/ganttView/components/ShiftModal";
import { useShifts } from "@/common/common-utils/util-shift/useShiftQueries";
import { useUsers } from "@/modules/child-components/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
import { GanttViewView } from "@/modules/master-view/ganttView/GanttViewView";

export default function GanttViewScreen() {
  const { user } = useAuth();
  const { shifts, fetchShiftsByMonth } = useShifts(user?.storeId);
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
    await fetchShiftsByMonth(year, month);
  };

  const handleShiftUpdate = async () => {
    await fetchShiftsByMonth(currentYearMonth.year, currentYearMonth.month);
  };

  const handleShiftPress = (shift: ShiftData) => {};

  return (
    <GanttViewView
      shifts={shifts}
      users={users.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        color: user.color,
      }))}
      days={days}
      currentYearMonth={currentYearMonth}
      onMonthChange={handleMonthChange}
      onShiftUpdate={handleShiftUpdate}
      onShiftPress={handleShiftPress}
    />
  );
}
