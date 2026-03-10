/**
 * @file wageCalculator.ts
 * @description 給与計算用ユーティリティ関数群。
 *              時間文字列の変換、勤務時間計算、給与計算、時間重複判定を提供する。
 *
 * 【このファイルの位置づけ】
 * - シフトの時間データから給与額を計算するための純粋関数群
 * - ガントチャートや給与一覧画面から呼び出される
 * - TimeSegmentType（時間区分タイプ）に応じた給与モード切り替えに対応
 * - 関連ファイル: shiftTypes.ts（TimeSegmentType型）, ガントチャート関連コンポーネント
 *
 * 【時間文字列の形式】
 * このファイルでは "HH:mm" 形式の文字列を使用する。
 * 例: "09:00", "13:30", "22:00"
 *
 * 【給与計算の基本ロジック】
 * 1. シフトの開始時間〜終了時間から総勤務分数を計算
 * 2. 途中時間（授業等）の中で除外対象（wageMode="exclude"）を差し引く
 * 3. 残りの勤務分数に時給を掛けて給与額を算出
 * 4. 別単価モード（wageMode="custom_rate"）は別途加算
 */

/**
 * timeStringToMinutes - "HH:mm" 形式の時間文字列を分数に変換する
 *
 * 【処理の詳細】
 * "13:30" → 13 * 60 + 30 = 810分
 *
 * 【split(":") の動作】
 * 文字列をコロンで分割して配列にする: "13:30" → ["13", "30"]
 *
 * 【分割代入（Destructuring）】
 * const [hoursStr, minutesStr] = ... → 配列の1番目を hoursStr、2番目を minutesStr に代入
 *
 * @param timeString - "HH:mm" 形式の時間文字列
 * @returns 分数（0時0分からの経過分数）
 * @throws TypeError 無効な時間形式の場合
 */
export const timeStringToMinutes = (timeString: string): number => {
  // "13:30" → ["13", "30"] に分割
  const [hoursStr, minutesStr] = timeString.split(":");
  // Number() → 文字列を数値に変換。"13" → 13
  // 三項演算子 ? : → hoursStr が存在すれば Number(hoursStr)、なければ 0
  const hours = hoursStr ? Number(hoursStr) : 0;
  const minutes = minutesStr ? Number(minutesStr) : 0;

  // Number.isNaN() → 値がNaN（数値でない）かチェック
  // Number("abc") は NaN を返すため、このチェックが必要
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new TypeError("Invalid time format");
  }

  // 時間を分に換算: 13時間 * 60分 + 30分 = 810分
  return hours * 60 + minutes;
};

/**
 * minutesToTimeString - 分数を "HH:mm" 形式の時間文字列に変換する
 *
 * 【padStart(2, "0") の動作】
 * 文字列が指定長さに満たない場合、先頭に指定文字を追加する。
 * "9".padStart(2, "0") → "09"
 * "13".padStart(2, "0") → "13"（既に2文字なのでそのまま）
 *
 * @param minutes - 分数
 * @returns "HH:mm" 形式の時間文字列
 */
export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);  // Math.floor → 小数点以下を切り捨て
  const mins = minutes % 60;                // % → 剰余演算子。60で割った余り
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * calculateMinutesBetween - 2つの時間間の分数を計算する
 *
 * 【日跨ぎ対応】
 * 開始時間が23:00、終了時間が01:00の場合、単純な引き算だと負の値になる。
 * この場合は翌日とみなし、24時間（1440分）を加算して計算する。
 * 23:00→01:00 = (24*60 - 23*60) + 1*60 = 60 + 60 = 120分
 *
 * @param startTime - 開始時間（"HH:mm" 形式）
 * @param endTime - 終了時間（"HH:mm" 形式）
 * @returns 分数
 */
export const calculateMinutesBetween = (
  startTime: string,
  endTime: string
): number => {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);

  // 終了時間が開始時間より前（日跨ぎ）の場合
  if (endMinutes < startMinutes) {
    // 24時間（1440分）から開始時間を引き、終了時間を足す
    return 24 * 60 - startMinutes + endMinutes;
  }

  return endMinutes - startMinutes;
};

