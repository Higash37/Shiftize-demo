/**
 * @file ShiftDetails.types.ts
 * @description シフト詳細表示コンポーネント（ShiftDetails）のProps型とスタイル型を定義するファイル。
 *              シフトの時間内訳（スタッフ時間・授業時間）をアニメーション付きパネルで表示する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（ViewStyle, TextStyle）, @/common/common-models/ModelIndex（Shift型）
// インポート先: ShiftDetails.tsx, ShiftDetails.styles.ts

import { ViewStyle, TextStyle } from "react-native";
import { Shift } from "@/common/common-models/ModelIndex";

/**
 * ShiftDetailsProps
 *
 * ShiftDetails コンポーネントに渡すProps型。
 *
 * @property shift     - 表示するシフトデータ（Shift 型）
 * @property maxHeight - アニメーション展開時の最大高さ（px）。`?` で省略可能。
 *                       省略時はコンポーネント内でデフォルト値（500）が使われる
 * @property isOpen    - パネルが開いているか閉じているか
 */
export interface ShiftDetailsProps {
  shift: Shift;
  maxHeight?: number;
  isOpen: boolean;
}

/**
 * ShiftDetailsStyles
 *
 * ShiftDetails のスタイル型。各部分のスタイルプロパティを規定する。
 */
export interface ShiftDetailsStyles {
  container: ViewStyle;       // 全体のコンテナ
  header: ViewStyle;          // ニックネーム+日付を表示するヘッダー部
  nickname: TextStyle;        // ニックネームテキスト
  date: TextStyle;            // 日付テキスト
  timeSlots: ViewStyle;       // 時間スロット一覧のコンテナ
  timeSlot: ViewStyle;        // 通常の時間スロット（スタッフ時間）
  classTimeSlot: ViewStyle;   // 授業時間スロット（背景色付き）
  timeSlotLabel: TextStyle;   // スロットのラベル（「スタッフ」等）
  classLabel: TextStyle;      // 授業ラベルの色
  timeText: TextStyle;        // 時間テキスト（"09:00 ~ 10:00"）
  classTime: TextStyle;       // 授業時間テキスト（太字・プライマリ色）
}
