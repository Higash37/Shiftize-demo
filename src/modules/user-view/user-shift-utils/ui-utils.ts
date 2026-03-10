/**
 * @file ui-utils.ts
 * @description シフト関連のユーティリティ関数を集めたファイル。
 *   時間選択コンポーネント（TimeSelect, TimeInputSection）で使用する
 *   時間オプションの生成や、時間文字列のパースを行う。
 */

/*
【このファイルの位置づけ】
  TimeSelect.tsx, TimeInputSection.tsx, ShiftReportModal.tsx → ★このファイル（関数を利用）
    └─ @/common/common-constants/BoundaryConstants（シフト時間の定数）
  user-shift-utils/index.ts → ★このファイル（re-export）
*/

import { SHIFT_HOURS } from "@/common/common-constants/BoundaryConstants";

/**
 * 時間オプション（"09:00", "09:30", ... のような文字列配列）を生成する関数
 *
 * デフォルト引数について:
 *   `startHourInclusive: number = SHIFT_HOURS.START_HOUR_INCLUSIVE`
 *   引数が省略された場合に自動で SHIFT_HOURS.START_HOUR_INCLUSIVE が使われる。
 *   呼び出し側は `generateTimeOptions()` と引数なしで呼べる。
 *
 * @param startHourInclusive - 開始時間（時、inclusive: この時刻を含む）
 * @param endHourInclusive - 終了時間（時、inclusive: この時刻を含む）
 * @param intervalMinutes - 時間間隔（分）。例: 30 なら30分刻み
 * @returns 時間文字列の配列（"HH:MM"形式）。ソート済み
 *
 * 処理ステップ:
 *   1. Set を使って重複のない時間文字列を集める
 *   2. 開始時間から終了時間まで、指定間隔でループ
 *   3. padStart(2, "0") で1桁の数字を0埋め（例: 9 → "09"）
 *   4. 配列に変換してソートして返す
 */
export function generateTimeOptions(
  startHourInclusive: number = SHIFT_HOURS.START_HOUR_INCLUSIVE,
  endHourInclusive: number = SHIFT_HOURS.END_HOUR_INCLUSIVE,
  intervalMinutes: number = SHIFT_HOURS.TIME_INTERVAL_MINUTES
): string[] {
  // Set<string> はジェネリクス構文。Set は重複を許さないコレクション。
  // <string> は「中身はstring型」という型パラメータ
  const options = new Set<string>();

  // 外側ループ: 時（hour）を1ずつ増やす
  for (let hour = startHourInclusive; hour <= endHourInclusive; hour++) {
    // 内側ループ: 分（minute）を intervalMinutes ずつ増やす（例: 0, 30, ...）
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      // テンプレートリテラル `${}` で文字列を組み立て
      // padStart(2, "0"): 文字列を最低2文字にし、足りない分を"0"で左埋め
      const timeString = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;
      options.add(timeString);
    }
  }

  // Array.from() で Set を配列に変換し、.sort() で辞書順ソート
  return Array.from(options).sort();
}

/**
 * 日付文字列 + 時間文字列を結合して Date 型に変換する関数
 *
 * 戻り値の型 `Date | null` はユニオン型。
 * 「Date または null のどちらかを返す」という意味。
 * 無効な入力が来た場合は null で安全に失敗する。
 *
 * @param dateStr - 日付文字列（"YYYY-MM-DD" 形式）
 * @param timeStr - 時間文字列（"HH:MM" 形式）
 * @returns Date型のオブジェクト。無効な入力の場合は null を返す
 */
export function parseTimeString(dateStr: string, timeStr: string): Date | null {
  // 1. 日付文字列から Date オブジェクトを生成
  const date = new Date(dateStr);
  // Number.isNaN() で無効な日付かチェック。無効なら getTime() が NaN になる
  if (Number.isNaN(date.getTime())) return null;

  // 2. 時間文字列を ":" で分割して時・分を取り出す
  const parts = timeStr.split(":");
  const hours = Number(parts[0]);     // parts[0] は "HH" 部分
  const minutes = Number(parts[1]);   // parts[1] は "MM" 部分
  // 3. setHours(時, 分, 秒, ミリ秒) で時刻を設定。NaN の場合は 0 にフォールバック
  date.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
  return date;
}