/**
 * calculateDurationHours - 2つの時間間の時間数を計算する（小数第1位まで）
 *
 * 【Math.round((x) * 10) / 10 の意味】
 * 小数第1位で四捨五入するテクニック。
 * 例: 2.166... → 2.166... * 10 = 21.66... → Math.round → 22 → 22 / 10 = 2.2
 *
 * @param startTime - 開始時間（"HH:mm" 形式）
 * @param endTime - 終了時間（"HH:mm" 形式）
 * @returns 時間数（小数第1位まで）
 */
export const calculateDurationHours = (
  startTime: string,
  endTime: string
): number => {
  const minutes = calculateMinutesBetween(startTime, endTime);
  return Math.round((minutes / 60) * 10) / 10;
};

/**
 * compareByStartTime - 開始時間でソートするための比較関数
 *
 * Array.sort() に直接渡せる形式。
 *
 * 【localeCompare の動作】
 * 文字列を辞書順で比較し、以下を返す:
 * - 負の値: a < b
 * - 0:      a === b
 * - 正の値: a > b
 * "HH:mm" 形式の場合、辞書順 = 時間順になるため正しくソートされる。
 *
 * @param a - 比較元オブジェクト（startTimeプロパティ必須）
 * @param b - 比較先オブジェクト（startTimeプロパティ必須）
 * @returns 比較結果（-1, 0, 1）
 */
export const compareByStartTime = (
  a: { startTime: string },
  b: { startTime: string }
): number => {
  return a.startTime.localeCompare(b.startTime);
};

/**
 * compareByDateThenTime - 日付→開始時間の順でソートするための比較関数
 *
 * まず日付で比較し、同じ日付の場合は開始時間で比較する。
 *
 * @param a - 比較元オブジェクト
 * @param b - 比較先オブジェクト
 * @returns 比較結果
 */
export const compareByDateThenTime = (
  a: { date: string; startTime: string },
  b: { date: string; startTime: string }
): number => {
  const dateCompare = a.date.localeCompare(b.date);
  if (dateCompare !== 0) return dateCompare; // 日付が異なれば日付で決定
  return a.startTime.localeCompare(b.startTime); // 同じ日付なら時間で決定
};

/**
 * calculateWage - 時給と労働分数から給与を計算する
 *
 * @param hourlyWage - 時給（円）
 * @param minutes - 労働時間（分）
 * @returns 給与額（円、小数を含む場合あり）
 */
export const calculateWage = (hourlyWage: number, minutes: number): number => {
  // 分を時間に変換してから時給を掛ける
  return hourlyWage * (minutes / 60);
};

/**
 * calculateShiftWage - シフト情報から給与を計算する（シンプル版）
 *
 * 途中時間を考慮しない単純な計算。
 * デフォルト時給は1100円。
 *
 * @param shift - シフト情報（startTime, endTime）
 * @param hourlyWage - 時給（デフォルト: 1100円）
 * @returns { minutes: 勤務分数, wage: 給与額 }
 */
export const calculateShiftWage = (
  shift: { startTime: string; endTime: string },
  hourlyWage: number = 1100
): { minutes: number; wage: number } => {
  const minutes = calculateMinutesBetween(shift.startTime, shift.endTime);
  const wage = calculateWage(hourlyWage, minutes);

  return {
    minutes,
    wage,
  };
};

/**
 * isTimeOverlapping - 2つの時間範囲が重複しているかを判定する
 *
 * 【重複判定のロジック】
 * 2つの範囲 [A開始, A終了] と [B開始, B終了] が重複する条件:
 * - A開始 <= B開始 < A終了 （BがAの中で始まる）
 * - または B開始 <= A開始 < B終了 （AがBの中で始まる）
 *
 * 【日跨ぎ対応】
 * 終了時間が開始時間より前（例: 23:00-01:00）の場合、
 * 終了時間に24時間（1440分）を加算して計算する。
 *
 * @param range1Start - 範囲1の開始時間
 * @param range1End - 範囲1の終了時間
 * @param range2Start - 範囲2の開始時間
 * @param range2End - 範囲2の終了時間
 * @returns 重複している場合 true
 */
