/**
 * @file DatePickerModal.types.ts
 * @description 日付ピッカーモーダル（年→月→日のステップ選択UI）の型定義ファイル。
 *              メインモーダル、年ピッカー、月ピッカーそれぞれのProps型とスタイル型を定義する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（ViewStyle, TextStyle）
// インポート先: DatePickerModal.tsx, DatePickerModal.styles.ts

import { ViewStyle, TextStyle } from "react-native";

/**
 * DatePickerModalProps
 *
 * 日付ピッカーモーダル全体のProps型。
 *
 * @property isVisible   - モーダルの表示/非表示
 * @property initialDate - 初期表示する日付（Date型）。ピッカーの初期値に使用される
 * @property onClose     - モーダルを閉じるときに呼ばれるコールバック
 * @property onSelect    - 日付が選択されたときに呼ばれるコールバック。選択された Date を受け取る
 */
export interface DatePickerModalProps {
  isVisible: boolean;
  initialDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

/**
 * YearPickerProps
 *
 * 年選択コンポーネントのProps型。
 *
 * @property tempDate     - 現在の一時的な日付（選択中の年をハイライトするために使う）
 * @property onYearSelect - 年が選択されたときに呼ばれるコールバック。選択された年（数値）を受け取る
 * @property onCancel     - キャンセル時に呼ばれるコールバック
 */
export interface YearPickerProps {
  tempDate: Date;
  onYearSelect: (year: number) => void;
  onCancel: () => void;
}

/**
 * MonthPickerProps
 *
 * 月選択コンポーネントのProps型。
 *
 * @property tempDate      - 現在の一時的な日付（選択中の月をハイライトするために使う）
 * @property onMonthSelect - 月が選択されたときに呼ばれるコールバック。選択された月（1〜12の数値）を受け取る
 * @property onBack        - 「戻る」ボタンで年選択に戻るときのコールバック
 */
export interface MonthPickerProps {
  tempDate: Date;
  onMonthSelect: (month: number) => void;
  onBack: () => void;
}

/**
 * DatePickerModalStyles
 *
 * 日付ピッカーモーダルのスタイル型。
 * モーダルのオーバーレイ、コンテンツ、ピッカーアイテム、ボタンなどのスタイルを規定する。
 */
export interface DatePickerModalStyles {
  modalOverlay: ViewStyle;    // 半透明の背景
  modalContainer: ViewStyle;  // モーダルのコンテナ（位置決め用）
  modalContent: ViewStyle;    // モーダルの内容エリア
  modalTitle: TextStyle;      // タイトルテキスト
  pickerContainer: ViewStyle; // ピッカーリストのコンテナ（スクロール可能）
  pickerItem: ViewStyle;      // リストの各アイテム（年の行）
  selectedItem: ViewStyle;    // 選択中のアイテムの追加スタイル
  pickerText: TextStyle;      // アイテムのテキスト
  selectedText: TextStyle;    // 選択中アイテムのテキスト
  monthGrid: ViewStyle;       // 月選択のグリッドレイアウト
  monthItem: ViewStyle;       // 月選択の各アイテム
  monthItemText: TextStyle;   // 月アイテムのテキスト
  modalButtons: ViewStyle;    // ボタン行のコンテナ
  modalButton: ViewStyle;     // 各ボタンのスタイル
  modalButtonText: TextStyle; // ボタンテキスト
}
