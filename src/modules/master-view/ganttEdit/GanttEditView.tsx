import React, { Suspense, lazy } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ganttEditViewStyles as styles } from "./GanttEditView.styles";
import type { GanttEditViewProps } from "./GanttEditView.types";

// GanttChartMonthViewを遅延読み込み
const GanttChartMonthView = lazy(() => 
  import("@/modules/reusable-widgets/gantt-chart/GanttChartMonthView").then(module => ({ default: module.GanttChartMonthView }))
);

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

      {/* ガントチャート表示（スマホでは自動的にMobileVerticalViewに切り替わる） */}
      <Suspense fallback={
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      }>
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
          onTimeChange={onTimeChange || (() => {})}
          classTimes={[]}
          refreshPage={refreshPage || (() => {})}
        />
      </Suspense>
    </View>
  );
};
