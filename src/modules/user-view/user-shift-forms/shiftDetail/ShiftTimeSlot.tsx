import React from "react";
import { View, Text } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { ShiftTimeSlotProps } from "./types";
import { createShiftTimeSlotStyles } from "./styles";

export const ShiftTimeSlot: React.FC<ShiftTimeSlotProps> = ({
  type,
  startTime,
  endTime,
}) => {
  const theme = useMD3Theme();
  const styles = useThemedStyles(createShiftTimeSlotStyles);

  return (
    <View style={styles.timeSlot}>
      <Text
        style={[
          styles.timeSlotText,
          styles.timeSlotType,
          {
            color:
              type === "class"
                ? theme.colorScheme.warning
                : theme.colorScheme.primary,
          },
        ]}
      >
        {type === "class" ? "授業" : "スタッフ"}
      </Text>
      <Text style={styles.timeSlotTime}>
        {startTime}
        {" ~ "}
        {endTime}
      </Text>
    </View>
  );
};
