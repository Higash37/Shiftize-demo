import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { useAuth } from "@/services/auth/useAuth";

interface MobileShiftModalProps {
  visible: boolean;
  isEdit: boolean;
  shiftData: {
    date: string;
    startTime: string;
    endTime: string;
    userId: string;
    nickname: string;
    status: string;
    subject?: string;
    notes?: string;
  };
  users: Array<{ uid: string; nickname: string }>;
  timeOptions: string[];
  statusConfigs: Array<{ status: string; label: string; color: string }>;
  isLoading: boolean;
  onChange: (field: string, value: any) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export const MobileShiftModal: React.FC<MobileShiftModalProps> = React.memo(({
  visible,
  isEdit,
  shiftData,
  users,
  timeOptions,
  statusConfigs,
  isLoading,
  onChange,
  onClose,
  onSave,
  onDelete,
}) => {
  const { user } = useAuth();
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<"start" | "end" | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const isMaster = user?.role === "master";
  const selectedUser = users.find(u => u.uid === shiftData.userId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleUserSelect = (selectedUser: { uid: string; nickname: string }) => {
    onChange("userId", selectedUser.uid);
    onChange("nickname", selectedUser.nickname);
    setShowUserPicker(false);
  };

  const handleTimeSelect = (time: string) => {
    if (showTimePicker === "start") {
      onChange("startTime", time);
    } else if (showTimePicker === "end") {
      onChange("endTime", time);
    }
    setShowTimePicker(null);
  };

  const handleStatusSelect = (status: string) => {
    onChange("status", status);
    setShowStatusPicker(false);
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      "削除確認",
      "このシフトを削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "削除", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* ヘッダー */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>
                  {isEdit ? "シフト編集" : "シフト追加"}
                </Text>
                <Text style={styles.subtitle}>
                  {formatDate(shiftData.date)}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ユーザー選択 */}
              {isMaster && (
                <View style={styles.section}>
                  <Text style={styles.label}>担当者</Text>
                  <TouchableOpacity 
                    style={styles.selector}
                    onPress={() => setShowUserPicker(true)}
                  >
                    <Text style={styles.selectorText}>
                      {selectedUser ? selectedUser.nickname : "選択してください"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              )}

              {/* 時間選択 */}
              <View style={styles.section}>
                <Text style={styles.label}>時間</Text>
                <View style={styles.timeRow}>
                  <TouchableOpacity 
                    style={[styles.timeSelector, { flex: 1, marginRight: 8 }]}
                    onPress={() => setShowTimePicker("start")}
                  >
                    <Text style={styles.selectorText}>{shiftData.startTime}</Text>
                    <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                  
                  <Text style={styles.timeSeparator}>〜</Text>
                  
                  <TouchableOpacity 
                    style={[styles.timeSelector, { flex: 1, marginLeft: 8 }]}
                    onPress={() => setShowTimePicker("end")}
                  >
                    <Text style={styles.selectorText}>{shiftData.endTime}</Text>
                    <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ステータス選択（マスターのみ） */}
              {isMaster && (
                <View style={styles.section}>
                  <Text style={styles.label}>ステータス</Text>
                  <TouchableOpacity 
                    style={styles.selector}
                    onPress={() => setShowStatusPicker(true)}
                  >
                    <Text style={styles.selectorText}>
                      {statusConfigs.find(s => s.status === shiftData.status)?.label || shiftData.status}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              )}

              {/* 件名 */}
              <View style={styles.section}>
                <Text style={styles.label}>件名</Text>
                <TextInput
                  style={styles.textInput}
                  value={shiftData.subject || ""}
                  onChangeText={(text) => onChange("subject", text)}
                  placeholder="件名を入力（任意）"
                  placeholderTextColor={colors.text.secondary}
                />
              </View>

              {/* メモ */}
              <View style={styles.section}>
                <Text style={styles.label}>メモ</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={shiftData.notes || ""}
                  onChangeText={(text) => onChange("notes", text)}
                  placeholder="メモを入力（任意）"
                  placeholderTextColor={colors.text.secondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            {/* ボタン */}
            <View style={styles.footer}>
              {isEdit && onDelete && (
                <TouchableOpacity 
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeleteConfirm}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                  <Text style={styles.deleteButtonText}>削除</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton, isEdit && onDelete && { flex: 1, marginLeft: 12 }]}
                onPress={onSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.saveButtonText}>
                      {isEdit ? "更新" : "保存"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ユーザー選択モーダル */}
      <Modal
        visible={showUserPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUserPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>担当者を選択</Text>
              <TouchableOpacity onPress={() => setShowUserPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.pickerContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {users.map((user) => (
                <TouchableOpacity
                  key={user.uid}
                  style={styles.pickerItem}
                  onPress={() => handleUserSelect(user)}
                >
                  <Text style={styles.pickerItemText}>{user.nickname}</Text>
                  {shiftData.userId === user.uid && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 時間選択モーダル */}
      <Modal
        visible={showTimePicker !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(null)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {showTimePicker === "start" ? "開始時間" : "終了時間"}を選択
              </Text>
              <TouchableOpacity onPress={() => setShowTimePicker(null)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.pickerContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={styles.pickerItem}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text style={styles.pickerItemText}>{time}</Text>
                  {(showTimePicker === "start" ? shiftData.startTime : shiftData.endTime) === time && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ステータス選択モーダル */}
      <Modal
        visible={showStatusPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>ステータスを選択</Text>
              <TouchableOpacity onPress={() => setShowStatusPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.pickerContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {statusConfigs.map((config) => (
                <TouchableOpacity
                  key={config.status}
                  style={styles.pickerItem}
                  onPress={() => handleStatusSelect(config.status)}
                >
                  <View style={styles.statusItem}>
                    <View style={[styles.statusIndicator, { backgroundColor: config.color }]} />
                    <Text style={styles.pickerItemText}>{config.label}</Text>
                  </View>
                  {shiftData.status === config.status && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  selector: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  selectorText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeSelector: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  timeSeparator: {
    fontSize: 16,
    color: colors.text.secondary,
    marginHorizontal: 8,
  },
  textInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    flex: 0,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  
  // ピッカーモーダルのスタイル
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  pickerContent: {
    flex: 1,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
});