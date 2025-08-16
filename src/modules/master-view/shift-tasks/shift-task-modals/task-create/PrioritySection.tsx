import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TaskLevel } from "@/common/common-models/model-shift/shiftTypes";
import { TaskFormData } from "./types";

interface PrioritySectionProps {
  formData: TaskFormData;
  onUpdateFormData: (field: keyof TaskFormData, value: any) => void;
  styles: any;
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({
  formData,
  onUpdateFormData,
  styles,
}) => {
  const levels: TaskLevel[] = ["low", "medium", "high"];
  const levelLabels: Record<TaskLevel, string> = {
    low: "低",
    medium: "中",
    high: "高",
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>優先度と難易度</Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>優先度</Text>
        <View style={styles.levelButtons}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                formData.priority === level && styles.levelButtonActive,
              ]}
              onPress={() => onUpdateFormData("priority", level)}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  formData.priority === level && styles.levelButtonTextActive,
                ]}
              >
                {levelLabels[level]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>難易度</Text>
        <View style={styles.levelButtons}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                formData.difficulty === level && styles.levelButtonActive,
              ]}
              onPress={() => onUpdateFormData("difficulty", level)}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  formData.difficulty === level && styles.levelButtonTextActive,
                ]}
              >
                {levelLabels[level]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};