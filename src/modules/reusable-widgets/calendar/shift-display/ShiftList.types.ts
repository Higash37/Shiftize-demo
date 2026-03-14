/**
 * @file ShiftList.types.ts
 * @description シフト一覧表示コンポーネント（ShiftList, ShiftListView）の型定義ファイル。
 *              シフトリストのProps型、スタイル型、シフトアイテムのProps型を定義する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（ViewStyle, TextStyle）,
//              @/common/common-models/ModelIndex（ShiftStatus, Shift 型）
// インポート先: ShiftList.tsx, ShiftListView.tsx, ShiftList.styles.ts

import { ViewStyle, TextStyle } from "react-native";
// ShiftStatus: シフトの状態を表すユニオン型（"draft" | "pending" | "approved" | ...）
// Shift: シフト1件分のデータモデル型
import { Shift } from "@/common/common-models/ModelIndex";

/**
 * ShiftListProps
 *
 * シフト一覧コンポーネントに渡すProps型。
 *
 * @property shifts       - 表示するシフトの配列
 * @property selectedDate - 現在選択中の日付文字列（例: "2026-03-10"）
 */
export interface ShiftListProps {
  shifts: Shift[];
  selectedDate: string;
}

/**
 * ShiftListStyles
 *
 * シフト一覧のスタイル型。各UI部品のスタイルを規定する。
 */
export interface ShiftListStyles {
  container: ViewStyle;         // リスト全体のコンテナ
  shiftItem: ViewStyle;         // シフト1件のカード
  shiftInfo: ViewStyle;         // シフト情報（日時・タイプ）のコンテナ
  dateTime: TextStyle;          // 日時テキスト
  shiftType: TextStyle;         // シフトタイプテキスト
  rightContainer: ViewStyle;    // 右側コンテナ（ステータス・詳細ボタン）
  statusText: TextStyle;        // ステータステキスト
  detailsButton: ViewStyle;     // 詳細ボタン
  detailsButtonText: TextStyle; // 詳細ボタンテキスト
  detailsContainer: ViewStyle;  // 詳細展開部分のコンテナ
  detailSection: ViewStyle;     // 詳細内のセクション
  detailTitle: TextStyle;       // 詳細セクションのタイトル
  detailsText: TextStyle;       // 詳細テキスト
  changesContainer: ViewStyle;  // 変更申請内容のコンテナ
  changesTitle: TextStyle;      // 変更申請タイトル
  changesText: TextStyle;       // 変更申請テキスト
  timelineContainer: ViewStyle; // タイムラインのコンテナ
  timeSlot: ViewStyle;          // 時間スロット
  classTimeSlot: ViewStyle;     // 授業時間スロット
  timeSlotTitle: TextStyle;     // スロットタイトル
}

/**
 * ShiftTypeMap
 *
 * シフトのタイプを表すユニオン型。
 * `type` キーワードで型エイリアスを定義している。interface と違い、ユニオン型の定義に使える。
 *
 * "user"    = 一般ユーザーのシフト
 * "class"   = 講師のシフト
 * "deleted" = 削除済みシフト
 */
export type ShiftTypeMap = "user" | "class" | "deleted";

/**
 * ShiftItemProps
 *
 * シフトリスト内の個別アイテムに渡すProps型。
 * `type` で定義するオブジェクト型。interface と機能的にはほぼ同じ。
 *
 * @property shift      - シフトデータ
 * @property isExpanded - 詳細が展開中か
 * @property onToggle   - 展開/折りたたみのトグル関数
 */
export type ShiftItemProps = {
  shift: Shift;
  isExpanded: boolean;
  onToggle: () => void;
};
