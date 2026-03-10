/**
 * @file user/today.tsx
 * @description ユーザー向けの当日スケジュール画面。
 *
 * DailyTaskGanttView コンポーネントを readOnly モードで表示する。
 * readOnly: ユーザーはタスクの閲覧のみ可能（編集はマスターのみ）。
 */

import React from "react";
// DailyTaskGanttView: 当日のタスクをガントチャート形式で表示するコンポーネント
import { DailyTaskGanttView } from "@/modules/master-view/todayView/DailyTaskGanttView";

/**
 * UserTodayScreen: ユーザー向け当日スケジュール画面。
 * readOnly prop を渡して閲覧専用にする。
 */
export default function UserTodayScreen() {
  return <DailyTaskGanttView readOnly />;
}
