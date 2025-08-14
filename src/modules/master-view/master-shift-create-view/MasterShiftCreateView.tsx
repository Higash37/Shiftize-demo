import React from "react";
import { MasterShiftCreate } from "../../reusable-widgets/master-shift-management/MasterShiftCreate";
import type { MasterShiftCreateViewProps } from "./MasterShiftCreateView.types";

export const MasterShiftCreateView: React.FC<MasterShiftCreateViewProps> = ({
  mode,
  shiftId,
  date,
  startTime,
  endTime,
  classes,
}) => {
  return (
    <MasterShiftCreate
      mode={mode}
      shiftId={shiftId}
      date={date}
      startTime={startTime}
      endTime={endTime}
      classes={classes}
    />
  );
};
