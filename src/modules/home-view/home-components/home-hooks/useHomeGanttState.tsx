import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
import { colors } from "@/common/common-constants/ThemeConstants";

// 0:00～24:00の30分刻みの時間ラベル（ゼロパディング付き）
const allTimes: string[] = [];
const pad = (n: number) => n.toString().padStart(2, "0");
for (let h = 0; h < 24; h++) {
  allTimes.push(`${pad(h)}:00`);
  allTimes.push(`${pad(h)}:30`);
}
allTimes.push("24:00"); // 終了時刻として24:00を追加

export function useHomeGanttState() {
  const { user } = useAuth();
  const {
    shifts,
    loading: _loading,
  } = useShiftsRealtime(user?.storeId);
  const { users } = useUsers();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalUser, setModalUser] = useState<string | null>(null);
  const [currentYearMonth, setCurrentYearMonth] = useState(() => ({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  }));

  // マスター以外の場合は自分のシフト（承認済みのみ）でフィルタリング
  const filteredShifts = user?.role === "master"
    ? shifts
    : shifts.filter(
        (s) => s.userId === user?.uid && s.status === "approved"
      );

  useEffect(() => {
    setCurrentYearMonth({
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
    });
  }, [selectedDate]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const localDateStr = `${selectedDate.getFullYear()}-${pad(
    selectedDate.getMonth() + 1
  )}-${pad(selectedDate.getDate())}`;
  const shiftsForDate = shifts.filter(
    (s) =>
      (s.date === selectedDateStr || s.date === localDateStr) &&
      (s.status === "approved" || s.status === "completed") // 承認済みまたは完了のシフト
  );

  const allNames: string[] = Array.from(
    new Set(shiftsForDate.map((s) => s.nickname))
  );

  function buildScheduleColumns(names: string[]) {
    return names.map((name) => {
      const userShifts = shiftsForDate.filter((s) => s.nickname === name);
      const staffShifts = userShifts.filter(
        (s) => s.type === "user" || s.type === "staff"
      );
      const classShifts = userShifts.filter(
        (s) => s.type === "class" || (s.classes && s.classes.length > 0)
      );
      const slots: any[] = [];
      for (let i = 0; i < allTimes.length - 1; i++) {
        const start = allTimes[i];
        const end = allTimes[i + 1];
        const staff = staffShifts.find(
          (s) =>
            start &&
            s.startTime &&
            s.endTime &&
            start >= s.startTime &&
            start < s.endTime
        );
        let classSlot = null;
        for (const s of classShifts) {
          if (s.classes) {
            for (const c of s.classes) {
              if (
                start &&
                c.startTime &&
                c.endTime &&
                start >= c.startTime &&
                start < c.endTime
              ) {
                classSlot = { ...s, classTime: c };
                break;
              }
            }
          }
        }
        if (classSlot) {
          slots.push({
            name,
            start,
            end,
            task: "授業", // Textコンポーネントを文字列に変更
            date: selectedDateStr,
            color: "#888",
            type: "class",
            textColor: "black",
          });
        } else if (staff) {
          slots.push({
            name,
            start,
            end,
            task: "スタッフ", // Textコンポーネントを文字列に変更
            date: selectedDateStr,
            color: colors.primary,
            type: staff.type || "user",
            textColor: "#fff",
          });
        }
      }
      return { position: name, slots };
    });
  }

  const scheduleForSelectedDate = buildScheduleColumns(allNames).map(
    (column) => ({
      ...column,
      status: "approved", // 仮のステータスを追加
    })
  );

  return {
    selectedDate,
    setSelectedDate,
    showDatePicker,
    setShowDatePicker,
    modalUser,
    setModalUser,
    scheduleForSelectedDate,
    allTimes, // 00:00-24:00の全時間配列
    CELL_WIDTH: 100, // 固定幅
    isTablet:
      typeof window !== "undefined" &&
      window.innerWidth >= 768 &&
      window.innerWidth <= 1024,
    isWide: typeof window !== "undefined" && window.innerWidth > 1024,
    shifts: filteredShifts, // フィルタリング済みシフトデータ（カレンダーのドット表示用）
    shiftsForDate, // 選択された日付のシフトデータ（時計ウィジェット用）
    currentYearMonth, // 現在の年月
    currentUserStoreId: user?.storeId, // ユーザーの店舗ID
    // loading: リアルタイムリスナーにより不要
  };
}
