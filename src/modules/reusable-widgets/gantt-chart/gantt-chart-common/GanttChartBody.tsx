/** @file GanttChartBody.tsx
 *  @description ガントチャートの本体部分。FlatListで各日の行を効率的にスクロール描画する。
 *    左側にガントチャート行一覧、右側にカレンダー（情報列）を配置する。
 */

// 【このファイルの位置づけ】
// - import元: GanttChartRow（各行の描画）, components（GanttChartInfo = 右側カレンダー）
// - importされる先: GanttChartMonthView（親）
// - 関係: GanttChartMonthView → GanttChartBody → GanttChartRow → GanttChartGrid
// - 役割: 日付ごとの行データを FlatList でスクロール可能なリストとして描画する。
//   FlatList は「画面に見えている行だけ描画する」仮想化リストで、大量データでも高速。

import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { FlatList, ListRenderItemInfo, View, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native";
import { GanttChartRow } from "./GanttChartRow";
import { GanttChartInfo } from "./components";
import {
  ShiftItem,
  ShiftStatus,
  ShiftStatusConfig,
} from "@/common/common-models/ModelIndex";
import { getOptimizedFlatListProps } from "@/common/common-utils/performance/webOptimization";

// GanttChartBodyProps: このコンポーネントが受け取るpropsの型定義
interface GanttChartBodyProps {
  days: string[];                     // 表示する全日付の配列 ["2025-01-01", "2025-01-02", ...]
  rows: [string, ShiftItem[]][];     // [日付, その日のシフト配列] のタプル配列
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
  styles: ReturnType<typeof StyleSheet.create>;
  userColorsMap: Record<string, string>;
  users?: Array<{ uid: string; role: string; nickname: string }>; // ユーザー情報を追加
  statusStyles?: (status: string) => { borderColor: string; color: string };
  colorMode?: "status" | "user"; // 色表示モード
  // カレンダー用のプロパティ
  allShifts?: ShiftItem[];
  selectedDate?: Date;
  onDateSelect?: (date: string) => void;
  onMonthChange?: (month: { year: number; month: number }) => void;
}

// RowData: FlatListの各行に渡すデータの型
interface RowData {
  date: string;           // 日付文字列 ("2025-01-15")
  group: ShiftItem[];     // その行に表示するシフトの配列
}

// GanttChartBodyInner: React.memo でラップする前の内部コンポーネント
const GanttChartBodyInner: React.FC<GanttChartBodyProps> = ({
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
  styles,
  userColorsMap,
  users = [], // デフォルト値を設定
  statusStyles,
  colorMode = "status", // デフォルトはステータス色
  // カレンダー用のプロパティ
  allShifts = [],
  selectedDate,
  onDateSelect,
  onMonthChange,
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
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastScrollOffset.current = event.nativeEvent.contentOffset.y;
  };

  // 指定日付にスクロールする関数
  const scrollToDate = useCallback((targetDate: string) => {
    const targetIndex = data.findIndex(item => item.date === targetDate);
    if (targetIndex >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0.5, // 画面中央に表示
      });
    }
  }, [data]);

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
    <View style={{ flexDirection: "row", flex: 1 }}>
      {/* ガントチャート部分 */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={data}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
          {...getOptimizedFlatListProps()}
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
              infoColumnWidth={0} // 情報列を非表示にする
              cellWidth={cellWidth}
              halfHourLines={halfHourLines}
              isClassTime={isClassTime}
              getStatusConfig={getStatusConfig}
              handleShiftPress={handleShiftPress}
              handleEmptyCellClick={handleEmptyCellClick}
              {...(onTimeChange && { onTimeChange })}
              styles={styles}
              userColorsMap={userColorsMap}
              users={users}
              {...(statusStyles && { statusStyles })}
              isFirstInGroup={item.isFirstInGroup}
              groupSize={item.groupSize}
              colorMode={colorMode}
            />
          )}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 0
          }}
        />
      </View>
      
      {/* カレンダー部分（右側） */}
      <View style={{ width: infoColumnWidth }}>
        <GanttChartInfo
          shifts={[]} // カレンダー表示のため空配列
          getStatusConfig={getStatusConfig}
          onShiftPress={handleShiftPress}
          onDelete={() => {}} // カレンダーでは削除機能不要
          infoColumnWidth={infoColumnWidth}
          styles={styles}
          allShifts={allShifts}
          selectedDate={selectedDate || new Date()}
          onDateSelect={(date) => {
            scrollToDate(date);
            onDateSelect?.(date);
          }}
          {...(onMonthChange && { onMonthChange })}
        />
      </View>
    </View>
  );
};

export const GanttChartBody = React.memo(GanttChartBodyInner);