export const isTimeOverlapping = (
  range1Start: string,
  range1End: string,
  range2Start: string,
  range2End: string
): boolean => {
  const r1Start = timeStringToMinutes(range1Start);
  const r1End = timeStringToMinutes(range1End);
  const r2Start = timeStringToMinutes(range2Start);
  const r2End = timeStringToMinutes(range2End);

  // 日跨ぎの場合の調整（終了 < 開始 → 24時間を加算）
  const r1EndAdjusted = r1End < r1Start ? r1End + 24 * 60 : r1End;
  const r2EndAdjusted = r2End < r2Start ? r2End + 24 * 60 : r2End;

  // 重複判定: どちらかの開始がもう一方の範囲内にあるか
  return (
    (r1Start <= r2Start && r2Start < r1EndAdjusted) ||
    (r2Start <= r1Start && r1Start < r2EndAdjusted)
  );
};

/**
 * calculateOverlapMinutes - 2つの時間範囲の重複分数を計算する
 *
 * 重複していない場合は0を返す。
 * 重複部分の開始は2つの範囲の開始の遅い方、終了は早い方。
 *
 * @param range1Start - 範囲1の開始時間
 * @param range1End - 範囲1の終了時間
 * @param range2Start - 範囲2の開始時間
 * @param range2End - 範囲2の終了時間
 * @returns 重複分数（重複していない場合は0）
 */
export const calculateOverlapMinutes = (
  range1Start: string,
  range1End: string,
  range2Start: string,
  range2End: string
): number => {
  const r1Start = timeStringToMinutes(range1Start);
  const r1End = timeStringToMinutes(range1End);
  const r2Start = timeStringToMinutes(range2Start);
  const r2End = timeStringToMinutes(range2End);

  // 日跨ぎの調整
  const r1EndAdjusted = r1End < r1Start ? r1End + 24 * 60 : r1End;
  const r2EndAdjusted = r2End < r2Start ? r2End + 24 * 60 : r2End;

  // 重複していない場合は0
  if (r1EndAdjusted <= r2Start || r2EndAdjusted <= r1Start) {
    return 0;
  }

  // 重複部分: 開始は遅い方、終了は早い方
  // Math.max → 2つの値のうち大きい方を返す
  // Math.min → 2つの値のうち小さい方を返す
  const overlapStart = Math.max(r1Start, r2Start);
  const overlapEnd = Math.min(r1EndAdjusted, r2EndAdjusted);

  return overlapEnd - overlapStart;
};

import type { TimeSegmentType } from "@/common/common-models/model-shift/shiftTypes";

/**
 * calculateWorkMinutesExcludingClasses - 途中時間を除外した実労働時間を計算する
 *
 * 【給与モード（wageMode）の種類】
 * - "exclude": 給与計算から除外（デフォルト）。この時間分は給与に含まれない
 * - "include": 通常勤務扱い。シフト時間に含まれるので追加計算不要
 * - "custom_rate": 別単価で計算。通常時給とは異なる時給で計算する
 *
 * 【計算の流れ】
 * 1. シフト全体の分数を計算
 * 2. 各途中時間のうち、wageMode="exclude" のものの重複分数を合計
 * 3. 全体の分数から除外分数を引いた値が実労働時間
 *
 * @param shift - シフト情報（startTime, endTime）
 * @param classes - 途中時間の配列（授業等）
 * @param typesMap - TimeSegmentTypeのIDをキーとした辞書（wageMode参照用）
 * @returns 実労働分数（除外後）
 */
