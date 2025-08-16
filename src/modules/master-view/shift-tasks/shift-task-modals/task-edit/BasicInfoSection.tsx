import React from "react";
import { View, Text, TextInput } from "react-native";
import { useTaskCreateModalStyles } from "../TaskCreateModal.styles";
import { TaskEditFormData } from "./types";

interface BasicInfoSectionProps {
  formData: TaskEditFormData;
  onUpdateFormData: <K extends keyof TaskEditFormData>(
    field: K,
    value: TaskEditFormData[K]
  ) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onUpdateFormData,
}) => {
  const styles = useTaskCreateModalStyles();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>基本情報</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>タスク名 *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(value) => onUpdateFormData("title", value)}
          placeholder="タスク名を入力"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>略称 (2文字)</Text>
        <TextInput
          style={styles.input}
          value={formData.shortName}
          onChangeText={(value) => onUpdateFormData("shortName", value)}
          placeholder="XX"
          maxLength={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>説明</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => onUpdateFormData("description", value)}
          placeholder="タスクの詳細説明"
          multiline={true}
          numberOfLines={3}
        />
      </View>
    </View>
  );
};