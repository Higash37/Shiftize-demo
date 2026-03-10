/** @file utils.ts
 *  @description ガントチャートの時間計算・位置計算・シフト重複判定など、
 *    ロジック面のユーティリティ関数をまとめたファイル。
 *    UIコンポーネントからは独立した純粋な計算処理が中心。
 */

// 【このファイルの位置づけ】
// - import元: BoundaryConstants（シフトの開始・終了時間の定数）
// - importされる先: GanttChartMonthView, components（GanttChartGrid, EmptyCell）
// - 主な関数:
//   - generateTimeOptions(): 時間選択肢リスト生成（"09:00","09:15",...）
//   - groupShiftsByOverlap(): シフトを1つずつ別行にグループ化
//   - groupNonOverlappingShifts(): 時間が重複しないシフトを同じ行にまとめる
//   - timeToPosition(): 時間文字列→ピクセル位置に変換
//   - positionToTime(): ピクセル位置→時間文字列に変換

import { useMemo } from 'react';
import { SHIFT_HOURS } from "@/common/common-constants/BoundaryConstants";

// --- 時間選択肢の生成 ---

// TIME_OPTIONS_CACHE: 即時実行関数 (() => { ... })() で1回だけ計算してキャッシュする。
// 結果: ["09:00", "09:15", "09:30", "09:45", "10:00", ... , "22:00"] のような配列。
// padStart(2, "0") は「2桁になるよう先頭を0で埋める」→ 9 → "09"
const TIME_OPTIONS_CACHE = (() => {
  const options: string[] = [];
  for (let hour = SHIFT_HOURS.START_HOUR_INCLUSIVE; hour <= SHIFT_HOURS.END_HOUR_INCLUSIVE; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);  // 毎時00分
    options.push(`${hour.toString().padStart(2, "0")}:15`);  // 毎時15分
    options.push(`${hour.toString().padStart(2, "0")}:30`);  // 毎時30分
    options.push(`${hour.toString().padStart(2, "0")}:45`);  // 毎時45分
  }
  return options;
})();

/**
 * 時間選択プルダウン用の選択肢リストを返す。
 * キャッシュされた配列をそのまま返すので、何度呼んでも高速。
 */
export function generateTimeOptions() {
  return TIME_OPTIONS_CACHE;
}

// --- シフトのグループ化（行の割り当て） ---

import { ShiftItem } from "@/common/common-models/ModelIndex";

/**
 * シフトを1件ずつ個別の行（グループ）に分ける。
 * 結果: [[シフトA], [シフトB], [シフトC]] のように、各グループに1件ずつ。
 * 使い方: 「1人1行」で表示したい場合に使う。
 *
 * @param shifts - 対象日のシフト配列
 * @returns ShiftItem[][] - 各サブ配列が1行分のシフトを表す
 */
export function groupShiftsByOverlap(shifts: ShiftItem[]): ShiftItem[][] {
  if (!shifts || shifts.length === 0) return [];
  // 開始時間順にソートしてから、各シフトを個別の配列に入れる
  // localeCompare: 文字列を辞書順で比較する関数。"09:00" < "10:00" のように動く。
  return shifts
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((shift) => [shift]); // .map で各要素を [要素] に変換 = 1件ずつの配列にする
}

// shiftOverlapCache: 2つのシフトが重複するかの判定結果をキャッシュ。
// Map<string, boolean> = 文字列キー → true/false の辞書構造。
// 同じペアを何度もチェックする場合に高速化する。
const shiftOverlapCache = new Map<string, boolean>();

/**
 * 時間が重複しないシフト同士を同じ行にまとめる「列詰め」アルゴリズム。
 * 例: AさんのシフトとBさんのシフトが重複しなければ同じ行にまとめ、行数を減らす。
 *
 * 【処理ステップ】
 * 1. シフトを開始時間順にソート
 * 2. 各シフトについて、既存グループの中で時間が重複しないものを探す
 * 3. 見つかれば追加、見つからなければ新しいグループ（行）を作成
 *
 * @param shifts - 対象日のシフト配列
 * @returns ShiftItem[][] - 各サブ配列が1行分のシフトを表す（同じ行に複数シフトが入ることがある）
 */
