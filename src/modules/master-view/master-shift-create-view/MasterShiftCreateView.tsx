/**
 * @file MasterShiftCreateView.tsx
 * @description シフト作成画面の薄いラッパー。MasterShiftCreate コンポーネントを描画する。
 *
 * 【このファイルの位置づけ】
 *   master-view > master-shift-create-view 配下の画面コンポーネント。
 *   マスターの「シフト作成」タブで描画される。
 *   実際のフォームロジックは reusable-widgets/master-shift-management/MasterShiftCreate に委譲。
 */
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
      shiftId={shiftId ?? ""}
      date={date ?? ""}
      startTime={startTime ?? ""}
      endTime={endTime ?? ""}
      classes={classes ?? ""}
    />
  );
};
