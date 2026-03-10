/**
 * @file MasterShiftCreateView.types.ts
 * @description マスターシフト作成/編集画面のProps型定義
 */

// ユニオン型: "create" か "edit" のどちらかだけを受け付ける
// type は interface と違い、ユニオンやプリミティブの別名に使える
export type ShiftFormMode = "create" | "edit";

export interface MasterShiftCreateViewProps {
  mode: ShiftFormMode;   // フォームの動作モード（新規作成 or 既存編集）
  shiftId?: string;      // 編集時のシフトID（"?" = オプショナル。create時は不要）
  date?: string;         // 日付（例: "2026-03-10"）
  startTime?: string;    // 開始時間（例: "09:00"）
  endTime?: string;      // 終了時間（例: "17:00"）
  classes?: string;      // 途中時間情報（JSON文字列として渡される場合がある）
}