export const calculateWorkMinutesExcludingClasses = (
  shift: { startTime: string; endTime: string },
  classes: Array<{ startTime: string; endTime: string; typeId?: string }> = [],
  typesMap?: Record<string, TimeSegmentType>
): number => {
  // シフト全体の分数
  const totalShiftMinutes = calculateMinutesBetween(
    shift.startTime,
    shift.endTime
  );

  if (!classes || classes.length === 0) {
    return totalShiftMinutes; // 途中時間がなければ全体が実労働時間
  }

  let totalOverlapMinutes = 0;

  for (const classTime of classes) {
    // TimeSegmentType マップからタイプ情報を取得
    const segType = classTime.typeId ? typesMap?.[classTime.typeId] : undefined;
    // wageMode を取得（デフォルトは "exclude"）
    // ?? → nullish合体演算子。左辺がnull/undefinedの場合のみ右辺を使用
    const wageMode = segType?.wageMode ?? "exclude";

    // "include"モード（通常勤務扱い）の場合はスキップ（除外しない）
    if (wageMode === "include") continue;

    // シフト時間と途中時間が重複している場合のみ、重複分数を加算
    if (
      isTimeOverlapping(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      )
    ) {
      const overlapMinutes = calculateOverlapMinutes(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      );
      totalOverlapMinutes += overlapMinutes;
    }
  }

  // シフト全体 - 除外対象の途中時間 = 実労働時間
  return totalShiftMinutes - totalOverlapMinutes;
};

/**
 * calculateTotalWage - シフト情報と途中時間から総給与を計算する
 *
 * 【給与計算の全体フロー】
 * 1. 通常勤務分（途中時間除外後）の給与を計算
 * 2. 各途中時間のwageModeに応じて詳細を記録:
 *    - exclude: 0円（除外）
 *    - include: 通常勤務に含まれている（既に計算済み）
 *    - custom_rate: 別単価で計算して加算
 * 3. 最終的な給与額を円単位で四捨五入
 *
 * @param shift - シフト情報（startTime, endTime, classes）
 * @param hourlyWage - 時給（デフォルト: 1100円）
 * @param typesMap - TimeSegmentTypeの辞書
 * @returns { totalMinutes: 実労働分数, totalWage: 総給与(円), details: 内訳配列 }
 */
export const calculateTotalWage = (
  shift: {
    startTime: string;
    endTime: string;
    classes?: Array<{ startTime: string; endTime: string; typeId?: string; typeName?: string }>;
  },
  hourlyWage: number = 1100,
  typesMap?: Record<string, TimeSegmentType>
): {
  totalMinutes: number;
  totalWage: number;
  details: { type: string; minutes: number; wage: number }[];
} => {
  // ステップ1: 通常勤務分（除外後）の分数と給与を計算
  const workMinutes = calculateWorkMinutesExcludingClasses(
    shift,
    shift.classes || [],
    typesMap
  );
  let totalWage = calculateWage(hourlyWage, workMinutes);

  // 内訳の詳細配列を構築
  const details: { type: string; minutes: number; wage: number }[] = [
    {
      type: "シフト（途中時間除外後）",
      minutes: workMinutes,
      wage: calculateWage(hourlyWage, workMinutes),
    },
  ];

  // ステップ2: 各途中時間のwageModeに応じて内訳を追加
  if (shift.classes && shift.classes.length > 0) {
    for (const classTime of shift.classes) {
      // シフト範囲外の途中時間はスキップ
      if (
        !isTimeOverlapping(
          shift.startTime,
          shift.endTime,
          classTime.startTime,
          classTime.endTime
        )
      ) continue;

      const segType = classTime.typeId ? typesMap?.[classTime.typeId] : undefined;
      const wageMode = segType?.wageMode ?? "exclude";
      const typeName = segType?.name || classTime.typeName || "授業";
      const classMinutes = calculateOverlapMinutes(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      );

      if (wageMode === "exclude") {
        // 除外モード: 0円として内訳に追加
        details.push({ type: `${typeName}（除外）`, minutes: classMinutes, wage: 0 });
      } else if (wageMode === "include") {
        // 通常勤務含むモード: 通常時給で内訳に追加（既にtotalWageに含まれている）
        details.push({ type: `${typeName}（含む）`, minutes: classMinutes, wage: calculateWage(hourlyWage, classMinutes) });
      } else if (wageMode === "custom_rate") {
        // 別単価モード: カスタムレートで計算して totalWage に加算
        const customWage = calculateWage(segType?.customRate ?? 0, classMinutes);
        totalWage += customWage;
        details.push({ type: `${typeName}（別単価 ¥${segType?.customRate ?? 0}/時）`, minutes: classMinutes, wage: customWage });
      }
    }
  }

  return {
    totalMinutes: workMinutes,
    totalWage: Math.round(totalWage), // Math.round → 四捨五入して整数（円単位）にする
    details,
  };
};
