import React, { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { MasterShiftListView } from "@/modules/master-view/master-shift-list/MasterShiftListView";
import { ShiftData } from "@/modules/master-view/ganttView/gantt-modals/ShiftModal";
import { useShiftsByMonth } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
import { GanttViewView } from "@/modules/master-view/ganttView/GanttViewView";

const THIS_MONTH = new Date();
const INITIAL_YEAR = THIS_MONTH.getFullYear();
const INITIAL_MONTH = THIS_MONTH.getMonth();

export default function MasterThisMonthShiftScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { user } = useAuth();
  const [currentYearMonth, setCurrentYearMonth] = React.useState({
    year: INITIAL_YEAR,
    month: INITIAL_MONTH,
  });

  const { shifts, changeMonth } = useShiftsByMonth(
    user?.storeId,
    currentYearMonth.year,
    currentYearMonth.month
  );
  const { users } = useUsers(user?.storeId);

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

  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    changeMonth(year, month);
  };

  const handleShiftUpdate = async () => {
    // リアルタイムリスナーで自動更新されるため、何もしない
  };

  const handleShiftPress = (shift: ShiftData) => {
    void shift;
  };

  // スマホ用：カレンダー+リスト表示
  if (isMobile) {
    return <MasterShiftListView targetMonth="this" />;
  }

  // iPad以上：元のガントチャート表示
  return (
    <GanttViewView
      shifts={shifts}
      users={users.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        color: user.color || "#000000",
      }))}
      days={days}
      currentYearMonth={currentYearMonth}
      onMonthChange={handleMonthChange}
      onShiftUpdate={handleShiftUpdate}
      onShiftPress={handleShiftPress}
    />
  );
}



