import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftItem } from "@/common/common-models/ModelIndex";

export interface UserShiftData {
  userId: string;
  nickname: string;
  shifts: Array<{
    date: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    extendedTasks?: boolean;
  }>;
}

export const getUserShiftData = (
  shifts: ShiftItem[],
  users: Array<{ uid: string; nickname: string; color?: string }>,
  selectedUsers: string[],
  selectedDate: Date
): UserShiftData[] => {
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();

  const monthlyShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date);
    return (
      shift.status !== "deleted" &&
      shift.status !== "rejected" &&
      shiftDate.getFullYear() === selectedYear &&
      shiftDate.getMonth() === selectedMonth
    );
  });

  const shiftsByUser = monthlyShifts.reduce((acc, shift) => {
    if (!acc[shift.userId]) {
      acc[shift.userId] = [];
    }
    acc[shift.userId].push(shift);
    return acc;
  }, {} as Record<string, ShiftItem[]>);

  const userFilter = (user: { uid: string }) =>
    (selectedUsers.length === 0 || selectedUsers.includes(user.uid)) &&
    shiftsByUser[user.uid];

  return users
    .filter(userFilter)
    .map((user) => {
      const userShifts = shiftsByUser[user.uid]
        .map((shift) => {
          const shiftDate = new Date(shift.date);
          return {
            date: format(shiftDate, "M月d日", { locale: ja }),
            dayOfWeek: format(shiftDate, "E", { locale: ja }),
            startTime: shift.startTime,
            endTime: shift.endTime,
            extendedTasks: shift.extendedTasks,
          };
        })
        .sort((a, b) => {
          const parseDate = (dateStr: string) => {
            const match = dateStr.match(/(\d+)月(\d+)日/);
            if (match) {
              const month = parseInt(match[1], 10);
              const day = parseInt(match[2], 10);
              return month * 100 + day;
            }
            return 0;
          };
          return parseDate(a.date) - parseDate(b.date);
        });

      return {
        userId: user.uid,
        nickname: user.nickname,
        shifts: userShifts,
      };
    })
    .sort((a, b) => a.nickname.localeCompare(b.nickname, "ja"));
};

export const calculateTotalHours = (shifts: UserShiftData["shifts"]): number => {
  return shifts.reduce((total, shift) => {
    const [startHour, startMin] = shift.startTime.split(":").map(Number);
    const [endHour, endMin] = shift.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = (endMinutes - startMinutes) / 60;
    return total + duration;
  }, 0);
};

export const formatHours = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) {
    return `${wholeHours}時間`;
  }
  return `${wholeHours}時間${minutes}分`;
};