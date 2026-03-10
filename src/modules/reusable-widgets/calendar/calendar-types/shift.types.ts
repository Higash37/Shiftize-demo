/**
 * @file shift.types.ts
 * @description シフト表示用のアダプター・アイテムコンポーネントに渡すProps型を定義するファイル。
 *              ShiftListAdapter や ShiftList から使われる。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: @/common/common-models/ModelIndex（共通のShift型）
// インポート先: ShiftListAdapter.tsx, ShiftList.tsx などのシフト表示コンポーネント

// Shift 型を共通モデルからインポート。
// `as CommonShift` は「CommonShift」という別名（エイリアス）を付けている。
// 同じ名前の型がこのファイル内で衝突しないようにするテクニック。
import { Shift as CommonShift } from "@/common/common-models/ModelIndex";

/**
 * ShiftAdapterProps
 *
 * シフト詳細のアダプターコンポーネント（ShiftDetailsAdapter）に渡すProps。
 *
 * @property shift  - 表示するシフトデータ（CommonShift 型）
 * @property isOpen - 詳細パネルが開いているかどうかの真偽値（true=開く, false=閉じる）
 */
export interface ShiftAdapterProps {
  shift: CommonShift;
  isOpen: boolean;
}

/**
 * ShiftItemProps
 *
 * シフト一覧の個別アイテムコンポーネントに渡すProps。
 *
 * @property shift      - 表示するシフトデータ
 * @property isExpanded - 詳細が展開されているかどうか
 * @property onToggle   - 展開/折りたたみを切り替える関数。引数も戻り値もない（() => void）
 *                        `() => void` は「引数なし・戻り値なし」の関数型。
 */
export interface ShiftItemProps {
  shift: CommonShift;
  isExpanded: boolean;
  onToggle: () => void;
}
