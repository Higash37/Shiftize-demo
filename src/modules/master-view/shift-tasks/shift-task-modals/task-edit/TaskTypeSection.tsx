import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTaskCreateModalStyles } from "../TaskCreateModal.styles";
import { TaskEditFormData } from "./types";
import { taskTypes } from "./constants";

interface TaskTypeSectionProps {
  formData: TaskEditFormData;
  onUpdateFormData: <K extends keyof TaskEditFormData>(
    field: K,
    value: TaskEditFormData[K]
  ) => void;
}

export const TaskTypeSection: React.FC<TaskTypeSectionProps> = ({
  formData,
  onUpdateFormData,
}) => {
  const styles = useTaskCreateModalStyles();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>タスクタイプ</Text>
      {taskTypes.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.optionButton,
            formData.type === type.value && styles.selectedOption,
          ]}
          onPress={() => onUpdateFormData("type", type.value)}
        >
          <Text style={styles.optionLabel}>{type.label}</Text>
          <Text style={styles.optionDescription}>{type.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};