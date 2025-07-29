import React from "react";
import { View } from "react-native";
import {
  ShiftItem,
  ShiftStatus,
  ShiftStatusConfig,
} from "@/common/common-models/ModelIndex";
import {
  DateCell,
  GanttChartGrid,
  GanttChartInfo,
  EmptyCell,
} from "./components";
import { getDateBackgroundColor } from "@/common/common-utils/date/dateUtils";

interface GanttChartRowProps {
  date: string;
  group: ShiftItem[];
  dateColumnWidth: number;
  ganttColumnWidth: number;
  infoColumnWidth: number;
  cellWidth: number;
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  getStatusConfig: (status: string) => ShiftStatusConfig;
  handleShiftPress: (shift: ShiftItem) => void;
  handleEmptyCellClick: (date: string, position: number) => void;
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  onTaskAdd?: (shiftId: string) => void; // タスク追加ハンドラーを追加
  styles: any;
  userColorsMap: Record<string, string>;
  users?: Array<{ uid: string; role: string; nickname: string }>; // ユーザー情報を追加
  statusStyles?: (status: ShiftStatus) => {
    borderColor: string;
    color: string;
  };
  isFirstInGroup?: boolean; // 同じ日付の最初の行かどうか
  groupSize?: number; // 同じ日付の総行数
  colorMode?: "status" | "user"; // 色表示モード
}

export { GanttChartRowProps };

export const GanttChartRow: React.FC<GanttChartRowProps> = ({
  date,
  group,
  dateColumnWidth,
  ganttColumnWidth,
  infoColumnWidth,
  cellWidth,
  halfHourLines,
  isClassTime,
  getStatusConfig,
  handleShiftPress,
  handleEmptyCellClick,
  onTimeChange,
  onTaskAdd,
  styles,
  userColorsMap,
  users = [], // デフォルト値を設定
  statusStyles,
  isFirstInGroup = true, // デフォルトは true
  groupSize = 1, // デフォルトは 1
  colorMode = "status", // デフォルトはステータス色
}) => {
  // 行の高さを動的に計算（デフォルト65px）
  const rowHeight = styles.shiftRow?.height || 65;
  const mergedCellHeight =
    typeof rowHeight === "number" ? rowHeight * groupSize : 65 * groupSize;

  // 日曜日・祝日の背景色を取得
  const dateBackgroundColor = getDateBackgroundColor(date);

  if (group && group.length > 0) {
    // シフトがある日
    return (
      <View key={date} style={[styles.shiftRow, { backgroundColor: dateBackgroundColor, flexDirection: "row", alignItems: "flex-start" }]}>
        {/* 日付セルは同じ日付の最初の行のみ表示 */}
        {isFirstInGroup && (
          <View style={{ position: "absolute", left: 0, top: 0, zIndex: 10 }}>
            <DateCell
              date={date}
              dateColumnWidth={dateColumnWidth}
              styles={{
                ...styles,
                dateCell: {
                  ...styles.dateCell,
                  height: mergedCellHeight, // 複数行分の高さ
                },
              }}
            />
          </View>
        )}
        {/* 日付セル分のスペースを確保 */}
        <View style={{ width: dateColumnWidth }} />
        <View style={{ height: rowHeight }}>
          <GanttChartGrid
            shifts={group}
            cellWidth={cellWidth}
            ganttColumnWidth={ganttColumnWidth}
            halfHourLines={halfHourLines}
            isClassTime={isClassTime}
            getStatusConfig={getStatusConfig}
            onShiftPress={handleShiftPress}
            onBackgroundPress={(x) => {
              const position =
                (x / ganttColumnWidth) * ((halfHourLines.length - 1) / 2);
              handleEmptyCellClick(date, position);
            }}
            onTimeChange={onTimeChange}
            onTaskAdd={onTaskAdd} // タスク追加ハンドラーを追加
            styles={styles}
            userColorsMap={userColorsMap}
            users={users}
            colorMode={colorMode}
          />
        </View>
        <GanttChartInfo
          shifts={group}
          getStatusConfig={getStatusConfig}
          onShiftPress={handleShiftPress}
          onDelete={() => {}}
          infoColumnWidth={infoColumnWidth}
          styles={styles}
        />
      </View>
    );
  } else {
    // シフトがない日
    return (
      <View key={date} style={[styles.shiftRow, { backgroundColor: dateBackgroundColor, flexDirection: "row", alignItems: "flex-start" }]}>
        {/* 日付セルは同じ日付の最初の行のみ表示 */}
        {isFirstInGroup && (
          <View style={{ position: "absolute", left: 0, top: 0, zIndex: 10 }}>
            <DateCell
              date={date}
              dateColumnWidth={dateColumnWidth}
              styles={{
                ...styles,
                dateCell: {
                  ...styles.dateCell,
                  height: mergedCellHeight, // 複数行分の高さ
                },
              }}
            />
          </View>
        )}
        {/* 日付セル分のスペースを確保 */}
        <View style={{ width: dateColumnWidth }} />
        <View style={{ height: rowHeight }}>
          <EmptyCell
            date={date}
            width={ganttColumnWidth}
            cellWidth={cellWidth}
            halfHourLines={halfHourLines}
            isClassTime={isClassTime}
            styles={styles}
            handleEmptyCellClick={handleEmptyCellClick}
          />
        </View>
        <View style={[styles.emptyInfoCell, { width: infoColumnWidth, height: rowHeight }]} />
      </View>
    );
  }
};
