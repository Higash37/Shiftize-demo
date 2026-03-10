/**
 * @file ShiftCalendar.types.ts
 * @description メインのシフトカレンダーコンポーネント（ShiftCalendar）の型定義ファイル。
 *              カレンダーのProps型、ヘッダー情報型、スタイル型を定義する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: ../calendar-types/common.types（DayComponentProps）,
//              react-native（ViewStyle）, @/common/common-models/ModelIndex（Shift, ShiftItem）
// インポート先: ShiftCalendar.tsx, ShiftCalendar.styles.ts

import { DayComponentProps } from "../calendar-types/common.types";
import { ViewStyle } from "react-native";
import { Shift, ShiftItem } from "@/common/common-models/ModelIndex";

/**
 * ShiftCalendarProps
 *
 * ShiftCalendar コンポーネントに渡すProps型。
 * カレンダーの表示データ、選択状態、イベントハンドラをまとめて定義する。
 *
 * @property shifts             - 表示するシフトの配列。
 *                                `Shift[] | ShiftItem[]` はユニオン型で「Shift配列かShiftItem配列のどちらか」。
 *                                2つの異なる型の配列を受け入れることで柔軟性を持たせている。
 * @property selectedDate       - 現在選択中の日付文字列（例: "2026-03-10"）
 * @property currentMonth       - 現在表示中の月（例: "2026-03-01"）
 * @property currentUserStoreId - 現在のユーザーの店舗ID（省略可能）。シフトのフィルタリングに使う
 * @property onDayPress         - 日付がタップされたときのコールバック。
 *                                引数は `{ dateString: string }` 形式のオブジェクト
 * @property onMonthChange      - 月が切り替わったときのコールバック（省略可能）
 * @property markedDates        - 外部から渡すマーキングデータ（省略可能）。
 *                                `Record<string, any>` は `{ [key: string]: any }` と同じ意味。
 *                                Record<K, V> はTypeScriptのユーティリティ型で「キーがK型、値がV型のオブジェクト」
 * @property onMount            - コンポーネントがマウントされたときのコールバック（省略可能）
 * @property hideMonthNav       - 月ナビゲーションを非表示にするか（小型カレンダーウィジェット用）
 * @property responsiveSize     - レスポンシブ対応のサイズ調整値。各部品のサイズを上書きできる
 */
export interface ShiftCalendarProps {
  shifts: Shift[] | ShiftItem[];
  selectedDate: string;
  currentMonth: string;
  currentUserStoreId?: string; // 現在のユーザーの店舗ID
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange?: (month: { dateString: string }) => void;
  markedDates?: Record<string, any>;
  onMount?: () => void;
  hideMonthNav?: boolean; // 月ナビゲーション非表示（小型カレンダーウィジェット用）
  responsiveSize?: {
    calendar?: ViewStyle;
    container?: ViewStyle;
    header?: any;
    day?: any;
    scale?: number;
  };
}

/**
 * CalendarHeaderInfo
 *
 * react-native-calendars のヘッダー情報を拡張した型。
 * カレンダーの月切り替え時にライブラリから渡されるデータの形式。
 *
 * @property month      - 月番号（1〜12）
 * @property year       - 年
 * @property timestamp  - UNIXタイムスタンプ（ミリ秒）
 * @property dateString - 日付文字列
 * @property monthName  - 月の名前（ロケール依存）
 */
export interface CalendarHeaderInfo {
  month: number;
  year: number;
  timestamp: number;
  dateString: string;
  monthName: string;
}

/**
 * ShiftCalendarStyles
 *
 * ShiftCalendar のスタイル型。
 */
export interface ShiftCalendarStyles {
  container: ViewStyle;          // カレンダー全体のコンテナ
  containerFullWidth: ViewStyle; // スマホ向けフル幅コンテナ
  calendar: ViewStyle;           // カレンダー本体
  calendarShadow: ViewStyle;    // カレンダーの影
}
