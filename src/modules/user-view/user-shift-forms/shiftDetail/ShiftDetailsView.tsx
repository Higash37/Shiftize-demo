import React from "react";
import { View } from "react-native";
import { ShiftTimeSlot } from "./ShiftTimeSlot";
import { ShiftDetailsViewProps } from "./types";
import { shiftDetailsViewStyles as styles } from "./styles";

export const ShiftDetailsView: React.FC<ShiftDetailsViewProps> = ({
  timeSlots,
}) => {
  return (
    <View style={styles.detailsContainer}>
      {timeSlots.map((slot, index) => (
        <ShiftTimeSlot
          key={index}
          type={slot.type}
          startTime={slot.startTime}
          endTime={slot.endTime}
        />
      ))}
    </View>
  );
};