export function groupNonOverlappingShifts(shifts: ShiftItem[]): ShiftItem[][] {
  if (!shifts || shifts.length === 0) return [];

  // [...shifts] はスプレッド構文でシフト配列のコピーを作成（元の配列を壊さないため）
  const sortedShifts = [...shifts].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const groups: ShiftItem[][] = []; // 結果を格納する二次元配列

  for (const shift of sortedShifts) {
    let addedToGroup = false; // このシフトが既存グループに追加されたかフラグ

    for (const group of groups) {
      // .some() は配列の中に条件を満たす要素が1つでもあれば true を返す
      const hasOverlap = group.some(existingShift =>
        shiftsOverlapCached(existingShift, shift)
      );

      if (!hasOverlap) {
        group.push(shift);      // 重複なし → このグループに追加
        addedToGroup = true;
        break;                  // break で他のグループは見ない（最初に見つかったグループに入れる）
      }
    }

    if (!addedToGroup) {
      groups.push([shift]);     // どのグループにも入れなかった → 新しい行を作成
    }
  }

  return groups;
}

/**
 * キャッシュ機能付きシフト重複チェック。
 * 同じペアの判定を2回目以降はキャッシュから返す。
 */
function shiftsOverlapCached(shift1: ShiftItem, shift2: ShiftItem): boolean {
  // キャッシュキーを生成（ID順を統一してペアの順番に関わらず同じキーにする）
  // 例: shift1.id="A", shift2.id="B" → キー "A-B"
  //     shift1.id="B", shift2.id="A" → キー "A-B"（同じ）
  const key = shift1.id < shift2.id
    ? `${shift1.id}-${shift2.id}`
    : `${shift2.id}-${shift1.id}`;

  if (shiftOverlapCache.has(key)) {
    return shiftOverlapCache.get(key)!; // ! は「undefinedではない」とTypeScriptに伝える（非nullアサーション）
  }

  const result = shiftsOverlap(shift1, shift2);
  shiftOverlapCache.set(key, result);
  return result;
}

/**
 * 2つのシフトが時間的に重複するかチェック。
 * 重複条件: シフト1の開始 < シフト2の終了 AND シフト2の開始 < シフト1の終了
 * 例: 9:00-11:00 と 10:00-12:00 → 重複（9 < 12 かつ 10 < 11）
 *     9:00-10:00 と 10:00-11:00 → 重複しない（9 < 11 だが 10 < 10 は偽）
 */
function shiftsOverlap(shift1: ShiftItem, shift2: ShiftItem): boolean {
  const start1 = timeToMinutes(shift1.startTime); // "09:00" → 540（分）
  const end1 = timeToMinutes(shift1.endTime);
  const start2 = timeToMinutes(shift2.startTime);
  const end2 = timeToMinutes(shift2.endTime);

  return start1 < end2 && start2 < end1;
}

// timeToMinutesCache: 時間文字列→分への変換結果をキャッシュ
const timeToMinutesCache = new Map<string, number>();

/**
 * 時間文字列("HH:MM")を「0時からの経過分」に変換する。
 * 例: "09:30" → 9*60+30 = 570
 * キャッシュ機能付きなので、同じ値を何度も変換する場合に高速。
 * 不正な形式の場合は 0 を返す。
 */
function timeToMinutes(time: string): number {
  if (timeToMinutesCache.has(time)) {
    return timeToMinutesCache.get(time)!;
  }

  const parts = time.split(':');        // "09:30" → ["09", "30"]
  const hours = Number(parts[0]);       // "09" → 9
  const minutes = Number(parts[1]);     // "30" → 30
  // Number.isNaN() で数値変換に失敗した場合を判定（NaN = Not a Number）
  const result = (Number.isNaN(hours) ? 0 : hours) * 60 + (Number.isNaN(minutes) ? 0 : minutes);
  timeToMinutesCache.set(time, result);
  return result;
}

