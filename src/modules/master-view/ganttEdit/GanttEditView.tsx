import React from "react";
import { View, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { GanttChartMonthView } from "@/modules/child-components/gantt-chart/GanttChartMonthView";
import { ShiftEditCardView } from "../ganttView/ShiftEditCardView";
import { ganttEditViewStyles as styles } from "./GanttEditView.styles";
import type { GanttEditViewProps } from "./GanttEditView.types";

export const GanttEditView: React.FC<GanttEditViewProps> = ({
  shifts,
  users,
  days,
  currentYearMonth,
  onMonthChange,
  onShiftUpdate,
  onShiftPress,
  onTimeChange,
  onShiftSave,
  onShiftDelete,
  refreshPage,
}) => {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  return (
    <View
      style={styles.container}
      // @ts-ignore Web only prop
      className="gantt-container"
    >
      <MasterHeader title="シフト編集" />
      <Stack.Screen
        options={{
          title: "シフト編集",
          headerShown: false,
        }}
      />

      {/* レスポンシブ表示切り替え */}
      {isTabletOrDesktop ? (
        // タブレット・デスクトップ: ガントチャート表示
        <GanttChartMonthView
          shifts={shifts}
          days={days}
          users={users}
          selectedDate={
            new Date(currentYearMonth.year, currentYearMonth.month, 1)
          }
          onShiftPress={onShiftPress}
          onShiftUpdate={onShiftUpdate}
          onMonthChange={onMonthChange}
          onTimeChange={onTimeChange}
          classTimes={[]}
          refreshPage={refreshPage}
        />
      ) : (
        // スマホ: カード表示
        <ShiftEditCardView
          shifts={shifts}
          users={users}
          days={days}
          currentYearMonth={currentYearMonth}
          onMonthChange={onMonthChange}
          onShiftUpdate={onShiftUpdate}
          onShiftPress={onShiftPress}
          onShiftSave={onShiftSave}
          onShiftDelete={onShiftDelete}
        />
      )}
    </View>
  );
};
