/**
 * シフト関連のユーティリティ関数
 */

/**
 * 時間オプションを生成する関数
 *
 * @param startHour - 開始時間（時）
 * @param endHour - 終了時間（時）
 * @param interval - 時間間隔（分）
 * @returns 時間文字列の配列（"HH:MM"形式）
 */
export function generateTimeOptions(
  startHour: number = 9,
  endHour: number = 22,
  interval: number = 30
): string[] {
  const options = new Set<string>();

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
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
 * @param dateStr - 日付文字列
 * @param timeStr - 時間文字列（"HH:MM"形式）
 * @returns Date型のオブジェクト
 */
export function parseTimeString(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(dateStr);
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return date;
}
