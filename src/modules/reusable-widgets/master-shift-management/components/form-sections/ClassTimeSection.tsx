import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import TimeSelect from "@/modules/user-view/user-shift-forms/TimeSelect";
import { colors } from "@/common/common-constants/ThemeConstants";
import { styles } from "../../MasterShiftCreate.styles";
import { ClassTime } from "../types";

interface ClassTimeSectionProps {
  hasClass: boolean;
  classes: ClassTime[];
  onToggleClass: () => void;
  onClassTimeChange: (index: number, field: 'startTime' | 'endTime', value: string) => void;
  onRemoveClass: (index: number) => void;
  onAddClass: () => void;
}

export const ClassTimeSection: React.FC<ClassTimeSectionProps> = ({
  hasClass,
  classes,
  onToggleClass,
  onClassTimeChange,
  onRemoveClass,
  onAddClass,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>授業時間</Text>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={onToggleClass}
      >
        <Text style={styles.toggleButtonText}>
          {hasClass ? "授業あり" : "授業なし"}
        </Text>
      </TouchableOpacity>
      {hasClass && (
        <View style={styles.classesContainer}>
          {classes.map((classTime, index) => (
            <View key={index} style={styles.classTimeContainer}>
              <TimeSelect
                startTime={classTime.startTime}
                endTime={classTime.endTime}
                onStartTimeChange={(time: string) => {
                  onClassTimeChange(index, 'startTime', time);
                }}
                onEndTimeChange={(time: string) => {
                  onClassTimeChange(index, 'endTime', time);
                }}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveClass(index)}
              >
                <AntDesign
                  name="close"
                  size={20}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddClass}
          >
            <AntDesign name="pluscircle" size={22} color="#fff" />
            <Text style={styles.addButtonText}>授業を追加</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};