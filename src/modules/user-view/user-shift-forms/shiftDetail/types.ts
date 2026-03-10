/** @file types.ts (shiftDetail)
 *  @description シフト詳細表示の型定義。
 *    タイムスロット（勤務時間 or 授業時間）のデータ構造と、
 *    ShiftDetailsView / ShiftTimeSlot コンポーネントの Props を定義する。
 *
 *  【このファイルの位置づけ】
 *  - 依存なし（純粋な型定義ファイル）
 *  - 利用先: ShiftDetailsView / ShiftTimeSlot コンポーネント
 */

/** 1つのタイムスロット（勤務時間 or 授業時間）を表す型 */
export interface TimeSlot {
  type: "user" | "class";
  startTime: string;
  endTime: string;
  typeId?: string | undefined;
  typeName?: string | undefined;
}

export interface ShiftDetailsViewProps {
  timeSlots: TimeSlot[];
}

export interface ShiftTimeSlotProps {
  type: "user" | "class";
  startTime: string;
  endTime: string;
  typeId?: string | undefined;
  typeName?: string | undefined;
}