// --- 時間 ⇔ ピクセル位置の変換 ---
// ガントチャートでは「時間」と「画面上の横位置（ピクセル）」を相互変換する必要がある。
// 例: "10:00" のシフトは画面のどこに表示すべきか？
//     ユーザーが画面のX=200pxをクリックしたら何時何分か？

// timePositionCache: timeToPosition の結果をキャッシュ
const timePositionCache = new Map<string, number>();

/**
 * 時間文字列("HH:MM")を、15分刻みグリッド上の位置番号に変換する。
 *
 * 計算の流れ:
 *   1. 時間文字列をhours, minutesに分解
 *   2. シフト開始時刻（例: 9:00）からの経過分を計算
 *   3. 15分 = 1マスなので、経過分÷15 で位置を求める
 *
 * 例: START_HOUR = 9 の場合
 *   "09:00" → (9-9)*60+0 = 0 → 0/15 = 0（左端）
 *   "10:30" → (10-9)*60+30 = 90 → 90/15 = 6（左から6マス目）
 *
 * @param time - "HH:MM" 形式の時間文字列
 * @returns グリッド上の位置番号（0始まり）
 */
export function timeToPosition(time: string): number {
  if (timePositionCache.has(time)) {
    return timePositionCache.get(time)!;
  }

  // .split(":").map(Number) は文字列を分割して各要素を数値に変換する
  // 例: "10:30".split(":") → ["10", "30"] → .map(Number) → [10, 30]
  const [hours, minutes] = time.split(":").map(Number);
  // ?? 0 は「nullish coalescing」。hours が null か undefined なら 0 を使う。
  const totalMinutesFromStart = ((hours ?? 0) - SHIFT_HOURS.START_HOUR_INCLUSIVE) * 60 + (minutes ?? 0);
  const result = totalMinutesFromStart / 15; // 15分で1マス
  timePositionCache.set(time, result);
  return result;
}

/**
 * グリッド上の位置番号を時間文字列("HH:MM")に逆変換する。
 * ユーザーが空白部分をクリックした時に「何時のシフトを追加するか」を決定するのに使う。
 *
 * @param position - グリッド上の位置番号
 * @param timeGrid - 動的グリッドの場合の時間ラベル配列（省略時は15分刻みで計算）
 * @returns "HH:MM" 形式の時間文字列
 */
export function positionToTime(position: number, timeGrid?: string[]): string {
  if (!timeGrid) {
    // timeGridが未指定の場合: 15分刻みの標準ロジック
    const totalMinutesFromStart = Math.round(position) * 15;                // 位置→経過分
    const hours = Math.floor(totalMinutesFromStart / 60) + SHIFT_HOURS.START_HOUR_INCLUSIVE; // 経過分→時
    const minutes = totalMinutesFromStart % 60;                             // 経過分→分（余り）
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  // 動的グリッドでの位置計算（timeGrid配列のインデックスとして使用）
  const index = Math.floor(position);
  if (index >= 0 && index < timeGrid.length) {
    return timeGrid[index] ?? "00:00"; // ?? は null/undefined の場合のフォールバック
  }

  // インデックスが範囲外の場合は最初または最後の時間を返す
  const fallbackStart = `${String(SHIFT_HOURS.START_HOUR_INCLUSIVE).padStart(2, "0")}:00`;
  const fallbackEnd = `${SHIFT_HOURS.END_HOUR_INCLUSIVE}:00`;
  // .at(-1) は配列の最後の要素を取得するメソッド
  return index < 0 ? (timeGrid[0] ?? fallbackStart) : (timeGrid.at(-1) ?? fallbackEnd);
}
