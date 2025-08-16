import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { generateTimeOptions } from "./constants";

interface TimeSelectSectionProps {
  startTime: string;
  endTime: string;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
}

export const TimeSelectSection: React.FC<TimeSelectSectionProps> = ({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}) => {
  const timeOptions = generateTimeOptions();

  return (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>開始時刻 *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={startTime}
            onValueChange={setStartTime}
            style={styles.picker}
          >
            <Picker.Item label="選択してください" value="" />
            {timeOptions.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>終了時刻 *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={endTime}
            onValueChange={setEndTime}
            style={styles.picker}
          >
            <Picker.Item label="選択してください" value="" />
            {timeOptions.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: layout.spacing.medium,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.spacing.small,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    ...Platform.select({
      ios: {
        paddingVertical: layout.spacing.small,
      },
    }),
  },
  picker: {
    height: Platform.OS === "ios" ? 120 : 50,
  },
});