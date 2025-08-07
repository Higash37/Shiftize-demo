import { HOLIDAYS } from "@/modules/child-components/calendar/calendar-constants/constants";

/**
 * 日曜日かどうかを判定
 */
export const isSunday = (date: string): boolean => {
  return new Date(date).getDay() === 0;
};

/**
 * 祝日かどうかを判定
 */
export const isHoliday = (date: string): boolean => {
  return Boolean(HOLIDAYS[date]);
};

/**
 * 日曜日または祝日かどうかを判定
 */
export const isSundayOrHoliday = (date: string): boolean => {
  return isSunday(date) || isHoliday(date);
};

/**
 * 日付の背景色を取得（ガントチャート用）
 */
export const getDateBackgroundColor = (date: string): string => {
  if (isSundayOrHoliday(date)) {
    return "rgba(0, 0, 0, 0.05)"; // 薄いグレー
  }
  return "transparent";
};

/**
 * 日付の文字色を取得（日曜日・祝日は赤色）
 */
export const getDateTextColor = (date: string): string => {
  if (isSundayOrHoliday(date)) {
    return "#ff0000"; // 赤色
  }
  return "#000000"; // デフォルトカラー（黒色）
};