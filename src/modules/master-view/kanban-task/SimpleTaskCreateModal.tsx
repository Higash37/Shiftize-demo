import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Switch,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { shadows } from "@/common/common-constants/ThemeConstants";
import { TaskFormData, NormalTask } from "./types";
import { normalTaskService } from "./normal-task-service";
import { User } from "../../../services/auth/auth";

interface SimpleTaskCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  storeId: string;
  currentUser: User | null;
  editTask?: NormalTask | null;
}

export const SimpleTaskCreateModal: React.FC<SimpleTaskCreateModalProps> = ({
  visible,
  onClose,
  onTaskCreated,
  storeId,
  currentUser,
  editTask,
}) => {
  const isEditMode = !!editTask;

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "medium",
    tags: [],
    isPublic: false,
  });
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // 編集モード時のフォーム初期化
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description || "",
        priority: editTask.priority,
        tags: editTask.tags || [],
        isPublic: editTask.isPublic,
        startDate: editTask.startDate,
        dueDate: editTask.dueDate,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        tags: [],
        isPublic: false,
      });
    }
  }, [editTask]);

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

      if (isEditMode && editTask) {
        // 編集モード
        await normalTaskService.updateTask(editTask.id, formData);
      } else {
        // 新規作成モード
        await normalTaskService.createTask(
          formData,
          storeId,
          currentUser.uid,
          currentUser.nickname
        );
      }

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
      console.error(
        isEditMode ? "タスク更新エラー:" : "タスク作成エラー:",
        error
      );
      Alert.alert(
        "エラー",
        isEditMode ? "タスクの更新に失敗しました" : "タスクの作成に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    setShowDueDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dueDate: selectedDate });
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, startDate: selectedDate });
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "今日";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "明日";
    } else {
      return date.toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditMode ? "タスク編集" : "新しいタスク"}
            </Text>
            <TouchableOpacity onPress={handleSubmit} disabled={loading}>
              <Text
                style={[
                  styles.saveButton,
                  { color: loading ? "#ccc" : "#007AFF" },
                ]}
              >
                {loading
                  ? isEditMode
                    ? "更新中..."
                    : "作成中..."
                  : isEditMode
                  ? "更新"
                  : "保存"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* タスクタイトル */}
            <View style={{ marginTop: 20 }}>
              <TextInput
                style={{
                  fontSize: 18,
                  color: "#333",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#e0e0e0",
                }}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="タスクタイトル"
                placeholderTextColor="#999"
                maxLength={100}
                autoFocus
              />
            </View>

            {/* 詳細 */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: 8,
                }}
              >
                詳細
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#e0e0e0",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: "#333",
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="詳細な説明を入力してください..."
                multiline
                numberOfLines={4}
              />
            </View>

            {/* 開始予定日 */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons
                name="play-circle-outline"
                size={20}
                color="#666"
                style={{ marginRight: 12 }}
              />
              <Text style={{ fontSize: 15, color: "#333", flex: 1 }}>
                開始予定
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {formData.startDate ? (
                  <>
                    <Text
                      style={{ fontSize: 15, color: "#007AFF", marginRight: 8 }}
                    >
                      {formatDate(formData.startDate)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setFormData({ ...formData, startDate: undefined })
                      }
                    >
                      <Ionicons name="close-circle" size={20} color="#ccc" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={{ fontSize: 15, color: "#999" }}>設定なし</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* 期限 */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
              onPress={() => setShowDueDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#666"
                style={{ marginRight: 12 }}
              />
              <Text style={{ fontSize: 15, color: "#333", flex: 1 }}>期限</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {formData.dueDate ? (
                  <>
                    <Text
                      style={{ fontSize: 15, color: "#007AFF", marginRight: 8 }}
                    >
                      {formatDate(formData.dueDate)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setFormData({ ...formData, dueDate: undefined })
                      }
                    >
                      <Ionicons name="close-circle" size={20} color="#ccc" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={{ fontSize: 15, color: "#999" }}>期限なし</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* 優先度 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
            >
              <Ionicons
                name="flag-outline"
                size={20}
                color="#666"
                style={{ marginRight: 12 }}
              />
              <Text style={{ fontSize: 15, color: "#333", flex: 1 }}>
                優先度
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[
                  { value: "low", label: "低", color: "#34C759" },
                  { value: "medium", label: "中", color: "#FF9500" },
                  { value: "high", label: "高", color: "#FF3B30" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor:
                        formData.priority === option.value
                          ? option.color
                          : "#f0f0f0",
                    }}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        priority: option.value as any,
                      })
                    }
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          formData.priority === option.value ? "#fff" : "#666",
                        fontWeight:
                          formData.priority === option.value ? "600" : "400",
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 公開設定 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color="#666"
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: "#333" }}>全員に公開</Text>
                <Text style={{ fontSize: 13, color: "#999", marginTop: 2 }}>
                  他の講師も確認できるタスクにする
                </Text>
              </View>
              <Switch
                value={formData.isPublic}
                onValueChange={(value) =>
                  setFormData({ ...formData, isPublic: value })
                }
                trackColor={{ false: "#e0e0e0", true: "#007AFF" }}
                thumbColor="#fff"
              />
            </View>
          </ScrollView>

          {/* 日付ピッカー */}
          {showDueDatePicker && (
            <DateTimePicker
              value={formData.dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDueDateChange}
              minimumDate={new Date()}
            />
          )}

          {showStartDatePicker && (
            <DateTimePicker
              value={formData.startDate || new Date()}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    ...shadows.modal,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
