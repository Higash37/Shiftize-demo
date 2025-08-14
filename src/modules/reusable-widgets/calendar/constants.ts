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

// 日本の祝日（2024-2025年分）
export const HOLIDAYS: { [key: string]: string } = {
  "2024-01-01": "元日",
  "2024-01-08": "成人の日",
  "2024-02-11": "建国記念日",
  "2024-02-23": "天皇誕生日",
  "2024-03-20": "春分の日",
  "2024-04-29": "昭和の日",
  "2024-05-03": "憲法記念日",
  "2024-05-04": "みどりの日",
  "2024-05-05": "こどもの日",
  "2024-07-15": "海の日",
  "2024-08-11": "山の日",
  "2024-09-16": "敬老の日",
  "2024-09-22": "秋分の日",
  "2024-10-14": "スポーツの日",
  "2024-11-03": "文化の日",
  "2024-11-23": "勤労感謝の日",
  "2025-01-01": "元日",
  "2025-01-13": "成人の日",
  "2025-02-11": "建国記念日",
  "2025-02-23": "天皇誕生日",
  "2025-03-20": "春分の日",
  "2025-04-29": "昭和の日",
  "2025-05-03": "憲法記念日",
  "2025-05-04": "みどりの日",
  "2025-05-05": "こどもの日",
  "2025-07-21": "海の日",
  "2025-08-11": "山の日",
  "2025-09-15": "敬老の日",
  "2025-09-23": "秋分の日",
  "2025-10-13": "スポーツの日",
  "2025-11-03": "文化の日",
  "2025-11-23": "勤労感謝の日",
};

// 日本語の曜日を定義
export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// プラットフォーム固有の設定
export const PLATFORM_SPECIFIC = {
  isWeb: Platform.OS === "web",
  isIOS: Platform.OS === "ios",
  isAndroid: Platform.OS === "android",
};
