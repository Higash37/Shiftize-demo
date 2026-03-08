import { Dimensions, Platform } from "react-native";
import { useMemo } from "react";

// 画面サイズを取得
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 画面幅に基づいてカレンダーのサイズを計算
export const BASE_CALENDAR_WIDTH_RATIO = 0.3; // 画面幅の30%をデフォルトに
export const CALENDAR_WIDTH = Math.min(
  SCREEN_WIDTH * BASE_CALENDAR_WIDTH_RATIO,
  500 // 最大幅を500pxに制限
);
export const DAY_WIDTH = Math.floor(CALENDAR_WIDTH / 7);
export const DAY_HEIGHT = Math.floor(DAY_WIDTH * 0.6); // 少し高さを調整

/**
 * レスポンシブサイズを取得するフック
 * 画面サイズに基づいて最適なサイズを計算
 */
export const useResponsiveCalendarSize = () => {
  return useMemo(() => {
    // 画面サイズを再取得（画面回転などに対応）
    const { width } = Dimensions.get("window"); // 画面サイズに基づいて適切な値を計算
    const isSmallScreen = width < 768;

    // 全体的なサイズ縮小率（小さな画面ではさらに縮小）
    const scaleFactor = isSmallScreen ? 0.95 : 0.95;

    const calendarWidth = isSmallScreen
      ? width * 0.95 * scaleFactor // 小さい画面では80%幅に縮小
      : Math.min(width * BASE_CALENDAR_WIDTH_RATIO * scaleFactor, 430); // 最大幅も縮小

    const dayWidth = Math.floor(calendarWidth / 7);
    const dayHeight = Math.floor(dayWidth * (isSmallScreen ? 0.9 : 0.75)); // 高さをさらに調整

    return {
      calendarWidth,
      dayWidth,
      dayHeight,
      isSmallScreen,
    };
  }, []);
};

// 日本の祝日（APIから自動取得、キャッシュ済みデータを同期的に参照）
import { getHolidaysSync } from "@/common/common-utils/util-settings/japaneseHolidays";

export const HOLIDAYS: { [key: string]: string } = new Proxy(
  {} as Record<string, string>,
  {
    get(_target, prop: string) {
      return getHolidaysSync()[prop];
    },
    has(_target, prop: string) {
      return prop in getHolidaysSync();
    },
    ownKeys() {
      return Object.keys(getHolidaysSync());
    },
    getOwnPropertyDescriptor(_target, prop: string) {
      const holidays = getHolidaysSync();
      if (prop in holidays) {
        return { configurable: true, enumerable: true, value: holidays[prop] };
      }
      return undefined;
    },
  }
);

// 日本語の曜日を定義
export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// プラットフォーム固有の設定
export const PLATFORM_SPECIFIC = {
  isWeb: Platform.OS === "web",
  isIOS: Platform.OS === "ios",
  isAndroid: Platform.OS === "android",
};
