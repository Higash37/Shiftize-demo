import React from "react";
import { View, Text } from "react-native";
import styles from "../GanttChartMonthView.styles";

interface GanttHeaderProps {
  hourLabels: string[];
  dateColumnWidth: number;
  ganttColumnWidth: number;
  infoColumnWidth: number;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  hourLabels,
  dateColumnWidth,
  ganttColumnWidth,
  infoColumnWidth,
}) => (
  <View style={styles.headerRow}>
    <View style={[styles.headerDateCell, { width: dateColumnWidth }]} />
    <View style={[styles.headerGanttCell, { width: ganttColumnWidth }]}>
      {hourLabels.map((t, i) => {
        const isLast = i === hourLabels.length - 1;
        return (
          <View
            key={t}
            style={{
              position: "absolute",
              left:
                i * (ganttColumnWidth / (hourLabels.length - 1)) -
                44 -
                (isLast ? -1.7 : 0),
              width: ganttColumnWidth / (hourLabels.length - 1),
            }}
          >
            <Text style={styles.timeLabel}>{t}</Text>
          </View>
        );
      })}
    </View>
    <View
      style={[
        styles.headerInfoCell,
        {
          width: infoColumnWidth,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
        情報
      </Text>
    </View>
  </View>
);
