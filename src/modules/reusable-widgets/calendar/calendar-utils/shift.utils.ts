/**
 * @file shift.utils.ts
 * @description シフト関連のユーティリティ関数を提供するファイル。
 *              ステータスの色・テキスト変換、日付色判定、時間文字列パースなど。
 *              calendar.utils.ts と同じ関数を含みつつ、parseTimeString を追加している。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: @/common/common-models/ModelIndex（ShiftStatus 型）,
//              @/common/common-theme/ThemeColors（カラーテーマ）,
//              ../constants（祝日データ）
// インポート先: ShiftDetails.tsx（parseTimeString を使用）

import { ShiftStatus } from "@/common/common-models/ModelIndex";
import { colors } from "@/common/common-theme/ThemeColors";
import { HOLIDAYS } from "../constants";

/**
 * getStatusText - ステータスを日本語テキストに変換する
 * ※ calendar.utils.ts にも同じ関数がある。使い分けはインポート先の都合による。
 */
export const getStatusText = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "下書き";
    case "pending":
      return "申請中";
    case "approved":
      return "承認済";
    case "rejected":
      return "却下";
    case "deletion_requested":
      return "削除申請中";
    case "deleted":
      return "削除済";
    default:
      return "";
  }
};

/**
 * getStatusColor - ステータスに応じた色を返す
 * ※ calendar.utils.ts にも同じ関数がある
 */
export const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "#B0BEC5";
    case "approved":
      return "#4CAF50";
    case "pending":
      return "#FFC107";
    case "deleted":
      return "#F44336";
    case "rejected":
      return "#ffcdd2";
    case "completed":
      return "#4CAF50";
    case "deletion_requested":
      return "#FFA500";
    case "recruitment":
      return "#9e9e9e";
    default:
      return "#9E9E9E";
  }
};

/**
 * getDayColor - 日付テキストの色を返す
 * ※ calendar.utils.ts にも同じ関数がある
 */
export const getDayColor = (
  date: string | undefined,
  state?: string,
  isSelected?: boolean
) => {
  if (!date || state === "disabled") return "#d9e1e8";

  const day = new Date(date).getDay();
  if (day === 0 || HOLIDAYS[date]) return "#f44336";
  if (state === "today") return "#2196F3";
  return colors.text.primary; // その他の日付
};

/**
 * parseTimeString
 *
 * 日付文字列と時間文字列を組み合わせてDateオブジェクトを生成する関数。
 * ShiftDetails コンポーネントで、シフトの開始/終了時刻を Date 型に変換する際に使う。
 *
 * 処理ステップ:
 *   1. dateStr から Date オブジェクトを作成
 *   2. 不正な日付（NaN）の場合は現在日時をベースにする（フォールバック処理）
 *   3. timeStr を ":" で分割して時・分を取得
 *   4. setHours() で時・分を設定。秒とミリ秒は0に固定
 *   5. 完成した Date オブジェクトを返す
 *
 * Number.isNaN() について:
 *   - NaN は "Not a Number"（数値ではない）を意味する特殊な値
 *   - new Date("invalid").getTime() は NaN を返す
 *   - Number.isNaN() でそれを判定できる
 *
 * @param dateStr - 日付文字列（例: "2026-03-10"）。不正な値の場合は現在日時を使う
 * @param timeStr - 時間文字列（例: "09:30"）
 * @returns 日付と時間が設定された Date オブジェクト
 */
export function parseTimeString(dateStr: string, timeStr: string): Date {
  // ステップ1: 日付文字列からDateオブジェクトを作成
  const date = new Date(dateStr);

  // ステップ2: 不正な日付の場合は現在日時を使う（三項演算子でフォールバック）
  const base = Number.isNaN(date.getTime()) ? new Date() : date;

  // ステップ3: "09:30" → ["09", "30"] に分割
  const parts = timeStr.split(":");

  // ステップ4: 文字列を数値に変換。Number("09") → 9
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  // ステップ5: 時・分をセット。NaN の場合は 0 をデフォルトにする
  // setHours(hours, minutes, seconds, milliseconds) の4引数形式
  base.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);

  return base;
}
