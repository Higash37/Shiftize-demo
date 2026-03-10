/**
 * @file GanttViewView.types.ts
 * @description ガントチャート閲覧画面（GanttViewView）のProps型定義。編集不可の閲覧専用版
 */
import { ShiftItem } from "@/common/common-models/ModelIndex";

/**
 * GanttViewViewのProps
 * GanttEditViewPropsとほぼ同じだが、編集系コールバック（onTimeChange等）がない
 */
export interface GanttViewViewProps {
  shifts: ShiftItem[];     // 表示するシフト一覧
  users: Array<{ uid: string; nickname: string; color?: string }>; // ユーザー一覧
  days: string[];          // 表示対象の日付文字列配列
  currentYearMonth: { year: number; month: number }; // 現在の年月
  onMonthChange: (year: number, month: number) => void; // 月変更コールバック
  onShiftUpdate: () => void;                            // データリフレッシュ
  onShiftPress: (shift: ShiftItem) => void;             // シフトタップ時
}
