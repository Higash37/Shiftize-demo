import React from "react";
import { View, Text } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useTimeSegmentTypesContext } from "@/common/common-context/TimeSegmentTypesContext";
import { ShiftTimeSlotProps } from "./types";
import { createShiftTimeSlotStyles } from "./styles";

export const ShiftTimeSlot: React.FC<ShiftTimeSlotProps> = ({
  type,
  startTime,
  endTime,
  typeId,
  typeName,
}) => {
  const theme = useMD3Theme();
  const styles = useThemedStyles(createShiftTimeSlotStyles);
  const { typesMap } = useTimeSegmentTypesContext();

  const defaultType = Object.values(typesMap).find((t) => t.name === "授業");
  const segType = typeId ? typesMap[typeId] : defaultType;
  const displayName = segType?.name || typeName || "授業";
  const displayColor = segType?.color || (type === "class" ? theme.colorScheme.warning : theme.colorScheme.primary);

  return (
    <View style={styles.timeSlot}>
      <Text
        style={[
          styles.timeSlotText,
          styles.timeSlotType,
          {
            color: type === "class" ? displayColor : theme.colorScheme.primary,
          },
        ]}
      >
        {type === "class" ? `${segType?.icon ? segType.icon + " " : ""}${displayName}` : "スタッフ"}
      </Text>
      <Text style={styles.timeSlotTime}>
        {startTime}
        {" ~ "}
        {endTime}
      </Text>
    </View>
  );
};
