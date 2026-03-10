/**
 * @file master/shifts/this-month.tsx
 * @description 当月シフト画面。デバイスサイズに応じてUIを切り替える。
 *
 * 【レスポンシブ対応】
 * - スマホ（幅 < 768px）: MasterShiftListView（カレンダー + リスト形式）
 * - タブレット/PC（幅 >= 768px）: GanttViewView（ガントチャート形式）
 *
 * useWindowDimensions: React Native の画面サイズ取得フック。
 * ウィンドウリサイズ時に自動で再レンダリングされる。
 *
 * 当月を初期表示にしている。翌月の編集は next-month.tsx で行う。
 */

import React, { useMemo } from "react";
// useWindowDimensions: 現在のウィンドウサイズを取得するフック
import { useWindowDimensions } from "react-native";
// MasterShiftListView: スマホ向けのカレンダー+リスト表示
import { MasterShiftListView } from "@/modules/master-view/master-shift-list/MasterShiftListView";
import { ShiftData } from "@/modules/master-view/ganttView/gantt-modals/ShiftModal";
// useShiftsByMonth: 指定月のシフトをリアルタイムで取得
import { useShiftsByMonth } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
// GanttViewView: タブレット/PC向けのガントチャート表示
import { GanttViewView } from "@/modules/master-view/ganttView/GanttViewView";

// 当月の年月を定数として初期化
const THIS_MONTH = new Date();
const INITIAL_YEAR = THIS_MONTH.getFullYear();
const INITIAL_MONTH = THIS_MONTH.getMonth();  // 0始まり

/**
 * MasterThisMonthShiftScreen: 当月シフト画面。
 */
export default function MasterThisMonthShiftScreen() {
  // useWindowDimensions: { width, height } を返す
  const { width } = useWindowDimensions();
  // 768px未満をスマホとして判定
  const isMobile = width < 768;

  const { user } = useAuth();
  const [currentYearMonth, setCurrentYearMonth] = React.useState({
    year: INITIAL_YEAR,
    month: INITIAL_MONTH,
  });

  const { shifts, changeMonth, refetch } = useShiftsByMonth(
    user?.storeId,
    currentYearMonth.year,
    currentYearMonth.month
  );
  const { users } = useUsers(user?.storeId);

  // useMemo で日付配列をメモ化
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
    await refetch();
  };

  const handleShiftPress = (shift: ShiftData) => {
    void shift;
  };

  // --- レスポンシブ分岐 ---

  // スマホ用: カレンダー + リスト表示
  if (isMobile) {
    // targetMonth="this" で当月のシフトを表示
    return <MasterShiftListView targetMonth="this" />;
  }

  // iPad以上: ガントチャート表示
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
