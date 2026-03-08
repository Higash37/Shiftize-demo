import React from "react";
import { View } from "react-native";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { ShiftTimeSlot } from "./ShiftTimeSlot";
import { ShiftDetailsViewProps } from "./types";
import { createShiftDetailsViewStyles } from "./styles";

export const ShiftDetailsView: React.FC<ShiftDetailsViewProps> = ({
  timeSlots,
}) => {
  const styles = useThemedStyles(createShiftDetailsViewStyles);

  return (
    <View style={styles.detailsContainer}>
      {timeSlots.map((slot, index) => (
        <ShiftTimeSlot
          key={index}
          type={slot.type}
          startTime={slot.startTime}
          endTime={slot.endTime}
          typeId={slot.typeId}
          typeName={slot.typeName}
        />
      ))}
    </View>
  );
};
