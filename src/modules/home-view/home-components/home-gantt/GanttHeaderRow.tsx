import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../home-styles/home-view-styles";

interface GanttHeaderRowProps {
  names: string[];
  cellWidth: number;
  cellHeight: number;
}

export const GanttHeaderRow: React.FC<GanttHeaderRowProps> = ({
  names,
  cellWidth,
  cellHeight,
}) => (
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
