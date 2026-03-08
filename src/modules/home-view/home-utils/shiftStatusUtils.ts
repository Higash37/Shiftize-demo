import { colors } from "@/common/common-constants/ThemeConstants";

export interface ShiftStatusResult {
  currentStatus: string;
  statusIcon: string;
  statusColor: string;
}

const EMPTY_STATUS: ShiftStatusResult = {
  currentStatus: "",
  statusIcon: "",
  statusColor: colors.text.secondary,
};

/**
 * 選択された日付とスロット情報から、現在のシフト状態を判定する
 */
export function getShiftStatus(
  selectedDate: Date,
  staffSlots: Array<{ start: string; end: string }>,
  classSlots: Array<{ start: string; end: string }>
): ShiftStatusResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateOnly = new Date(selectedDate);
  selectedDateOnly.setHours(0, 0, 0, 0);
  if (today.getTime() !== selectedDateOnly.getTime()) return EMPTY_STATUS;
  if (staffSlots.length === 0 && classSlots.length === 0) return EMPTY_STATUS;

  const now = new Date();
  const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const allSlots = [...staffSlots, ...classSlots].sort((a, b) =>
    a.start.localeCompare(b.start)
  );
  const firstSlot = allSlots[0];
  const lastSlot = allSlots.at(-1);

  if (firstSlot && currentTimeStr < firstSlot.start) {
    // 開始まで6時間以上あれば「今日の」、それ未満なら「このあと」
    const [ch, cm] = currentTimeStr.split(":").map(Number);
    const [sh, sm] = firstSlot.start.split(":").map(Number);
    const diffMin = ((sh ?? 0) * 60 + (sm ?? 0)) - ((ch ?? 0) * 60 + (cm ?? 0));
    const prefix = diffMin >= 360 ? "今日の" : "このあと";
    return { currentStatus: `${prefix} ${firstSlot.start}~`, statusIcon: "schedule", statusColor: colors.text.secondary };
  }
  if (lastSlot && currentTimeStr >= lastSlot.end) {
    return { currentStatus: "勤務終了", statusIcon: "done", statusColor: colors.text.disabled };
  }
  if (staffSlots.some((s) => s.start <= currentTimeStr && currentTimeStr < s.end)) {
    return { currentStatus: "現在: スタッフ中", statusIcon: "work", statusColor: colors.primary };
  }
  if (classSlots.some((s) => s.start <= currentTimeStr && currentTimeStr < s.end)) {
    return { currentStatus: "現在: 途中時間中", statusIcon: "school", statusColor: colors.text.secondary };
  }
  return { currentStatus: "現在: 休憩中", statusIcon: "free-breakfast", statusColor: colors.text.disabled };
}

interface TimeSlot {
  start: string;
  end: string;
  type?: string;
}

/**
 * 連続したスタッフスロットをグループ化して、勤務時間帯を返す
 */
export function groupConsecutiveSlots(
  scheduleColumns: Array<{ slots: TimeSlot[] }>
): Array<{ startTime: string; endTime: string }> {
  const result: Array<{ startTime: string; endTime: string }> = [];

  scheduleColumns.forEach((col) => {
    const staffSlots = col.slots
      .filter((s) => s.type !== "class")
      .sort((a, b) => a.start.localeCompare(b.start));

    let currentGroup: typeof staffSlots = [];
    staffSlots.forEach((slot, index) => {
      if (currentGroup.length === 0) {
        currentGroup.push(slot);
      } else {
        const lastSlot = currentGroup.at(-1);
        if (lastSlot && lastSlot.end === slot.start) {
          currentGroup.push(slot);
        } else {
          if (currentGroup.length > 0 && currentGroup[0] && lastSlot) {
            result.push({
              startTime: currentGroup[0].start,
              endTime: lastSlot.end,
            });
          }
          currentGroup = [slot];
        }
      }

      if (index === staffSlots.length - 1 && currentGroup.length > 0) {
        const firstSlot = currentGroup[0];
        const lastSlot = currentGroup.at(-1);
        if (firstSlot && lastSlot) {
          result.push({
            startTime: firstSlot.start,
            endTime: lastSlot.end,
          });
        }
      }
    });
  });

  return result;
}
