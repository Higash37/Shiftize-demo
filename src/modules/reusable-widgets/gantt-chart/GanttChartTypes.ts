/** @file GanttChartTypes.ts
 *  @description ガントチャート全体で使う共通の型定義をまとめたファイル。
 *    他のファイルがシフトステータス関連の型を使うとき、ここからimportする。
 */

// 【このファイルの位置づけ】
// - import元: model-shift/shiftTypes（アプリ全体のシフト型定義）
// - importされる先: GanttChartMonthView, components, ShiftModalRenderer など
//   ガントチャート配下のほぼ全ファイルがこのファイル経由でステータス型を使う。
// - 役割: shiftTypes から必要な型だけを「再エクスポート」する中継地点。
//   こうすることで、ガントチャート内のファイルは import先を1箇所に統一できる。

import {
  ShiftStatusConfig,  // ShiftStatusConfig型: シフトのステータス（承認済み・申請中など）ごとの設定を表すインターフェース
  ShiftStatus,        // ShiftStatus型: "approved" | "pending" | "rejected" など、シフトステータスの文字列リテラル型
} from "@/common/common-models/model-shift/shiftTypes";

// 外部で使用するために再エクスポート
// export { X } は、このファイルをimportした側で X を使えるようにする構文。
// 例: import { ShiftStatusConfig } from "./GanttChartTypes" と書ける。
export { ShiftStatusConfig, ShiftStatus };
