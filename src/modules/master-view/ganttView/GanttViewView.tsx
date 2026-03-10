/**
 * @file GanttViewView.tsx
 * @description シフト閲覧画面のラッパーコンポーネント。GanttChartMonthView を
 *   閲覧モードで表示する。
 *
 * 【このファイルの位置づけ】
 *   master-view > ganttView 配下の画面コンポーネント。
 *   マスターユーザーの「シフト閲覧」タブで描画される。
 */
import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { GanttChartMonthView } from "@/modules/reusable-widgets/gantt-chart/GanttChartMonthView";
import { ganttViewViewStyles as styles } from "./GanttViewView.styles";
import type { GanttViewViewProps } from "./GanttViewView.types";

export const GanttViewView: React.FC<GanttViewViewProps> = ({
  shifts,
  users,
  days,
  currentYearMonth,
  onMonthChange,
  onShiftUpdate,
  onShiftPress,
}) => {
  return (
    <View
      style={styles.container}
      // @ts-ignore Web only prop
      className="gantt-view-container"
    >
      <MasterHeader title="シフト確認" />
      <Stack.Screen
        options={{
          title: "シフト確認",
          headerShown: false,
        }}
      />

      {/* ガントチャート表示（スマホでは自動的にMobileVerticalViewに切り替わる） */}
      <GanttChartMonthView
        shifts={shifts}
        days={days}
        users={users}
        onShiftPress={onShiftPress}
        onShiftUpdate={onShiftUpdate}
        onMonthChange={onMonthChange}
        classTimes={[]}
        selectedDate={
          new Date(currentYearMonth.year, currentYearMonth.month, 1)
        }
      />
    </View>
  );
};
