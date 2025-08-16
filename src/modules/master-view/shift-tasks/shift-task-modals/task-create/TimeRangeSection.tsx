import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TimeRange } from "@/common/common-models/model-shift/shiftTypes";
import { TaskFormData } from "./types";

interface TimeRangeSectionProps {
  formData: TaskFormData;
  onUpdateFormData: (field: keyof TaskFormData, value: any) => void;
  onAddTimeRange: () => void;
  onRemoveTimeRange: (index: number) => void;
  styles: any;
}

export const TimeRangeSection: React.FC<TimeRangeSectionProps> = ({
  formData,
  onUpdateFormData,
  onAddTimeRange,
  onRemoveTimeRange,
  styles,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>時間制限</Text>
      
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>基本時間（分）</Text>
        <TextInput
          style={styles.textInput}
          value={formData.baseTimeMinutes.toString()}
          onChangeText={(text) => {
            const value = parseInt(text) || 0;
            onUpdateFormData("baseTimeMinutes", value);
          }}
          keyboardType="numeric"
          placeholder="30"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>シフトあたりの基本回数</Text>
        <TextInput
          style={styles.textInput}
          value={formData.baseCountPerShift.toString()}
          onChangeText={(text) => {
            const value = parseInt(text) || 1;
            onUpdateFormData("baseCountPerShift", value);
          }}
          keyboardType="numeric"
          placeholder="1"
        />
      </View>

      {formData.type === "time_specific" && (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>制限時間帯</Text>
          
          <View style={styles.timeRangeInputRow}>
            <TextInput
              style={[styles.textInput, styles.timeInput]}
              value={formData.restrictedStartTime}
              onChangeText={(text) => onUpdateFormData("restrictedStartTime", text)}
              placeholder="09:00"
              placeholderTextColor="#999"
            />
            <Text style={styles.timeSeparator}>〜</Text>
            <TextInput
              style={[styles.textInput, styles.timeInput]}
              value={formData.restrictedEndTime}
              onChangeText={(text) => onUpdateFormData("restrictedEndTime", text)}
              placeholder="17:00"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={onAddTimeRange}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {formData.restrictedTimeRanges.map((range, index) => (
            <View key={index} style={styles.timeRangeItem}>
              <Text style={styles.timeRangeText}>
                {range.startTime} 〜 {range.endTime}
              </Text>
              <TouchableOpacity
                onPress={() => onRemoveTimeRange(index)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};