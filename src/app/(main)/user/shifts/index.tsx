/**
 * @file user/shifts/index.tsx
 * @description ユーザーのシフト一覧画面。
 *
 * UserShiftList コンポーネントにシフト一覧の表示を委譲する。
 * screenOptions でナビゲーションバーのタイトルを設定する。
 */

import React from "react";
// UserShiftList: ユーザーのシフト一覧表示コンポーネント
import { UserShiftList } from "../../../../modules/user-view/user-shift-forms/user-shift-list/ShiftListView";

/**
 * UserShiftsScreen: シフト一覧画面。
 * Fragment (<>) で囲んで UserShiftList を表示する。
 */
export default function UserShiftsScreen() {
  return (
    <>
      <UserShiftList />
    </>
  );
}

/** Expo Router のスクリーンオプション */
export const screenOptions = {
  title: "シフト一覧",
};
