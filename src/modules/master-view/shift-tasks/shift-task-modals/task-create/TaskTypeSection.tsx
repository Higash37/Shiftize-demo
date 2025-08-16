import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TaskType } from "@/common/common-models/model-shift/shiftTypes";
import { TaskFormData } from "./types";

interface TaskTypeSectionProps {
  formData: TaskFormData;
  onUpdateFormData: (field: keyof TaskFormData, value: any) => void;
  styles: any;
}

export const TaskTypeSection: React.FC<TaskTypeSectionProps> = ({
  formData,
  onUpdateFormData,
  styles,
}) => {
  const taskTypes: { value: TaskType; label: string; icon: string }[] = [
    { value: "standard", label: "標準", icon: "checkbox-outline" },
    { value: "time_specific", label: "時間指定", icon: "time-outline" },
    { value: "periodic", label: "定期", icon: "repeat-outline" },
    { value: "automated", label: "自動", icon: "settings-outline" },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>タスクタイプ</Text>
      <View style={styles.typeGrid}>
        {taskTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              formData.type === type.value && styles.typeButtonActive,
            ]}
            onPress={() => onUpdateFormData("type", type.value)}
          >
            <Ionicons
              name={type.icon as any}
              size={24}
              color={formData.type === type.value ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.typeButtonText,
                formData.type === type.value && styles.typeButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};