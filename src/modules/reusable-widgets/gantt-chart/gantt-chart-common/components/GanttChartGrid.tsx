import React from "react";
import { View, TouchableOpacity } from "react-native";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { GanttChartGridProps } from "./types";
import { ShiftBar } from "./ShiftBar";
import { TimeAxis } from "./TimeAxis";
import {
  convertClassesToTasks,
  calculateShiftPosition,
  calculateShiftWidth,
  formatTimeRange,
} from "./helpers";

export const GanttChartGrid: React.FC<GanttChartGridProps> = ({
  shifts,
  cellWidth,
  ganttColumnWidth,
  halfHourLines,
  isClassTime,
  getStatusConfig,
  onShiftPress,
  onBackgroundPress,
  onTimeChange,
  onTaskAdd,
  styles,
  userColorsMap,
  users,
  getTimeWidth,
  colorMode = "status",
}) => {
  const handleBackgroundPress = (event: any) => {
    if (onBackgroundPress) {
      const x = event.nativeEvent.locationX;
      onBackgroundPress(x);
    }
  };

  const renderShifts = () => {
    return shifts.map((shift) => {
      const statusConfig = getStatusConfig(shift.status || "approved");
      const shiftColor = colorMode === "user" 
        ? userColorsMap[shift.userId] || "#999"
        : statusConfig.color;

      const x = calculateShiftPosition(shift.startTime, cellWidth);
      const width = getTimeWidth
        ? getTimeWidth(shift.endTime) - getTimeWidth(shift.startTime)
        : calculateShiftWidth(shift.startTime, shift.endTime, cellWidth);

      const userRole = users?.find((u) => u.uid === shift.userId)?.role;
      const label = shift.subject || formatTimeRange(shift.startTime, shift.endTime);

      return (
        <React.Fragment key={shift.id}>
          <ShiftBar
            shiftId={shift.id}
            x={x}
            width={width}
            color={shiftColor}
            shiftData={shift}
            statusConfig={statusConfig}
            label={label}
            userRole={userRole}
            onPress={() => onShiftPress?.(shift)}
            onTimeChange={
              onTimeChange
                ? (newStart, newEnd) => onTimeChange(shift.id, newStart, newEnd)
                : undefined
            }
            onTaskAdd={onTaskAdd ? () => onTaskAdd(shift.id) : undefined}
            styles={styles}
          />

          {/* Render tasks within the shift */}
          {shift.tasks?.map((task, taskIndex) => {
            const taskX = calculateShiftPosition(task.startTime, cellWidth);
            const taskWidth = calculateShiftWidth(task.startTime, task.endTime, cellWidth);

            return (
              <ShiftBar
                key={`${shift.id}-task-${taskIndex}`}
                shiftId={`${shift.id}-task-${taskIndex}`}
                x={taskX}
                width={taskWidth}
                color={task.color || "#666"}
                taskType="task"
                taskData={task}
                label={task.shortName || task.title}
                styles={styles}
              />
            );
          })}

          {/* Render classes as tasks */}
          {convertClassesToTasks(shift).map((classTask, index) => {
            const classX = calculateShiftPosition(classTask.startTime, cellWidth);
            const classWidth = calculateShiftWidth(
              classTask.startTime,
              classTask.endTime,
              cellWidth
            );

            return (
              <ShiftBar
                key={`${shift.id}-class-${index}`}
                shiftId={`${shift.id}-class-${index}`}
                x={classX}
                width={classWidth}
                color={classTask.color}
                taskType="task"
                taskData={classTask}
                label={classTask.shortName}
                styles={styles}
              />
            );
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <CustomScrollView horizontal showsHorizontalScrollIndicator={false}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleBackgroundPress}
        style={{ width: ganttColumnWidth, height: "100%" }}
      >
        <View style={[styles.ganttChart, { width: ganttColumnWidth }]}>
          <TimeAxis
            halfHourLines={halfHourLines}
            cellWidth={cellWidth}
            ganttColumnWidth={ganttColumnWidth}
            styles={styles}
            isClassTime={isClassTime}
          />
          <View style={styles.shiftsContainer}>{renderShifts()}</View>
        </View>
      </TouchableOpacity>
    </CustomScrollView>
  );
};