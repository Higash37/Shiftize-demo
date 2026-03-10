/**
 * @file GanttHeaderRowTablet.tsx
 * @description タブレット版ガントチャートのヘッダー行。スタッフ名を表示する。
 *
 * 【このファイルの位置づけ】
 *   home-view > home-components > home-gantt 配下の UIパーツ。
 *   HomeGanttTabletScreen で使われる。
 *   PC版 GanttHeaderRow と似ているが、タブレット向けにレイアウトを調整している。
 */
import React from "react";
import { View, Text } from "react-native";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { createHomeViewStyles } from "../../home-styles/home-view-styles";

interface GanttHeaderRowTabletProps {
  names: string[];
  cellWidth: number;
  cellHeight: number;
}

export const GanttHeaderRowTablet: React.FC<GanttHeaderRowTabletProps> = ({
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
