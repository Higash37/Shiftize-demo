import React from "react";
import { View, Text, Pressable } from "react-native";
import { styles } from "../../home-styles/home-view-styles";

interface GanttTableCellProps {
  slot: any;
  cellWidth: number;
  cellHeight: number;
  onPress?: () => void;
  children?: React.ReactNode;
}

export const GanttTableCell: React.FC<GanttTableCellProps> = ({
  slot,
  cellWidth,
  cellHeight,
  onPress,
  children,
}) => {
  if (onPress) {
    return (
      <Pressable
        style={[
          styles.cell,
          {
            width: cellWidth,
            height: cellHeight,
            backgroundColor: slot
              ? slot.type === "class"
                ? "#eee"
                : slot.color || "#e3f2fd"
              : undefined,
            borderColor: slot
              ? slot.type === "class"
                ? "#bbb"
                : slot.color || "#90caf9"
              : undefined,
            borderWidth: slot ? 1 : 0,
            opacity: slot ? 1 : 0.1,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View
      style={[
        styles.cell,
        {
          width: cellWidth,
          height: cellHeight,
          backgroundColor: slot
            ? slot.type === "class"
              ? "#eee"
              : slot.color || "#e3f2fd"
            : undefined,
          borderColor: slot
            ? slot.type === "class"
              ? "#bbb"
              : slot.color || "#90caf9"
            : undefined,
          borderWidth: slot ? 1 : 0,
          opacity: slot ? 1 : 0.1,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      {children}
    </View>
  );
};
