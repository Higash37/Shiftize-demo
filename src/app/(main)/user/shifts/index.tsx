import React from "react";
import { UserShiftList } from "../../../../modules/user-view/user-shift-forms/user-shift-list/ShiftListView";


export default function UserShiftsScreen() {
  return (
    <>
      <UserShiftList />
    </>
  );
}

export const screenOptions = {
  title: "シフト一覧",
};
