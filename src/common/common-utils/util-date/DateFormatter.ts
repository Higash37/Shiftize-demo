/**
 * 日付操作に関するユーティリティ関数
 */

/**
 * 日付をフォーマットする
 * @param date 日付オブジェクト
 * @returns "yyyy年MM月dd日" 形式の文字列
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * 時間をフォーマットする
 * @param date 日付オブジェクト
 * @returns "HH:mm" 形式の文字列
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * 日付文字列を Date オブジェクトに変換する
 * @param dateString "YYYY-MM-DD" 形式の日付文字列
 * @returns Date オブジェクト
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * 指定された日数後の日付を取得する
 * @param date 基準日
 * @param days 追加する日数
 * @returns 計算後の日付
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 日付の範囲を配列として取得する
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 日付オブジェクトの配列
 */
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dateArray: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateArray.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dateArray;
};

/**
 * 日付を "YYYY-MM-DD" 形式に変換する
 * @param date 日付オブジェクト
 * @returns "YYYY-MM-DD" 形式の文字列
 */
export const toISODateString = (date: Date): string => {
  const isoString = date.toISOString().split("T")[0];
  if (!isoString) {
    throw new Error("Failed to format date to ISO string");
  }
  return isoString;
};

/**
 * 曜日を日本語で取得する
 * @param date 日付オブジェクト
 * @returns 曜日（日、月、火、水、木、金、土）
 */
export const getJapaneseDayOfWeek = (date: Date): string => {
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const dayName = dayNames[date.getDay()];
  if (!dayName) {
    throw new Error("Invalid day of week");
  }
  return dayName;
};

/**
 * 月の初日を取得する
 * @param year 年
 * @param month 月（0-11）
 * @returns 月の初日
 */
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

/**
 * 月の最終日を取得する
 * @param year 年
 * @param month 月（0-11）
 * @returns 月の最終日
 */
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};
