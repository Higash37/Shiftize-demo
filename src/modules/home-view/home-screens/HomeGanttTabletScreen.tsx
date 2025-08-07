import React from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../home-types/home-view-types";
import { GanttHeaderRowTablet } from "../home-components/home-gantt/GanttHeaderRowTablet";
import { GanttRowTablet } from "../home-components/home-gantt/GanttRowTablet";

interface Props {
  namesFirst: string[];
  namesSecond: string[];
  timesFirst: string[];
  timesSecond: string[];
  sampleSchedule: SampleScheduleColumn[];
  CELL_WIDTH: number;
  showFirst: boolean;
  onCellPress?: (userName: string) => void;
}

// レイアウト用定数
const HEADER_HEIGHT = 200; // タブレット用にやや小さめ
const FOOTER_HEIGHT = 80;
const TABBAR_HEIGHT = 56;
const VERTICAL_MARGIN = 5;
const MIN_CELL_WIDTH = 120;
const MIN_CELL_HEIGHT = 28;

export const HomeGanttTabletScreen: React.FC<Props> = ({
  namesFirst,
  namesSecond,
  timesFirst,
  timesSecond,
  sampleSchedule,
  CELL_WIDTH,
  showFirst,
  onCellPress,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets(); // Add SafeAreaInsets

  const cellWidth = Math.max(CELL_WIDTH, MIN_CELL_WIDTH);
  const timeRowCount = timesFirst.length;
  const cellHeight = Math.max(
    MIN_CELL_HEIGHT,
    Math.floor(
      (windowWidth >= 768 && windowWidth <= 1024
        ? windowHeight -
          HEADER_HEIGHT -
          FOOTER_HEIGHT -
          insets.bottom - // Adjust for SafeAreaInsets
          TABBAR_HEIGHT -
          VERTICAL_MARGIN
        : 400) / timeRowCount
    )
  );
  const names = showFirst ? namesFirst : namesSecond;
  const times = showFirst ? timesFirst : timesSecond;

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      {/* Add paddingBottom */}
      <ScrollView
        horizontal
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ minWidth: windowWidth }}>
          <GanttHeaderRowTablet
            names={names}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
          />
          {times.map((time) => (
            <GanttRowTablet
              key={time}
              time={time}
              names={names}
              sampleSchedule={sampleSchedule}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              onCellPress={onCellPress}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
