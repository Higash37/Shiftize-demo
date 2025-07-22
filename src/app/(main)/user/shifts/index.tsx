import React from "react";
import { UserShiftList } from "../../../../modules/user-view/shift-ui-components/shiftList/ShiftListView";


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
