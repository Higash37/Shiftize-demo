import React from "react";
import { View, Text } from "react-native";
import TimeSelect from "@/modules/user-view/user-shift-forms/TimeSelect";
import { styles } from "../../MasterShiftCreate.styles";

interface TimeSelectSectionProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export const TimeSelectSection: React.FC<TimeSelectSectionProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>スタッフ時間</Text>
      <TimeSelect
        startTime={startTime}
        endTime={endTime}
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={onEndTimeChange}
      />
    </View>
  );
};