/**
 * @file master/today.tsx
 * @description マスター向けの当日スケジュール画面。
 *
 * DailyTaskGanttView コンポーネントを編集可能モードで表示する。
 * readOnly を渡さない（デフォルト: false）ので、マスターはタスクの編集が可能。
 */

import React from "react";
// DailyTaskGanttView: 当日のタスクをガントチャート形式で表示するコンポーネント
import { DailyTaskGanttView } from "@/modules/master-view/todayView/DailyTaskGanttView";

/**
 * MasterTodayScreen: マスター向け当日スケジュール画面。
 * readOnly なしのため、タスクの追加・編集・削除が可能。
 */
export default function MasterTodayScreen() {
  return <DailyTaskGanttView />;
}
