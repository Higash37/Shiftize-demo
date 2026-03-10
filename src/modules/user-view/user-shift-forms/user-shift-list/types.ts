/** @file types.ts (user-shift-list)
 *  @description シフト一覧コンポーネントの Props 型定義。
 *
 *  【このファイルの位置づけ】
 *  - 依存: ShiftItem / ClassTimeSlot モデル（common-models）
 *  - 利用先: ShiftListItem コンポーネント
 */
import type {
  ShiftItem,
  ClassTimeSlot,
} from "@/common/common-models/model-shift/shiftTypes";

/**
 * ShiftListItem コンポーネントの Props。
 * ShiftItem を拡張して授業スロットも持てるようにしている。
 * ---- TypeScript 構文メモ ----
 * ShiftItem & { classes?: ClassTimeSlot[] }
 *   → 交差型（Intersection Type）。ShiftItem の全フィールドに加えて
 *     classes プロパティを任意で持てる型になる。
 */
export interface ShiftListItemProps {
  shift: ShiftItem & {
    classes?: ClassTimeSlot[];
  };
  isSelected: boolean;
  selectedDate: string;
  onPress: () => void;
  onDetailsPress: () => void;
  children?: React.ReactNode;
  showNickname?: boolean; // マスター用: ニックネームを表示するか
}
