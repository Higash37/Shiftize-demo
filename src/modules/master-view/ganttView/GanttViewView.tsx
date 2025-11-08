import React, { useState, Suspense, lazy } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { colors } from "@/common/common-constants/ThemeConstants";
import { TaskCreateModal } from "@/modules/master-view/shift-tasks/shift-task-modals/TaskCreateModal";
import { ganttViewViewStyles as styles } from "./GanttViewView.styles";
import type { GanttViewViewProps } from "./GanttViewView.types";

// GanttChartMonthViewを遅延読み込み
const GanttChartMonthView = lazy(() => 
  import("@/modules/reusable-widgets/gantt-chart/GanttChartMonthView").then(module => ({ default: module.GanttChartMonthView }))
);

export const GanttViewView: React.FC<GanttViewViewProps> = ({
  shifts,
  users,
  days,
  currentYearMonth,
  onMonthChange,
  onShiftUpdate,
  onShiftPress,
}) => {
  // タスク作成モーダルの状態
  const [showTaskCreateModal, setShowTaskCreateModal] = useState(false);
  const [selectedShiftIdForTask, setSelectedShiftIdForTask] =
    useState<string>("");

  // タスク追加ハンドラー
  const handleTaskAdd = (shiftId: string) => {
    setSelectedShiftIdForTask(shiftId);
    setShowTaskCreateModal(true);
  };

  // タスク作成完了ハンドラー
  const handleTaskCreated = () => {
    setShowTaskCreateModal(false);
    setSelectedShiftIdForTask("");
    // シフトデータを再読み込み
    onShiftUpdate?.();
  };

  // 選択されたシフトの情報を取得
  const selectedShift = shifts.find(
    (shift) => shift.id === selectedShiftIdForTask
  );
  const initialShiftData = selectedShift
    ? {
        date: selectedShift.date,
        startTime: selectedShift.startTime,
        endTime: selectedShift.endTime,
        userId: selectedShift.userId,
      }
    : undefined;

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
      <Suspense fallback={
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      }>
        <GanttChartMonthView
          shifts={shifts}
          days={days}
          users={users}
          onShiftPress={onShiftPress}
          onShiftUpdate={onShiftUpdate}
          onMonthChange={onMonthChange}
          onTaskAdd={handleTaskAdd}
          classTimes={[]}
          selectedDate={
            new Date(currentYearMonth.year, currentYearMonth.month, 1)
          }
        />
      </Suspense>

      {/* タスク作成モーダル */}
      <TaskCreateModal
        visible={showTaskCreateModal}
        storeId="default-store"
        onClose={() => setShowTaskCreateModal(false)}
        onTaskCreated={handleTaskCreated}
        initialShiftId={selectedShiftIdForTask}
        initialShiftData={initialShiftData || { date: "", startTime: "", endTime: "", userId: "" }}
      />
    </View>
  );
};
