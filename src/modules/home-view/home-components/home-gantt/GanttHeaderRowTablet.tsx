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
