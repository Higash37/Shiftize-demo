/**
 * @file common.types.ts
 * @description カレンダーモジュール全体で共有される型定義ファイル。
 *              日付セル、日付ピッカー、シフト一覧など複数コンポーネントが参照する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: @/common/common-models/ModelIndex（Shift 型）
// インポート先: DayComponent.types.ts, ShiftCalendar.tsx, DatePickerModal.tsx, ShiftList.tsx など
//               カレンダーモジュール内の多くのファイルがこのファイルの型を使う。

import { Shift } from "@/common/common-models/ModelIndex";

/**
 * MarkedDate
 *
 * カレンダー上の日付にマーク（選択状態、ドットなど）を付けるための型。
 * react-native-calendars ライブラリの内部型に合わせた設計。
 *
 * すべてのプロパティに `?` が付いている = すべてオプション（省略可能）。
 *
 * @property selected  - その日が選択されているか（true/false）
 * @property marked    - ドットマーカーを表示するか
 * @property dotColor  - ドットの色（例: "#FF0000"）
 * @property dotStyle  - ドットに適用するカスタムスタイル。any 型 = どんな値でもOK
 *                       ※ any は型安全性が低いので、本来は具体的な型を使うのが望ましい
 */
export interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  dotColor?: string;
  dotStyle?: any;
}

// ShiftCalendarProps は ShiftCalendar.types.ts に移動しました
// 以下はコンポーネント間で共有される型定義のみを保持します

/**
 * DayComponentProps
 *
 * カレンダーの1日分のセル（DayComponent）に渡されるProps。
 * react-native-calendars が dayComponent に渡してくるデータ構造に合わせている。
 *
 * @property date  - 日付情報のオブジェクト（day, month, year, timestamp, dateString を持つ）
 *                   `?` 付きなので undefined になる可能性がある
 * @property state - カレンダーライブラリが設定する日付の状態
 *                   `"disabled" | "today" | "selected" | "" | "inactive"` はユニオン型。
 *                   ユニオン型 `|` は「このうちのどれか1つ」を意味する。
 * @property marking - ドットマーカーの設定。dots 配列で複数ドットにも対応
 *                     `Array<{ key?: string; color: string }>` は
 *                     「key（省略可）と color を持つオブジェクトの配列」を意味する。
 * @property onPress - 日付がタップされたときのコールバック関数
 * @property responsiveSize - レスポンシブ対応用のサイズ調整値
 */
export interface DayComponentProps {
  date?: {
    day: number;
    month: number;
    year: number;
    timestamp: number;
    dateString: string;
  };
  state?: "disabled" | "today" | "selected" | "" | "inactive";
  marking?: {
    selected?: boolean;
    marked?: boolean;
    dotColor?: string;
    dotStyle?: any;
    dots?: Array<{ key?: string; color: string }>;
  };
  onPress?: (date?: { dateString: string; day: number; month: number; year: number; timestamp: number; }) => void;
  responsiveSize?: any;
}

/**
 * DatePickerProps
 *
 * 日付ピッカーモーダルに渡すProps。
 *
 * @property isOpen      - モーダルが表示されているか
 * @property onClose     - 閉じるときに呼ばれる関数
 * @property onSelect    - 日付が選択されたときに呼ばれる関数。引数は選択された Date オブジェクト
 * @property initialDate - 初期表示する日付
 */
export interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date;
}

/**
 * ShiftListProps
 *
 * シフト一覧コンポーネントに渡すProps。
 *
 * @property shifts       - 表示するシフトの配列。`Shift[]` は「Shift型の配列」
 * @property selectedDate - 現在選択中の日付文字列（例: "2026-03-10"）
 */
export interface ShiftListProps {
  shifts: Shift[];
  selectedDate: string;
}
