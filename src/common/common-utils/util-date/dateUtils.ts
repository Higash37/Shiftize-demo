/**
 * @file dateUtils.ts
 * @description 日付関連のユーティリティ関数。曜日判定、祝日判定、色取得を提供する。
 *
 * 【このファイルの位置づけ】
 * - ガントチャートやカレンダー表示で、日曜日・祝日の色分けに使用される
 * - HOLIDAYSマスターデータはカレンダーモジュールから取得
 * - 関連ファイル: reusable-widgets/calendar/constants（祝日データ）,
 *                home-view/（ガントチャート表示）
 *
 * 【日付文字列の形式】
 * このファイルの関数は "YYYY-MM-DD" 形式の文字列を受け取る前提。
 * 例: "2026-01-01", "2026-03-10"
 */

import { HOLIDAYS } from "@/modules/reusable-widgets/calendar/constants";

/**
 * isSunday - 指定日付が日曜日かどうかを判定する
 *
 * 【処理の流れ】
 * 1. 文字列からDateオブジェクトを生成
 * 2. getDay() で曜日番号を取得（0=日, 1=月, ..., 6=土）
 * 3. 0（日曜日）と比較
 *
 * @param date - "YYYY-MM-DD" 形式の日付文字列
 * @returns 日曜日なら true
 */
export const isSunday = (date: string): boolean => {
  // new Date("2026-03-10") → Dateオブジェクトを生成
  // .getDay() → 0=日曜, 1=月曜, ..., 6=土曜 を返す
  return new Date(date).getDay() === 0;
};

/**
 * isHoliday - 指定日付が祝日かどうかを判定する
 *
 * HOLIDAYSオブジェクトのキーに日付文字列が存在するかをチェック。
 * HOLIDAYS は { "2026-01-01": "元日", ... } のような辞書形式。
 *
 * 【Boolean() の役割】
 * HOLIDAYS[date] が undefined（祝日でない）の場合は false に変換される。
 * 文字列（祝日名）の場合は true に変換される。
 *
 * @param date - "YYYY-MM-DD" 形式の日付文字列
 * @returns 祝日なら true
 */
export const isHoliday = (date: string): boolean => {
  return Boolean(HOLIDAYS[date]);
};

/**
 * isSundayOrHoliday - 指定日付が日曜日または祝日かどうかを判定する
 *
 * isSunday と isHoliday を OR 条件で組み合わせた便利関数。
 *
 * @param date - "YYYY-MM-DD" 形式の日付文字列
 * @returns 日曜日または祝日なら true
 */
export const isSundayOrHoliday = (date: string): boolean => {
  return isSunday(date) || isHoliday(date);
};

/**
 * getDateBackgroundColor - ガントチャートで使う日付の背景色を取得する
 *
 * 日曜・祝日は薄いグレーの背景にして視覚的に区別する。
 * それ以外の日は透明（背景なし）。
 *
 * @param date - "YYYY-MM-DD" 形式の日付文字列
 * @returns CSS色文字列（"rgba(...)" または "transparent"）
 */
export const getDateBackgroundColor = (date: string): string => {
  if (isSundayOrHoliday(date)) {
    // rgba(0, 0, 0, 0.05) → 黒の5%不透明度 = 非常に薄いグレー
    return "rgba(0, 0, 0, 0.05)";
  }
  return "transparent";
};

/**
 * getDateTextColor - ガントチャートで使う日付の文字色を取得する
 *
 * 日曜・祝日は赤色にして視覚的に区別する。
 * それ以外の日は黒色。
 *
 * @param date - "YYYY-MM-DD" 形式の日付文字列
 * @returns HEX色文字列（"#ff0000" または "#000000"）
 */
export const getDateTextColor = (date: string): string => {
  if (isSundayOrHoliday(date)) {
    return "#ff0000"; // 赤色 - 日本の慣習で日曜・祝日は赤
  }
  return "#000000";   // 黒色 - 通常の日
};
