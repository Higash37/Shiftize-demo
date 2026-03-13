/**
 * @file calendar.utils.ts
 * @description シフトのステータス表示と日付の色判定に関するユーティリティ関数を提供するファイル。
 *              カレンダーUI全般で「ステータスに応じたテキスト・色」を統一的に扱うために使う。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: @/common/common-models/ModelIndex（ShiftStatus 型）,
//              @/common/common-theme/ThemeColors（カラーテーマ）,
//              ../constants（祝日データ）
// インポート先: ShiftList.tsx, DayComponent.styles.ts など

// ShiftStatus はシフトの状態を表すユニオン型（例: "draft" | "pending" | "approved" | ...）
import { ShiftStatus } from "@/common/common-models/ModelIndex";
// colors はアプリ全体で使うカラーテーマオブジェクト
import { colors } from "@/common/common-theme/ThemeColors";
// HOLIDAYS は日本の祝日データ（Proxy経由で動的取得）
import { HOLIDAYS } from "../constants";

/**
 * getStatusText
 *
 * シフトのステータス（英語の内部値）を日本語表示用テキストに変換する関数。
 *
 * @param status - シフトのステータス値（ShiftStatus 型）
 * @returns 日本語のステータス文字列。該当しない場合は空文字列 ""
 *
 * switch 文は、status の値に応じて処理を分岐する。
 * case に一致したら return で値を返し、どれにも一致しなければ default に進む。
 */
export const getStatusText = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "下書き";              // まだ提出されていない状態
    case "pending":
      return "申請中";              // 承認待ちの状態
    case "approved":
      return "承認済";              // 管理者に承認された状態
    case "rejected":
      return "却下";                // 管理者に却下された状態
    case "deletion_requested":
      return "削除申請中";          // 削除リクエスト中
    case "deleted":
      return "削除済";              // 削除された状態
    default:
      return "";                    // 上記以外のステータスの場合は空文字
  }
};

/**
 * getStatusColor
 *
 * シフトのステータスに基づいて表示色（16進カラーコード）を返す関数。
 * UIでステータスに応じた色分けを行うために使う。
 *
 * @param status - シフトのステータス値
 * @returns カラーコード文字列（例: "#4CAF50"）
 */
export const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "#B0BEC5";   // グレー系: 下書き
    case "approved":
      return "#4CAF50";   // 緑: 承認済み
    case "pending":
      return "#FFC107";   // 黄色: 申請中（注目を引く色）
    case "deleted":
      return "#F44336";   // 赤: 削除済み
    case "rejected":
      return "#ffcdd2";   // 薄い赤: 却下
    case "completed":
      return "#4CAF50";   // 緑: 完了（承認済みと同じ色）
    case "deletion_requested":
      return "#FFC107";   // 黄色: 削除申請中（pending と同色）
    case "recruitment":
      return "#9e9e9e";   // グレー: 募集シフト
    default:
      return "#9E9E9E";   // グレー: デフォルト
  }
};

/**
 * getDayColor
 *
 * カレンダーの日付テキストの色を決定する関数。
 * 日曜・祝日は赤、今日は青、それ以外は通常色にする。
 *
 * 処理ステップ:
 *   1. date が undefined または disabled なら薄いグレーを返す（早期リターン）
 *   2. new Date(date).getDay() で曜日番号を取得（0=日曜, 6=土曜）
 *   3. 日曜(0)または祝日なら赤を返す
 *   4. 今日なら青を返す
 *   5. それ以外は通常のテキスト色を返す
 *
 * @param date       - 日付文字列（例: "2026-03-10"）。undefined の可能性あり
 *                     `string | undefined` はユニオン型で「stringかundefinedのどちらか」
 * @param state      - カレンダーライブラリが設定する状態（"disabled", "today" など）
 * @param isSelected - 選択中かどうか（現時点では未使用だが将来の拡張用に引数に含まれている）
 * @returns カラーコード文字列
 */
export const getDayColor = (
  date: string | undefined,
  state?: string,
  isSelected?: boolean
) => {
  // 早期リターン: date がない、または無効化された日付なら薄いグレー
  if (!date || state === "disabled") return "#d9e1e8";

  // getDay() は 0（日曜）〜 6（土曜）を返す
  const day = new Date(date).getDay();

  // 日曜日(day===0) または祝日なら赤色
  if (day === 0 || HOLIDAYS[date]) return "#f44336";

  // 今日の日付なら青色
  if (state === "today") return "#2196F3";

  // それ以外（平日）はテーマの通常テキスト色
  return colors.text.primary; // その他の日付
};
