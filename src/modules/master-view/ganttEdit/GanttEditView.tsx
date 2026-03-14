/**
 * @file GanttEditView.tsx
 * @description シフト編集画面のラッパーコンポーネント。GanttChartMonthView を
 *   編集モードで表示する。
 *
 * 【このファイルの位置づけ】
 *   master-view > ganttEdit 配下の画面コンポーネント。
 *   マスターユーザーの「シフト編集」タブで描画される。
 */
import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { GanttChartMonthView } from "@/modules/reusable-widgets/gantt-chart/GanttChartMonthView";
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
  onShiftSave: _onShiftSave,
  onShiftDelete: _onShiftDelete,
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
    </View>
  );
};
