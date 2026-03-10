/**
 * @file GanttEditView.types.ts
 * @description ガントチャート編集画面（GanttEditView）のProps型定義
 */
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftData } from "../ganttView/gantt-modals/ShiftModal";

/**
 * GanttEditViewコンポーネントのProps
 * 管理者がガントチャート形式でシフトを編集する画面に渡すデータとコールバック
 */
export interface GanttEditViewProps {
  shifts: ShiftItem[];     // 表示するシフト一覧
  // Array<{ uid; nickname; color? }> はインラインのオブジェクト型配列。interfaceを別定義しても良い
  users: Array<{ uid: string; nickname: string; color?: string }>;
  days: string[];          // 表示対象の日付文字列配列（例: ["2026-03-01", "2026-03-02", ...]）
  loading: boolean;        // データ読み込み中フラグ
  error: string | null;    // エラーメッセージ（正常時はnull）
  currentYearMonth: { year: number; month: number }; // 現在表示中の年月
  onMonthChange: (year: number, month: number) => void; // 月が変わった時のコールバック
  onShiftUpdate: () => void;                            // シフト更新後のリフレッシュ用コールバック
  onShiftPress: (shift: ShiftItem) => void;             // シフトをタップした時のコールバック
  // "?" が付いたプロパティはオプショナル（渡さなくてもエラーにならない）
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;                                            // ドラッグ等で時間が変更された時
  onShiftSave?: (data: ShiftData) => void;              // シフト保存時
  onShiftDelete?: (shiftId: string) => void;            // シフト削除時
  refreshPage?: () => void;                             // ページ全体のリフレッシュ
}
