import React from "react";
import { useLocalSearchParams } from "expo-router";
import { MasterShiftCreateView } from "@/modules/master-view/master-shift-create-view";

export default function MasterShiftCreateScreen() {
  const { mode, shiftId, date, startTime, endTime, classes } =
    useLocalSearchParams();
  return (
    <MasterShiftCreateView
      mode={(mode as string) === "edit" ? "edit" : "create"}
      shiftId={shiftId as string}
      date={date as string}
      startTime={startTime as string}
      endTime={endTime as string}
      classes={classes as string}
    />
  );
}
