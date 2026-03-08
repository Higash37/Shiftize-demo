/**
 * 給与計算用ユーティリティ
 */

/**
 * 時間文字列（HH:mm）から分数に変換する
 *
 * @param timeString - HH:mm形式の時間文字列
 * @returns 分数
 * @throws TypeError 無効な時間形式の場合
 */
export const timeStringToMinutes = (timeString: string): number => {
  const [hoursStr, minutesStr] = timeString.split(":");
  const hours = hoursStr ? Number(hoursStr) : 0;
  const minutes = minutesStr ? Number(minutesStr) : 0;

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    // ⚠️ 無効な時間形式: 時間文字列が正しいHH:mm形式でない可能性があります
    throw new TypeError("Invalid time format");
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
 *
 * ⚠️ 注意: 終了時間が開始時間より前の場合（例：開始23:00、終了01:00）は翌日とみなします
 *
 * @param startTime - 開始時間（HH:mm形式）
 * @param endTime - 終了時間（HH:mm形式）
 * @returns 分数
 * @throws TypeError 無効な時間形式の場合
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
 * 2つの時間（HH:mm形式）の間の時間数を計算する（小数第1位まで）
 */
export const calculateDurationHours = (
  startTime: string,
  endTime: string
): number => {
  const minutes = calculateMinutesBetween(startTime, endTime);
  return Math.round((minutes / 60) * 10) / 10;
};

/**
 * 時間文字列で比較するソート関数（Array.sort に直接渡せる）
 */
export const compareByStartTime = (
  a: { startTime: string },
  b: { startTime: string }
): number => {
  return a.startTime.localeCompare(b.startTime);
};

/**
 * 日付→開始時間の順で比較するソート関数（Array.sort に直接渡せる）
 */
export const compareByDateThenTime = (
  a: { date: string; startTime: string },
  b: { date: string; startTime: string }
): number => {
  const dateCompare = a.date.localeCompare(b.date);
  if (dateCompare !== 0) return dateCompare;
  return a.startTime.localeCompare(b.startTime);
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

import type { TimeSegmentType } from "@/common/common-models/model-shift/shiftTypes";

/**
 * シフト時間から途中時間（給与除外対象）を除外した実労働時間を計算する
 */
export const calculateWorkMinutesExcludingClasses = (
  shift: { startTime: string; endTime: string },
  classes: Array<{ startTime: string; endTime: string; typeId?: string }> = [],
  typesMap?: Record<string, TimeSegmentType>
): number => {
  const totalShiftMinutes = calculateMinutesBetween(
    shift.startTime,
    shift.endTime
  );

  if (!classes || classes.length === 0) {
    return totalShiftMinutes;
  }

  let totalOverlapMinutes = 0;

  for (const classTime of classes) {
    // タイプに応じて除外判定
    const segType = classTime.typeId ? typesMap?.[classTime.typeId] : undefined;
    const wageMode = segType?.wageMode ?? "exclude";

    // includeモードの場合は除外しない（通常勤務扱い）
    if (wageMode === "include") continue;

    if (
      isTimeOverlapping(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      )
    ) {
      const overlapMinutes = calculateOverlapMinutes(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      );
      totalOverlapMinutes += overlapMinutes;
    }
  }

  return totalShiftMinutes - totalOverlapMinutes;
};

/**
 * シフト情報と途中時間から給与を計算する（タイプの給与モードに応じて処理）
 */
export const calculateTotalWage = (
  shift: {
    startTime: string;
    endTime: string;
    classes?: Array<{ startTime: string; endTime: string; typeId?: string; typeName?: string }>;
  },
  hourlyWage: number = 1100,
  typesMap?: Record<string, TimeSegmentType>
): {
  totalMinutes: number;
  totalWage: number;
  details: { type: string; minutes: number; wage: number }[];
} => {
  const workMinutes = calculateWorkMinutesExcludingClasses(
    shift,
    shift.classes || [],
    typesMap
  );
  let totalWage = calculateWage(hourlyWage, workMinutes);

  const details: { type: string; minutes: number; wage: number }[] = [
    {
      type: "シフト（途中時間除外後）",
      minutes: workMinutes,
      wage: calculateWage(hourlyWage, workMinutes),
    },
  ];

  if (shift.classes && shift.classes.length > 0) {
    for (const classTime of shift.classes) {
      if (
        !isTimeOverlapping(
          shift.startTime,
          shift.endTime,
          classTime.startTime,
          classTime.endTime
        )
      ) continue;

      const segType = classTime.typeId ? typesMap?.[classTime.typeId] : undefined;
      const wageMode = segType?.wageMode ?? "exclude";
      const typeName = segType?.name || classTime.typeName || "授業";
      const classMinutes = calculateOverlapMinutes(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      );

      if (wageMode === "exclude") {
        details.push({ type: `${typeName}（除外）`, minutes: classMinutes, wage: 0 });
      } else if (wageMode === "include") {
        // 通常勤務に含まれているため詳細のみ
        details.push({ type: `${typeName}（含む）`, minutes: classMinutes, wage: calculateWage(hourlyWage, classMinutes) });
      } else if (wageMode === "custom_rate") {
        const customWage = calculateWage(segType?.customRate ?? 0, classMinutes);
        totalWage += customWage;
        details.push({ type: `${typeName}（別単価 ¥${segType?.customRate ?? 0}/時）`, minutes: classMinutes, wage: customWage });
      }
    }
  }

  return {
    totalMinutes: workMinutes,
    totalWage: Math.round(totalWage),
    details,
  };
};
