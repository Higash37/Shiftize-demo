/**
 * 給与計算用ユーティリティ
 */

/**
 * 時間文字列（HH:mm）から分数に変換する
 */
export const timeStringToMinutes = (timeString: string): number => {
  const [hoursStr, minutesStr] = timeString.split(":");
  const hours = hoursStr ? Number(hoursStr) : 0;
  const minutes = minutesStr ? Number(minutesStr) : 0;
  
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error("Invalid time format");
  }
  
  return hours * 60 + minutes;
};

/**
 * 分数から時間文字列（HH:mm）に変換する
 */
export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * 2つの時間（HH:mm形式）の間の分数を計算する
 */
export const calculateMinutesBetween = (
  startTime: string,
  endTime: string
): number => {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);

  // 終了時間が開始時間より前の場合（例：開始23:00、終了01:00）は翌日とみなす
  if (endMinutes < startMinutes) {
    return 24 * 60 - startMinutes + endMinutes;
  }

  return endMinutes - startMinutes;
};

/**
 * 時給と労働時間（分）から給与を計算する
 */
export const calculateWage = (hourlyWage: number, minutes: number): number => {
  return hourlyWage * (minutes / 60);
};

/**
 * シフト情報から給与を計算する
 */
export const calculateShiftWage = (
  shift: { startTime: string; endTime: string },
  hourlyWage: number = 1100
): { minutes: number; wage: number } => {
  const minutes = calculateMinutesBetween(shift.startTime, shift.endTime);
  const wage = calculateWage(hourlyWage, minutes);

  return {
    minutes,
    wage,
  };
};

/**
 * 2つの時間範囲が重複しているかを判定する
 */
export const isTimeOverlapping = (
  range1Start: string,
  range1End: string,
  range2Start: string,
  range2End: string
): boolean => {
  const r1Start = timeStringToMinutes(range1Start);
  const r1End = timeStringToMinutes(range1End);
  const r2Start = timeStringToMinutes(range2Start);
  const r2End = timeStringToMinutes(range2End);

  // 終了時間が開始時間より前の場合（日をまたぐ場合）の調整
  const r1EndAdjusted = r1End < r1Start ? r1End + 24 * 60 : r1End;
  const r2EndAdjusted = r2End < r2Start ? r2End + 24 * 60 : r2End;

  // 範囲の重複判定
  return (
    (r1Start <= r2Start && r2Start < r1EndAdjusted) ||
    (r2Start <= r1Start && r1Start < r2EndAdjusted)
  );
};

/**
 * 重複時間を計算する
 */
export const calculateOverlapMinutes = (
  range1Start: string,
  range1End: string,
  range2Start: string,
  range2End: string
): number => {
  const r1Start = timeStringToMinutes(range1Start);
  const r1End = timeStringToMinutes(range1End);
  const r2Start = timeStringToMinutes(range2Start);
  const r2End = timeStringToMinutes(range2End);

  // 終了時間が開始時間より前の場合（日をまたぐ場合）の調整
  const r1EndAdjusted = r1End < r1Start ? r1End + 24 * 60 : r1End;
  const r2EndAdjusted = r2End < r2Start ? r2End + 24 * 60 : r2End;

  // 重複していない場合は0を返す
  if (r1EndAdjusted <= r2Start || r2EndAdjusted <= r1Start) {
    return 0;
  }

  // 重複部分の開始と終了
  const overlapStart = Math.max(r1Start, r2Start);
  const overlapEnd = Math.min(r1EndAdjusted, r2EndAdjusted);

  return overlapEnd - overlapStart;
};

/**
 * シフト時間から授業時間を除外した実労働時間を計算する
 */
export const calculateWorkMinutesExcludingClasses = (
  shift: { startTime: string; endTime: string },
  classes: Array<{ startTime: string; endTime: string }> = []
): number => {
  // シフト時間の合計（分）
  const totalShiftMinutes = calculateMinutesBetween(
    shift.startTime,
    shift.endTime
  );

  // 授業がない場合はシフト時間をそのまま返す
  if (!classes || classes.length === 0) {
    return totalShiftMinutes;
  }

  // 各授業時間との重複分を計算して除外
  let totalOverlapMinutes = 0;

  classes.forEach((classTime) => {
    // 授業時間がシフト時間と重複しているか確認
    if (
      isTimeOverlapping(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      )
    ) {
      // 重複時間を計算して合計に加算
      const overlapMinutes = calculateOverlapMinutes(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      );
      totalOverlapMinutes += overlapMinutes;
    }
  });

  // シフト時間から重複時間を引いた分数を返す
  return totalShiftMinutes - totalOverlapMinutes;
};

/**
 * シフト情報と授業時間から給与を計算する（授業時間がある場合はそれらを除外）
 */
export const calculateTotalWage = (
  shift: {
    startTime: string;
    endTime: string;
    classes?: Array<{ startTime: string; endTime: string }>;
  },
  hourlyWage: number = 1100
): {
  totalMinutes: number;
  totalWage: number;
  details: { type: string; minutes: number; wage: number }[];
} => {
  // 授業時間を除外した実労働時間を計算
  const workMinutes = calculateWorkMinutesExcludingClasses(
    shift,
    shift.classes || []
  );
  const workWage = calculateWage(hourlyWage, workMinutes);

  // シフト全体の時間（参考値）
  const shiftMinutes = calculateMinutesBetween(shift.startTime, shift.endTime);

  const details = [
    {
      type: "シフト（授業除外後）",
      minutes: workMinutes,
      wage: workWage,
    },
  ];

  // 授業時間がある場合、その詳細も追加（参考情報として）
  if (shift.classes && shift.classes.length > 0) {
    let totalClassMinutes = 0;

    shift.classes.forEach((classTime) => {
      // シフト時間内に収まる授業時間のみを考慮
      if (
        isTimeOverlapping(
          shift.startTime,
          shift.endTime,
          classTime.startTime,
          classTime.endTime
        )
      ) {
        const classMinutes = calculateOverlapMinutes(
          shift.startTime,
          shift.endTime,
          classTime.startTime,
          classTime.endTime
        );
        totalClassMinutes += classMinutes;

        details.push({
          type: "授業（除外）",
          minutes: classMinutes,
          wage: 0, // 授業時間は給与計算に含めない
        });
      }
    });
  }

  return {
    totalMinutes: workMinutes,
    totalWage: workWage,
    details,
  };
};
