/** @file GanttHeader.tsx
 *  @description ガントチャートの最上部に表示する時間軸ヘッダー。
 *    "9:00", "10:00", ... のラベルをガントチャート列の幅に合わせて等間隔に配置する。
 */

// 【このファイルの位置づけ】
// - import元: GanttChartMonthView.styles（スタイル生成関数）, useThemedStyles（テーマフック）
// - importされる先: GanttChartMonthView（ガントチャートの親コンポーネント）
// - 役割: 時間ラベルを position: absolute で横一列に配置する。

import React from "react";
import { View, Text } from "react-native";
import { createGanttChartMonthViewStyles } from "../GanttChartMonthView.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";

// GanttHeaderProps: ヘッダーの描画に必要な情報
interface GanttHeaderProps {
  hourLabels: string[];       // 時間ラベルの配列 ["9:00", "10:00", ..., "22:00"]
  dateColumnWidth: number;    // 日付列の幅（px）
  ganttColumnWidth: number;   // ガントチャート列の幅（px）
  infoColumnWidth: number;    // 情報列の幅（px）
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  hourLabels,
  dateColumnWidth,
  ganttColumnWidth,
  infoColumnWidth,
}) => {
  const styles = useThemedStyles(createGanttChartMonthViewStyles);
  return (
  <View style={styles.headerRow}>
    <View style={[styles.headerDateCell, { width: dateColumnWidth }]} />
    {/* 時間ラベルを等間隔に配置する。position: absolute で各ラベルの left を計算。
        計算式: i * (全体幅 / (ラベル数-1)) で等間隔の位置を求め、-32 でテキスト中央寄せの調整 */}
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
                32 -
                (isLast ? -1.2 : 0),
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
};
