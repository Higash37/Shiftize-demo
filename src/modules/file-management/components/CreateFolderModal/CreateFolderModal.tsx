import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { styles } from "@/modules/file-management/components/CreateFolderModal/CreateFolderModal.styles";

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => void;
}

export function CreateFolderModal({
  visible,
  onClose,
  onCreateFolder,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // フォルダ名の検証
  const validateFolderName = (
    name: string
  ): { isValid: boolean; error?: string } => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { isValid: false, error: "フォルダ名を入力してください。" };
    }

    if (trimmedName.length > 50) {
      return {
        isValid: false,
        error: "フォルダ名は50文字以内で入力してください。",
      };
    }

    // 不正な文字をチェック
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedName)) {
      return { isValid: false, error: "使用できない文字が含まれています。" };
    }

    // 予約語をチェック
    const reservedNames = [
      "con",
      "prn",
      "aux",
      "nul",
      "com1",
      "com2",
      "com3",
      "com4",
      "com5",
      "com6",
      "com7",
      "com8",
      "com9",
      "lpt1",
      "lpt2",
      "lpt3",
      "lpt4",
      "lpt5",
      "lpt6",
      "lpt7",
      "lpt8",
      "lpt9",
    ];
    if (reservedNames.includes(trimmedName.toLowerCase())) {
      return { isValid: false, error: "このフォルダ名は使用できません。" };
    }

    return { isValid: true };
  };

  // フォルダ作成処理
  const handleCreateFolder = async () => {
    const validation = validateFolderName(folderName);
    if (!validation.isValid) {
      Alert.alert("入力エラー", validation.error);
      return;
    }

    setIsCreating(true);
    try {
      await onCreateFolder(folderName.trim());
      setFolderName("");
      onClose();
    } catch (error) {
      Alert.alert("エラー", "フォルダの作成に失敗しました。");
    } finally {
      setIsCreating(false);
    }
  };

  // モーダルを閉じる処理
  const handleClose = () => {
    setFolderName("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>新しいフォルダ</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <MaterialIcons
                name="close"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="create-new-folder"
                size={48}
                color={colors.primary}
              />
            </View>

            <Text style={styles.label}>フォルダ名</Text>
            <TextInput
              style={styles.input}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="フォルダ名を入力してください"
              placeholderTextColor={colors.text.secondary}
              maxLength={50}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleCreateFolder}
            />

            <Text style={styles.hint}>
              使用できない文字: {'< > : " / \\ | ? *'}
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isCreating}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.createButton,
                (!folderName.trim() || isCreating) &&
                  styles.createButtonDisabled,
              ]}
              onPress={handleCreateFolder}
              disabled={!folderName.trim() || isCreating}
            >
              {isCreating ? (
                <Text style={styles.createButtonText}>作成中...</Text>
              ) : (
                <>
                  <MaterialIcons
                    name="create-new-folder"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.createButtonText}>作成</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
