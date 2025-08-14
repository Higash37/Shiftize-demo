import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "./styles";
import { KanbanTaskFormData } from "./types";
import { kanbanTaskService } from "./kanban-task-service";
import { User } from "../../../services/auth/auth";

interface KanbanTaskCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  storeId: string;
  currentUser: User | null;
}

export const KanbanTaskCreateModal: React.FC<KanbanTaskCreateModalProps> = ({
  visible,
  onClose,
  onTaskCreated,
  storeId,
  currentUser,
}) => {
  const [formData, setFormData] = useState<KanbanTaskFormData>({
    title: "",
    description: "",
    priority: "medium",
    tags: [],
    isPublic: false,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert("エラー", "タスクタイトルを入力してください");
      return;
    }

    if (!currentUser) {
      Alert.alert("エラー", "ユーザー情報が取得できませんでした");
      return;
    }

    try {
      setLoading(true);
      await kanbanTaskService.createTask(
        formData,
        storeId,
        currentUser.uid,
        currentUser.nickname
      );

      // フォームをリセット
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        tags: [],
        isPublic: false,
      });

      onTaskCreated();
      onClose();
    } catch (error) {
      Alert.alert("エラー", "タスクの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dueDate: selectedDate });
    }
  };

  const priorityOptions = [
    { value: "high", label: "高", color: "#d32f2f" },
    { value: "medium", label: "中", color: "#ef6c00" },
    { value: "low", label: "低", color: "#2e7d32" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        {/* ヘッダー */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelButton}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>新しいタスク</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text
              style={[styles.modalSaveButton, loading && styles.disabledButton]}
            >
              {loading ? "作成中..." : "作成"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* タスクタイトル */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>タスクタイトル *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="タスクタイトルを入力"
              maxLength={100}
            />
          </View>

          {/* 説明 */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>説明</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="タスクの詳細を入力"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* 優先度 */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>優先度</Text>
            <View style={styles.priorityContainer}>
              {priorityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.priorityOption,
                    formData.priority === option.value &&
                      styles.prioritySelected,
                    { borderColor: option.color },
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, priority: option.value as any })
                  }
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      formData.priority === option.value && {
                        color: option.color,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 期限 */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>期限</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.datePickerText}>
                {formData.dueDate
                  ? formData.dueDate.toLocaleDateString("ja-JP")
                  : "期限を設定"}
              </Text>
              {formData.dueDate && (
                <TouchableOpacity
                  onPress={() =>
                    setFormData({ ...formData, dueDate: undefined })
                  }
                >
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* 公開設定 */}
          <View style={styles.formSection}>
            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.formLabel}>公開タスク</Text>
                <Text style={styles.switchDescription}>
                  他の講師も確認できるタスクにする
                </Text>
              </View>
              <Switch
                value={formData.isPublic}
                onValueChange={(value) =>
                  setFormData({ ...formData, isPublic: value })
                }
              />
            </View>
          </View>
        </ScrollView>

        {/* 日付ピッカー */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.dueDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
    </Modal>
  );
};
