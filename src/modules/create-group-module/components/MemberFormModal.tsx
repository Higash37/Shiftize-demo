import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PRESET_COLORS } from "@/common/common-ui/ui-forms/FormColorPicker.constants";
import { InitialMember } from "./types";

interface MemberFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (member: InitialMember) => void;
  existingMembers: InitialMember[];
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  visible,
  onClose,
  onSave,
  existingMembers,
}) => {
  const [formData, setFormData] = useState({
    nickname: "",
    password: "",
    role: "user" as "master" | "user",
    color: PRESET_COLORS[0],
    hourlyWage: "",
  });

  useEffect(() => {
    if (visible) {
      // 使用されていない色を自動選択
      const usedColors = existingMembers.map((m) => m.color);
      const availableColor =
        PRESET_COLORS.find((color) => !usedColors.includes(color)) ||
        PRESET_COLORS[0];
      
      setFormData({
        nickname: "",
        password: "",
        role: "user",
        color: availableColor,
        hourlyWage: "",
      });
    }
  }, [visible, existingMembers]);

  const validateForm = () => {
    if (!formData.nickname.trim()) {
      Alert.alert("エラー", "ニックネームを入力してください");
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert("エラー", "パスワードを入力してください");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("エラー", "パスワードは6文字以上で入力してください");
      return false;
    }

    // 重複チェック
    const isDuplicateNickname = existingMembers.some(
      (member) => member.nickname.trim() === formData.nickname.trim()
    );
    if (isDuplicateNickname) {
      Alert.alert("エラー", "既に同じニックネームのメンバーが存在します");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newMember: InitialMember = {
      id: Date.now().toString(),
      nickname: formData.nickname.trim(),
      password: formData.password,
      role: formData.role,
      color: formData.color,
      hourlyWage: formData.hourlyWage
        ? parseInt(formData.hourlyWage, 10)
        : undefined,
    };

    onSave(newMember);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>メンバー追加</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* ニックネーム */}
            <View style={styles.field}>
              <Text style={styles.label}>
                ニックネーム <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.nickname}
                onChangeText={(text) => setFormData({ ...formData, nickname: text })}
                placeholder="例：山田"
                maxLength={20}
              />
            </View>

            {/* パスワード */}
            <View style={styles.field}>
              <Text style={styles.label}>
                パスワード <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="6文字以上"
                secureTextEntry
                maxLength={50}
              />
            </View>

            {/* 権限 */}
            <View style={styles.field}>
              <Text style={styles.label}>権限</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "user" && styles.roleOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "user" })}
                >
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === "user" && styles.roleTextActive,
                    ]}
                  >
                    スタッフ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    formData.role === "master" && styles.roleOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: "master" })}
                >
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === "master" && styles.roleTextActive,
                    ]}
                  >
                    管理者
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 色選択 */}
            <View style={styles.field}>
              <Text style={styles.label}>表示色</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.colorPicker}
              >
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, color })}
                  >
                    {formData.color === color && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 時給（任意） */}
            <View style={styles.field}>
              <Text style={styles.label}>時給（任意）</Text>
              <TextInput
                style={styles.input}
                value={formData.hourlyWage}
                onChangeText={(text) => setFormData({ ...formData, hourlyWage: text })}
                placeholder="例：1000"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#dc2626",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: "row",
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
  },
  roleOptionActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  roleText: {
    fontSize: 14,
    color: "#374151",
  },
  roleTextActive: {
    color: "white",
  },
  colorPicker: {
    flexDirection: "row",
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#374151",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  saveButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
});