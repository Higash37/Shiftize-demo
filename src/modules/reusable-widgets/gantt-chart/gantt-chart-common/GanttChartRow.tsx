/** @file GanttChartRow.tsx
 *  @description ガントチャートの「1行」を描画するコンポーネント。
 *    左に日付セル、中央にシフトバー（または空セル）、右に情報セルを配置する。
 *    同じ日付の行が複数ある場合は、日付セルを縦に結合して表示する。
 */

// 【このファイルの位置づけ】
// - import元: components.tsx（DateCell, GanttChartGrid, EmptyCell等の部品）
// - importされる先: GanttChartBody（FlatListのrenderItemから呼ばれる）
// - 関係: GanttChartBody → GanttChartRow → DateCell + GanttChartGrid + GanttChartInfo
// - 役割: 1日分の行を「シフトあり」と「シフトなし」で分岐して描画する。

import React from "react";
import { View, StyleSheet } from "react-native";
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
import { getDateBackgroundColor } from "@/common/common-utils/util-date/dateUtils";

// GanttChartRowProps: 1行分の描画に必要な情報すべて
interface GanttChartRowProps {
  date: string;                    // この行の日付 ("2025-01-15")
  group: ShiftItem[];              // この行に表示するシフトの配列（空なら空白行）
  dateColumnWidth: number;         // 日付列の幅（px）
  ganttColumnWidth: number;        // ガントチャート列の幅（px）
  infoColumnWidth: number;         // 情報列の幅（px）
  cellWidth: number;               // 30分あたりのセル幅（px）
  halfHourLines: string[];         // 30分刻みの時間ラベル配列 ["9:00","9:30","10:00",...]
  isClassTime: (time: string) => boolean;  // その時間が授業時間帯かどうか判定する関数
  getStatusConfig: (status: string) => ShiftStatusConfig; // ステータス→設定オブジェクト変換
  handleShiftPress: (shift: ShiftItem) => void;   // シフトバータップ時のコールバック
  handleEmptyCellClick: (date: string, position: number) => void; // 空白クリック時のコールバック
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  styles: ReturnType<typeof StyleSheet.create>;    // ReturnType<typeof X> は「Xの戻り値の型」を取得するTypeScript構文
  userColorsMap: Record<string, string>;           // Record<K, V> は「キーがK型、値がV型」のオブジェクト型。ここではuserID→色のマッピング。
  users?: Array<{ uid: string; role: string; nickname: string }>;
  statusStyles?: (status: ShiftStatus) => {        // 省略可能な関数型プロパティ
    borderColor: string;
    color: string;
  };
  isFirstInGroup?: boolean; // 同じ日付の最初の行かどうか（日付セルの結合表示に使う）
  groupSize?: number;       // 同じ日付の総行数（日付セルの高さ計算に使う）
  colorMode?: "status" | "user";
}

export { GanttChartRowProps };

const GanttChartRowComponent: React.FC<GanttChartRowProps> = ({
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
  styles,
  userColorsMap,
  users = [], // デフォルト値を設定
  statusStyles: _statusStyles,
  isFirstInGroup = true, // デフォルトは true
  groupSize = 1, // デフォルトは 1
  colorMode = "status", // デフォルトはステータス色
}) => {
  // 行の高さを動的に計算（デフォルト65px）
  const rowHeight = styles['shiftRow']?.height || 65;
  const mergedCellHeight =
    typeof rowHeight === "number" ? rowHeight * groupSize : 65 * groupSize;

  // 日曜日・祝日の背景色を取得
  const dateBackgroundColor = getDateBackgroundColor(date);

  if (group && group.length > 0) {
    // シフトがある日
    return (
      <View key={date} style={[styles['shiftRow'], { backgroundColor: dateBackgroundColor, flexDirection: "row", alignItems: "flex-start" }]}>
        {/* 日付セルは同じ日付の最初の行のみ表示 */}
        {isFirstInGroup && (
          <View style={{ position: "absolute", left: 0, top: 0, zIndex: 10 }}>
            <DateCell
              date={date}
              dateColumnWidth={dateColumnWidth}
              styles={{
                ...styles,
                dateCell: {
                  ...styles['dateCell'],
                  height: mergedCellHeight, // 複数行分の高さ
                },
              }}
            />
          </View>
        )}
        {/* 日付セル分のスペースを確保 */}
        <View style={{ width: dateColumnWidth }} />
        <View style={{ height: rowHeight, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
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
            {...(onTimeChange && { onTimeChange })}
            styles={styles}
            userColorsMap={userColorsMap}
            users={users}
            colorMode={colorMode}
          />
        </View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
          <GanttChartInfo
            shifts={group}
            getStatusConfig={getStatusConfig}
            onShiftPress={handleShiftPress}
            onDelete={() => {}}
            infoColumnWidth={infoColumnWidth}
            styles={styles}
          />
        </View>
      </View>
    );
  } else {
    // シフトがない日
    return (
      <View key={date} style={[styles['shiftRow'], { backgroundColor: dateBackgroundColor, flexDirection: "row", alignItems: "flex-start" }]}>
        {/* 日付セルは同じ日付の最初の行のみ表示 */}
        {isFirstInGroup && (
          <View style={{ position: "absolute", left: 0, top: 0, zIndex: 10 }}>
            <DateCell
              date={date}
              dateColumnWidth={dateColumnWidth}
              styles={{
                ...styles,
                dateCell: {
                  ...styles['dateCell'],
                  height: mergedCellHeight, // 複数行分の高さ
                },
              }}
            />
          </View>
        )}
        {/* 日付セル分のスペースを確保 */}
        <View style={{ width: dateColumnWidth }} />
        <View style={{ height: rowHeight, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
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
        <View style={[styles['emptyInfoCell'], { width: infoColumnWidth, height: rowHeight, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }]} />
      </View>
    );
  }
};

// React.memoでラップしてメモ化
export const GanttChartRow = React.memo(GanttChartRowComponent);
