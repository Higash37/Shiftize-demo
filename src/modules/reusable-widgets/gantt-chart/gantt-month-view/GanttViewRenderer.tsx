import React from "react";
import { View } from "react-native";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { GanttChartBody } from "../gantt-chart-common/GanttChartBody";
import { CalendarView } from "../gantt-chart-common/CalendarView";
import { MobileVerticalView } from "../gantt-chart-common/MobileVerticalView";
import { GoogleCalendarView } from "../gantt-chart-common/GoogleCalendarView";
import { GanttState, GanttDimensions, GanttHandlers } from "./types";

interface GanttViewRendererProps {
  state: GanttState;
  dimensions: GanttDimensions;
  handlers: GanttHandlers;
  shifts: ShiftItem[];
  days: string[];
  users: Array<{ uid: string; nickname: string; color?: string }>;
  shouldUseCompactView: boolean;
  onShiftUpdate?: () => void;
}

export const GanttViewRenderer: React.FC<GanttViewRendererProps> = ({
  state,
  dimensions,
  handlers,
  shifts,
  days,
  users,
  shouldUseCompactView,
  onShiftUpdate,
}) => {
  const {
    viewMode,
    deviceType,
    useGoogleLayout,
    colorMode,
    selectedDate,
  } = state;

  const commonProps = {
    shifts,
    days,
    users,
    selectedDate,
    colorMode,
    onShiftPress: handlers.onShiftPress,
    onAddShift: handlers.onAddShift,
    onShiftUpdate,
  };

  // モバイルデバイスの場合
  if (deviceType === "mobile") {
    return (
      <MobileVerticalView
        {...commonProps}
        showControls={true}
        onViewModeChange={handlers.onViewModeChange}
        currentViewMode={viewMode}
      />
    );
  }

  // コンパクトビューの場合
  if (shouldUseCompactView) {
    return (
      <MobileVerticalView
        {...commonProps}
        showControls={false}
        onViewModeChange={handlers.onViewModeChange}
        currentViewMode="compact"
      />
    );
  }

  // ビューモードに応じた表示
  switch (viewMode) {
    case "calendar":
      if (useGoogleLayout) {
        return (
          <GoogleCalendarView
            {...commonProps}
            classTimes={[]}
          />
        );
      } else {
        return (
          <CalendarView
            {...commonProps}
            classTimes={[]}
          />
        );
      }

    case "gantt":
    default:
      return (
        <GanttChartBody
          {...commonProps}
          dateColumnWidth={dimensions.dateColumnWidth}
          infoColumnWidth={dimensions.infoColumnWidth}
          ganttColumnWidth={dimensions.ganttColumnWidth}
          classTimes={[]}
        />
      );
  }
};