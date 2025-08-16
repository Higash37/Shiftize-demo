import React from "react";
import { View, Text, TextInput } from "react-native";
import { TaskFormData } from "./types";

interface BasicInfoSectionProps {
  formData: TaskFormData;
  onUpdateFormData: (field: keyof TaskFormData, value: any) => void;
  styles: any;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onUpdateFormData,
  styles,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>基本情報</Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>タスク名 *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.title}
          onChangeText={(text) => onUpdateFormData("title", text)}
          placeholder="タスク名を入力..."
          placeholderTextColor="#999"
          maxLength={100}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>略称（2文字）</Text>
        <TextInput
          style={[
            styles.textInput,
            formData.shortName && formData.shortName.length !== 2
              ? styles.errorInput
              : undefined,
          ]}
          value={formData.shortName}
          onChangeText={(text) => onUpdateFormData("shortName", text)}
          placeholder="略称を入力（例：会議）"
          placeholderTextColor="#999"
        />
        <Text style={styles.fieldHelper}>
          ガントチャートなどで表示される短縮名です（必ず2文字で入力）
        </Text>
        <Text
          style={[
            styles.characterCounter,
            formData.shortName && formData.shortName.length !== 2
              ? styles.characterCounterError
              : undefined,
          ]}
        >
          {formData.shortName.length}/2文字
        </Text>
        {formData.shortName && formData.shortName.length !== 2 && (
          <Text style={styles.errorText}>
            {formData.shortName.length < 2
              ? `あと${2 - formData.shortName.length}文字入力してください`
              : `2文字で入力してください（現在${formData.shortName.length}文字）`}
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>説明</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => onUpdateFormData("description", text)}
          placeholder="タスクの説明を入力..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );
};