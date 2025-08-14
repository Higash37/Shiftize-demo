import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";

// 9:00～22:00の30分刻みの時間ラベル
const allTimes: string[] = [];
for (let h = 9; h <= 22; h++) {
  allTimes.push(`${h}:00`);
  if (h !== 22) allTimes.push(`${h}:30`);
}

export function useHomeGanttState() {
  const { user } = useAuth();
  const { shifts, loading: _loading, fetchShiftsByMonth } = useShiftsRealtime(user?.storeId); // リアルタイムリスナーにより実質不要
  const { users } = useUsers();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFirst, setShowFirst] = useState(false); // デフォルトで後半を表示
  const [modalUser, setModalUser] = useState<string | null>(null);
  const [currentYearMonth, setCurrentYearMonth] = useState(() => ({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  }));

  useEffect(() => {
    // リアルタイムリスナーで自動更新されるため、明示的なfetch不要
    fetchShiftsByMonth(currentYearMonth.year, currentYearMonth.month);
  }, [currentYearMonth.year, currentYearMonth.month, fetchShiftsByMonth]);

  useEffect(() => {
    setCurrentYearMonth({
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
    });
  }, [selectedDate]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const pad = (n: number) => n.toString().padStart(2, "0");
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
          (s) => start >= s.startTime && start < s.endTime
        );
        let classSlot = null;
        for (const s of classShifts) {
          if (s.classes) {
            for (const c of s.classes) {
              if (start >= c.startTime && start < c.endTime) {
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
            color: "#1976d2",
            type: staff.type || "user",
            textColor: "#fff",
          });
        }
      }
      return { position: name, slots };
    });
  }

  const mid = Math.ceil(allTimes.length / 2);
  const timesFirst = allTimes.slice(0, mid);
  const timesSecond = allTimes.slice(mid - 1);

  const hasSlotInTimes = (name: string, times: string[]) =>
    buildScheduleColumns([name])[0].slots.some((s) =>
      times.some((t) => t >= s.start && t < s.end && s.task)
    );
  const filteredNamesFirst = allNames.filter((name) =>
    hasSlotInTimes(name, timesFirst)
  );
  const filteredNamesSecond = allNames.filter((name) =>
    hasSlotInTimes(name, timesSecond)
  );
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
    showFirst,
    setShowFirst,
    modalUser,
    setModalUser,
    timesFirst,
    timesSecond,
    filteredNamesFirst,
    filteredNamesSecond,
    scheduleForSelectedDate,
    CELL_WIDTH: Math.max(
      36,
      Math.min(
        50,
        Math.floor(
          (typeof window !== "undefined" ? window.innerWidth : 360) /
            (allTimes.length + 1)
        )
      )
    ),
    isTablet:
      typeof window !== "undefined" &&
      window.innerWidth >= 768 &&
      window.innerWidth <= 1024,
    isWide: typeof window !== "undefined" && window.innerWidth >= 768,
    // loading: リアルタイムリスナーにより不要
  };
}
