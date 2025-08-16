import React, { useMemo } from "react";
import { View } from "react-native";
import { GanttChartMonthViewProps } from "./GanttChartProps";
import { MonthSelectorBar } from "./gantt-chart-common/MonthSelectorBar";
import { GanttHeader } from "./gantt-chart-common/GanttHeader";
import { GanttViewRenderer } from "./gantt-month-view/GanttViewRenderer";
import { GanttModals } from "./gantt-month-view/GanttModals";
import { useGanttState } from "./gantt-month-view/useGanttState";
import { useGanttHandlers } from "./gantt-month-view/useGanttHandlers";
import { generateTimeOptions } from "./gantt-chart-common/utils";
import styles from "./GanttChartMonthView.styles";

export const GanttChartMonthView: React.FC<GanttChartMonthViewProps> = ({
  shifts,
  days,
  users,
  selectedDate,
  onShiftPress,
  onShiftUpdate,
  onMonthChange,
  classTimes = [],
  refreshPage,
}) => {
  // 状態管理
  const {
    state,
    updateState,
    batchModal,
    setBatchModal,
    statusConfigs,
    shouldUseCompactView,
    visibleShifts,
    dimensions,
    getStatusConfig,
    windowWidth,
    windowHeight,
  } = useGanttState(selectedDate, shifts);

  // イベントハンドラー
  const handlers = useGanttHandlers({
    state,
    updateState,
    batchModal,
    setBatchModal,
    users,
    onShiftUpdate,
    visibleShifts,
  });

  // 時間選択オプションを生成
  const timeOptions = useMemo(() => generateTimeOptions(), []);

  // 簡略化されたステータス設定
  const simplifiedStatusConfigs = useMemo(() => [
    {
      status: "approved",
      label: "承認済み",
      color: "#90caf9",
      canEdit: false,
      description: "承認されたシフト",
    },
    {
      status: "pending",
      label: "申請中",
      color: "#ffcc80",
      canEdit: true,
      description: "承認待ちのシフト",
    },
    {
      status: "rejected",
      label: "却下",
      color: "#ef9a9a",
      canEdit: true,
      description: "却下されたシフト",
    },
    {
      status: "completed",
      label: "完了",
      color: "#a5d6a7",
      canEdit: false,
      description: "完了したシフト",
    },
  ], []);

  return (
    <View style={styles.container}>
      {/* 月選択バー */}
      <MonthSelectorBar
        selectedDate={state.selectedDate}
        onDatePress={() => updateState({ showDatePicker: true })}
        onPrevMonth={() => {
          const prevMonth = new Date(state.selectedDate);
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          updateState({ selectedDate: prevMonth });
          onMonthChange?.(prevMonth);
        }}
        onNextMonth={() => {
          const nextMonth = new Date(state.selectedDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          updateState({ selectedDate: nextMonth });
          onMonthChange?.(nextMonth);
        }}
        onPayrollPress={() => updateState({ showPayrollModal: true })}
        onHistoryPress={() => updateState({ showHistoryModal: true })}
        showHistoryButton={true}
      />

      {/* ヘッダー（デスクトップ・タブレットのみ） */}
      {state.deviceType !== "mobile" && !shouldUseCompactView && (
        <GanttHeader
          viewMode={state.viewMode}
          colorMode={state.colorMode}
          onViewModeChange={handlers.onViewModeChange}
          onColorModeChange={handlers.onColorModeChange}
          onBatchApprove={() => handlers.onBatchAction("approve")}
          onBatchDelete={() => handlers.onBatchAction("delete")}
          useGoogleLayout={state.useGoogleLayout}
          onToggleGoogleLayout={() => updateState({ 
            useGoogleLayout: !state.useGoogleLayout 
          })}
          statusConfigs={simplifiedStatusConfigs}
        />
      )}

      {/* メインビュー */}
      <GanttViewRenderer
        state={state}
        dimensions={dimensions}
        handlers={handlers}
        shifts={visibleShifts}
        days={days}
        users={users}
        shouldUseCompactView={shouldUseCompactView}
        onShiftUpdate={onShiftUpdate}
      />

      {/* モーダル類 */}
      <GanttModals
        state={state}
        updateState={updateState}
        batchModal={batchModal}
        setBatchModal={setBatchModal}
        shifts={shifts}
        users={users}
        classTimes={classTimes}
        onShiftUpdate={onShiftUpdate}
        onMonthChange={onMonthChange}
      />
    </View>
  );
};