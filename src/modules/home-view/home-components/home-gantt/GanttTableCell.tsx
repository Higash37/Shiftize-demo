import React from "react";
import { View, Pressable } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { styles } from "../../home-styles/home-view-styles";

type GanttCellSlot = {
  type?: string;
  color?: string;
} | null;

interface GanttTableCellProps {
  slot?: GanttCellSlot;
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
  const defaultSlotFill = colors.primary + "1A";
  const defaultSlotBorder = colors.primary + "66";

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
                ? colors.surfaceElevated
                : slot.color || defaultSlotFill
              : undefined,
            borderColor: slot
              ? slot.type === "class"
                ? colors.border
                : slot.color || defaultSlotBorder
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
              ? colors.surfaceElevated
              : slot.color || defaultSlotFill
            : undefined,
          borderColor: slot
            ? slot.type === "class"
              ? colors.border
              : slot.color || defaultSlotBorder
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
