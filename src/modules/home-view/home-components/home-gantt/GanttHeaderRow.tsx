/**
 * @file GanttHeaderRow.tsx
 * @description PC版ガントチャートのヘッダー行。スタッフ名を横一列に表示する。
 *
 * 【このファイルの位置づけ】
 *   home-view > home-components > home-gantt 配下の UIパーツ。
 *   HomeGanttWideScreen（PC版）で使われる。
 *
 * 主要Props:
 *   - staffList: 表示するスタッフ配列
 *   - cellWidth: 1セルの幅(px)
 *   - onStaffPress: スタッフ名タップ時のコールバック
 */
import React from "react";
import { View, Text } from "react-native";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { createHomeViewStyles } from "../../home-styles/home-view-styles";

interface GanttHeaderRowProps {
  names: string[];
  cellWidth: number;
  cellHeight: number;
}

export const GanttHeaderRow: React.FC<GanttHeaderRowProps> = ({
  names,
  cellWidth,
  cellHeight,
}) => {
  const styles = useThemedStyles(createHomeViewStyles);

  return (
    <View style={{ flexDirection: "row" }}>
      <View
        style={[styles.headerCell, { width: cellWidth, height: cellHeight }]}
      />
      {names.map((name) => (
        <View
          key={name}
          style={[styles.headerCell, { width: cellWidth, height: cellHeight }]}
        >
          <Text style={styles.headerText}>{name}</Text>
        </View>
      ))}
    </View>
  );
};
