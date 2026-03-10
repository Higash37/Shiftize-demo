/** @file GanttChartProps.ts
 *  @description GanttChartMonthView（月間ガントチャート）に渡す props の型定義。
 *    「Edit用」と「View用」の2種類のインターフェースを定義している。
 */

// 【このファイルの位置づけ】
// - import元: ModelIndex（ShiftItem型 = 1件のシフトデータを表す型）
// - importされる先: GanttChartMonthView.tsx
// - 役割: ガントチャートの最上位コンポーネントが「外から何を受け取るか」を定義する。

import { ShiftItem } from "@/common/common-models/ModelIndex";

// --- Edit 用 ---
// GanttChartMonthEditProps: シフト編集画面用のprops型
export interface GanttChartMonthEditProps {
  shifts: ShiftItem[];                                  // 表示するシフトの配列
  onShiftPress?: (shift: ShiftItem) => void;            // シフトバーをタップした時のコールバック（省略可能＝ ?）
  onShiftUpdate?: (shift: ShiftItem) => void;           // シフトが更新された時のコールバック
  onMonthChange?: (year: number, month: number) => void; // 月が変更された時のコールバック（year: 西暦, month: 0始まりの月）
  classTimes?: { start: string; end: string }[];         // 授業時間帯の配列（省略可能）
}

// --- View 用 ---
// GanttChartMonthViewProps: シフト閲覧画面用のprops型（Edit用より多くの情報が必要）
export interface GanttChartMonthViewProps {
  shifts: ShiftItem[];    // 表示対象の全シフトデータ
  days: string[];         // 表示する日付の配列（"2025-01-01" 形式の文字列）
  users: {                // ユーザー情報の配列（型をインラインで直接定義している）
    uid: string;          //   ユーザーの一意ID
    nickname: string;     //   表示名
    color?: string;       //   ユーザーに割り当てられた色（省略可能。? がついているので undefined になりうる）
    hourlyWage?: number;  //   時給（給与計算に使用）
  }[];                    // [] = 配列型であることを示す
  selectedDate: Date;     // 現在選択されている月を表すDateオブジェクト
  onShiftPress?: (shift: ShiftItem) => void;  // シフトバータップ時のコールバック
  onShiftUpdate?: () => void;                 // シフト更新後のコールバック（引数なし版）
  onMonthChange?: (year: number, month: number) => void; // 月変更時のコールバック
  onTimeChange?: (                            // シフト時間変更時のコールバック（ドラッグで時間変更した時など）
    shiftId: string,                          //   対象シフトのID
    newStartTime: string,                     //   新しい開始時間（"09:00" 形式）
    newEndTime: string                        //   新しい終了時間
  ) => void;
  classTimes?: { start: string; end: string }[]; // 授業時間帯の配列
  refreshPage?: () => void;                      // ページ全体を再読み込みする関数
}
