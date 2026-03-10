/**
 * @file CalendarModal.types.ts
 * @description カレンダーモーダル（日付選択ダイアログ）のProps型とスタイル型を定義するファイル。
 *              複数日付を選択できるモーダルUIのインターフェースを規定する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（ViewStyle, TextStyle）
// インポート先: CalendarModal.tsx, CalendarModal.styles.ts

// ViewStyle: View系コンポーネント用のスタイル型（width, height, flexDirection 等）
// TextStyle: Text系コンポーネント用のスタイル型（fontSize, fontWeight, color 等）
import { ViewStyle, TextStyle } from "react-native";

/**
 * CalendarModalProps
 *
 * CalendarModal コンポーネントに渡すProps型。
 *
 * @property visible      - モーダルの表示/非表示（true=表示）
 * @property onClose      - モーダルを閉じるときに呼ばれるコールバック関数
 * @property onConfirm    - 「設定する」ボタンを押したときに呼ばれるコールバック。
 *                          引数に選択された日付の配列（例: ["2026-03-10", "2026-03-11"]）を受け取る
 *                          `(dates: string[]) => void` は「string配列を受け取り、何も返さない関数」の型
 * @property initialDates - 初期状態で選択済みにする日付の配列（省略可能: `?`）
 */
export interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dates: string[]) => void;
  initialDates?: string[];
}

/**
 * CalendarModalStyles
 *
 * CalendarModal のスタイル定義の型。
 * StyleSheet.create() に渡すオブジェクトの形を規定する。
 * 各プロパティは ViewStyle（レイアウト用）または TextStyle（文字用）のどちらか。
 */
export interface CalendarModalStyles {
  overlay: ViewStyle;           // 半透明の背景オーバーレイ
  content: ViewStyle;           // モーダル本体のコンテンツ領域
  header: ViewStyle;            // ヘッダー（タイトル行）
  title: TextStyle;             // タイトルテキスト（「日付を選択」）
  closeButton: TextStyle;       // 閉じるボタン（✕）
  calendar: ViewStyle;          // カレンダー部分のコンテナ
  calendarHeader: ViewStyle;    // カレンダーのヘッダー（年月表示行）
  monthText: TextStyle;         // 月テキスト（例: "2026年3月"）
  footer: ViewStyle;            // フッター（ボタン行）
  button: ViewStyle;            // ボタン共通スタイル
  cancelButton: ViewStyle;      // キャンセルボタン固有スタイル
  confirmButton: ViewStyle;     // 確定ボタン固有スタイル
  cancelButtonText: TextStyle;  // キャンセルボタンのテキスト
  confirmButtonText: TextStyle; // 確定ボタンのテキスト
  subtitle: TextStyle;          // サブタイトル（「N日選択中」）
}
