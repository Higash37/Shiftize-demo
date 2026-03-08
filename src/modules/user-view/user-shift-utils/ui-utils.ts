/**
 * シフト関連のユーティリティ関数
 */
import { SHIFT_HOURS } from "@/common/common-constants/BoundaryConstants";

/**
 * 時間オプションを生成する関数
 *
 * @param startHourInclusive - 開始時間（時、inclusive: この時刻を含む）
 * @param endHourInclusive - 終了時間（時、inclusive: この時刻を含む）
 * @param intervalMinutes - 時間間隔（分）
 * @returns 時間文字列の配列（"HH:MM"形式）
 */
export function generateTimeOptions(
  startHourInclusive: number = SHIFT_HOURS.START_HOUR_INCLUSIVE,
  endHourInclusive: number = SHIFT_HOURS.END_HOUR_INCLUSIVE,
  intervalMinutes: number = SHIFT_HOURS.TIME_INTERVAL_MINUTES
): string[] {
  const options = new Set<string>();

  for (let hour = startHourInclusive; hour <= endHourInclusive; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;
      options.add(timeString);
    }
  }

  return Array.from(options).sort();
}

/**
 * 時間文字列をDate型に変換する関数
 *
 * @param dateStr - 日付文字列（"YYYY-MM-DD" 形式）
 * @param timeStr - 時間文字列（"HH:MM" 形式）
 * @returns Date型のオブジェクト。無効な入力の場合は null を返す。
 */
export function parseTimeString(dateStr: string, timeStr: string): Date | null {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;

  const parts = timeStr.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  date.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
  return date;
}
