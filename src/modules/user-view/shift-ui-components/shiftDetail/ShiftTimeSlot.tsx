import React from "react";
import { View, Text } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { ShiftTimeSlotProps } from "./types";
import { shiftTimeSlotStyles as styles } from "./styles";

export const ShiftTimeSlot: React.FC<ShiftTimeSlotProps> = ({
  type,
  startTime,
  endTime,
}) => {
  return (
    <View style={styles.timeSlot}>
      <Text
        style={[
          styles.timeSlotText,
          styles.timeSlotType,
          {
            color: type === "class" ? colors.warning : colors.primary,
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
