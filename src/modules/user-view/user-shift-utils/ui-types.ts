/**
 * @file ui-types.ts
 * @description シフト関連コンポーネントで共有される型定義をまとめたファイル。
 *   「型定義」とは、データの形（どんなプロパティを持つか）を決めるもの。
 *   ここで定義した型は、UIコンポーネント（MultiDatePicker, TimeSelect など）から参照される。
 */

/*
【このファイルの位置づけ】
  コンポーネント群 (MultiDatePicker, TimeSelect 等) → ★このファイル（型を参照）
  user-shift-utils/index.ts → ★このファイル（re-export）
  ※ React Native の ViewStyle / TextStyle はスタイルオブジェクトの型
*/

// ViewStyle: View要素のスタイル用の型、TextStyle: Text要素のスタイル用の型
import { ViewStyle, TextStyle } from "react-native";

/**
 * 時間スロット（開始時間と終了時間のペア）
 *
 * `type` と `interface` はどちらもオブジェクトの形を定義できるが、
 * `type` はユニオン型（A | B）などにも使えるためシンプルなデータ構造に向く
 */
export type TimeSlot = {
  start: string;  // 例: "09:00"
  end: string;    // 例: "17:00"
};

/**
 * 授業時間スロット
 * シフト内に含まれる授業の時間帯を表す
 */
export type ClassTimeSlot = {
  startTime: string;  // 例: "13:00"
  endTime: string;    // 例: "14:00"
  id?: string;        // `?` はオプショナル（省略可能）を意味する。idが無い場合もある
};

/**
 * シフトの種類を表すユニオン型
 *
 * ユニオン型 `"user" | "class" | "deleted"` は
 * 「この3つの文字列リテラルのどれか1つ」という意味。
 * それ以外の文字列を代入するとコンパイルエラーになる。
 */
export type ShiftType = "user" | "class" | "deleted";

/**
 * 基本的なシフト表示用スタイルの interface
 *
 * `interface` はオブジェクトの「契約書」のようなもので、
 * このインターフェースを implements すると、container は必須、
 * label / timeContainer / timeText は `?` なので省略可能。
 */
export interface BaseShiftStyles {
  container: ViewStyle;       // 必須: コンテナのスタイル
  label?: TextStyle;          // 省略可: ラベルテキストのスタイル
  timeContainer?: ViewStyle;  // 省略可: 時間表示エリアのスタイル
  timeText?: TextStyle;       // 省略可: 時間テキストのスタイル
}

/**
 * 時間選択コンポーネント共通のプロパティ（Props）
 *
 * Reactコンポーネントに渡す引数（props）の型を定義している。
 * onChange は「関数型」で、引数に time: string を取り、戻り値なし（void）。
 */
export interface BaseTimePickerProps {
  value?: string;                        // 現在選択中の時間（例: "09:00"）
  onChange?: (time: string) => void;     // 時間が変更された時に呼ばれるコールバック関数
  label?: string;                        // 表示ラベル（例: "開始時間"）
}
