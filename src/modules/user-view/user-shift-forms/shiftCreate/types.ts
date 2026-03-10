/** @file types.ts (shiftCreate)
 *  @description シフト作成フォームの型定義。
 *    シフトデータの構造と、フォームコンポーネントの Props を定義する。
 *
 *  【このファイルの位置づけ】
 *  - 依存なし（純粋な型定義ファイル）
 *  - 利用先: ShiftCreateForm / ShiftCreateFormContent コンポーネント
 */

/** シフト作成時に入力するデータの構造 */
export interface ShiftData {
  startTime: string;
  endTime: string;
  dates: string[];
  hasClass: boolean;
  classes: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export interface ShiftCreateFormProps {
  initialMode?: string;
  initialShiftId?: string;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialClasses?: string;
}
