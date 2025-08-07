/**
 * シフトコンポーネント共通の型定義
 */
import { ViewStyle, TextStyle } from "react-native";

/**
 * 時間スロット（開始時間と終了時間）
 */
export type TimeSlot = {
  start: string;
  end: string;
};

/**
 * 授業時間スロット
 */
export type ClassTimeSlot = {
  startTime: string;
  endTime: string;
  id?: string;
};

/**
 * シフトの種類
 */
export type ShiftType = "user" | "class" | "deleted";

/**
 * 基本的なシフト表示用スタイル
 */
export interface BaseShiftStyles {
  container: ViewStyle;
  label?: TextStyle;
  timeContainer?: ViewStyle;
  timeText?: TextStyle;
}

/**
 * 時間選択コンポーネント共通のプロパティ
 */
export interface BaseTimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  label?: string;
}
