import React from "react";
import { View, Pressable } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { createHomeViewStyles } from "../../home-styles/home-view-styles";

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
  const styles = useThemedStyles(createHomeViewStyles);
  const theme = useMD3Theme();

  const defaultSlotFill = theme.colorScheme.primary + "1A";
  const defaultSlotBorder = theme.colorScheme.primary + "66";

  const cellStyle = [
    styles.cell,
    {
      width: cellWidth,
      height: cellHeight,
      backgroundColor: slot
        ? slot.type === "class"
          ? theme.colorScheme.surfaceContainerHigh
          : slot.color || defaultSlotFill
        : undefined,
      borderColor: slot
        ? slot.type === "class"
          ? theme.colorScheme.outlineVariant
          : slot.color || defaultSlotBorder
        : undefined,
      borderWidth: slot ? 1 : 0,
      opacity: slot ? 1 : 0.1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
  ];

  if (onPress) {
    return (
      <Pressable style={cellStyle} onPress={onPress}>
        {children}
      </Pressable>
    );
  }
  return <View style={cellStyle}>{children}</View>;
};
