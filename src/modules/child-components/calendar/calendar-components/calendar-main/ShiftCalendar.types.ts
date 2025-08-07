import { DayComponentProps } from "../../calendar-types/common.types";
import { ViewStyle } from "react-native";
import { Shift } from "@/common/common-models/ModelIndex";

/**
 * ShiftCalendarのProps型定義
 */
export interface ShiftCalendarProps {
  shifts: Shift[];
  selectedDate: string;
  currentMonth: string;
  currentUserStoreId?: string; // 現在のユーザーの店舗ID
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange?: (month: { dateString: string }) => void;
  markedDates?: Record<string, any>;
  onMount?: () => void;
  responsiveSize?: {
    calendar?: ViewStyle;
    container?: ViewStyle;
    header?: any;
    day?: any;
  };
}

/**
 * react-native-calendars の型定義を拡張
 */
export interface CalendarHeaderInfo {
  month: number;
  year: number;
  timestamp: number;
  dateString: string;
  monthName: string;
}

/**
 * スタイルの型定義
 */
export interface ShiftCalendarStyles {
  container: ViewStyle;
  containerFullWidth: ViewStyle;
  calendar: ViewStyle;
  calendarShadow: ViewStyle;
}
