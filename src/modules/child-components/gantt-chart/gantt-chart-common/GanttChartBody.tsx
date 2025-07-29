import React, { useMemo, useRef, useEffect } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { GanttChartRow } from "./GanttChartRow";
import {
  ShiftItem,
  ShiftStatus,
  ShiftStatusConfig,
} from "@/common/common-models/ModelIndex";

interface GanttChartBodyProps {
  days: string[];
  rows: [string, ShiftItem[]][];
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
  statusStyles?: (status: string) => { borderColor: string; color: string };
  colorMode?: "status" | "user"; // 色表示モード
}

interface RowData {
  date: string;
  group: ShiftItem[];
}

export const GanttChartBody: React.FC<GanttChartBodyProps> = ({
  days,
  rows,
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
  colorMode = "status", // デフォルトはステータス色
}) => {
  // 日付ごとに行を生成し、シフトがない日も空のグループとして含める
  // 同じ日付の行をグループ化して、日付セルを結合表示するための情報を付与
  const data: (RowData & { isFirstInGroup: boolean; groupSize: number })[] =
    useMemo(() => {
      const baseData: RowData[] = days
        .map((date) => {
          const found = rows.filter(([rowDate]) => rowDate === date);
          return found.length > 0
            ? found.map(([rowDate, group]) => ({ date: rowDate, group }))
            : [{ date, group: [] }];
        })
        .flat();

      // 各日付の最初の行と、その日付の総行数を計算
      const result: (RowData & {
        isFirstInGroup: boolean;
        groupSize: number;
      })[] = [];
      const dateGroups = new Map<string, number>();

      // 各日付の行数をカウント
      baseData.forEach((item) => {
        dateGroups.set(item.date, (dateGroups.get(item.date) || 0) + 1);
      });

      // 各行に日付グループ情報を付与
      const dateFirstRowMap = new Map<string, boolean>();
      baseData.forEach((item) => {
        const isFirstInGroup = !dateFirstRowMap.has(item.date);
        if (isFirstInGroup) {
          dateFirstRowMap.set(item.date, true);
        }

        result.push({
          ...item,
          isFirstInGroup,
          groupSize: dateGroups.get(item.date) || 1,
        });
      });

      return result;
    }, [days, rows]);

  const flatListRef = useRef<FlatList>(null);
  const lastScrollOffset = useRef(0);

  // スクロール位置を記録
  const handleScroll = (event: any) => {
    lastScrollOffset.current = event.nativeEvent.contentOffset.y;
  };

  // データ更新後にスクロール位置を復元
  useEffect(() => {
    if (flatListRef.current && lastScrollOffset.current > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: lastScrollOffset.current,
          animated: false
        });
      }, 50);
    }
  }, [data]);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      // 安定したキーを生成（シフトIDまたは日付とグループ情報）
      keyExtractor={(
        item: RowData & { isFirstInGroup: boolean; groupSize: number },
        index: number
      ) => {
        // indexに依存しない安定したキーを生成
        if (item.group.length > 0) {
          return `${item.date}-${item.group.map(s => s.id).join('-')}`;
        }
        return `${item.date}-empty-${item.isFirstInGroup}`;
      }}
      renderItem={({
        item,
      }: ListRenderItemInfo<
        RowData & { isFirstInGroup: boolean; groupSize: number }
      >) => (
        <GanttChartRow
          date={item.date}
          group={item.group}
          dateColumnWidth={dateColumnWidth}
          ganttColumnWidth={ganttColumnWidth}
          infoColumnWidth={infoColumnWidth}
          cellWidth={cellWidth}
          halfHourLines={halfHourLines}
          isClassTime={isClassTime}
          getStatusConfig={getStatusConfig}
          handleShiftPress={handleShiftPress}
          handleEmptyCellClick={handleEmptyCellClick}
          onTimeChange={onTimeChange}
          onTaskAdd={onTaskAdd}
          styles={styles}
          userColorsMap={userColorsMap}
          users={users}
          statusStyles={statusStyles}
          isFirstInGroup={item.isFirstInGroup}
          groupSize={item.groupSize}
          colorMode={colorMode}
        />
      )}
      initialNumToRender={20}
      windowSize={21}
      removeClippedSubviews={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 0
      }}
    />
  );
};
