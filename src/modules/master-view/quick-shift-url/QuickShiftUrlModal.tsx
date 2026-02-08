/**
 * クイックシフトURL発行モーダル
 * マスター画面から募集シフトURLやフリー追加URLを発行
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Clipboard,
} from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { ServiceProvider } from "@/services/ServiceProvider";
import { MaterialIcons } from "@expo/vector-icons";

interface QuickShiftUrlModalProps {
  visible: boolean;
  storeId: string;
  userId: string; // 教室長のUID
  onClose: () => void;
}

export const QuickShiftUrlModal: React.FC<QuickShiftUrlModalProps> = ({
  visible,
  storeId,
  userId,
  onClose,
}) => {
  const [urlType, setUrlType] = useState<"recruitment" | "free_add" | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // フリー追加型の設定
  const [expiryHours, setExpiryHours] = useState<string>("168"); // デフォルト7日間
  const [maxUses, setMaxUses] = useState<string>(""); // 空文字 = 無制限

  const handleClose = () => {
    setUrlType(null);
    setGeneratedUrl(null);
    setExpiryHours("168");
    setMaxUses("");
    onClose();
  };

  const handleGenerateFreeAddUrl = async () => {
    try {
      setGenerating(true);

      const options: {
        expiresInHours?: number;
        maxUses?: number;
        requireLineAuth?: boolean;
      } = {
        expiresInHours: parseInt(expiryHours) || 168,
        requireLineAuth: true,
      };

      if (maxUses) {
        options.maxUses = parseInt(maxUses);
      }

      const tokenId = await ServiceProvider.quickShiftTokens.createFreeAddToken(
        storeId,
        userId,
        options
      );

      const url = ServiceProvider.quickShiftTokens.generateQuickShiftUrl(
        tokenId,
        "free_add"
      );

      setGeneratedUrl(url);
      Alert.alert("成功", "URLを発行しました");
    } catch (error) {
      console.error("Error generating URL:", error);
      Alert.alert("エラー", "URL発行に失敗しました");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (generatedUrl) {
      Clipboard.setString(generatedUrl);
      Alert.alert("コピー完了", "URLをクリップボードにコピーしました");
    }
  };

  const handleShareLine = () => {
    // NOTE: LINEへの共有はクリップボードコピー → 手動貼り付けのフローを使用
    // LIFFは使用せず、シンプルなWeb URLで対応
    Alert.alert(
      "LINE共有",
      "URLをコピーしてLINEグループに貼り付けてください",
      [{ text: "OK", onPress: handleCopyUrl }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>クイックURL発行</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {!urlType && !generatedUrl && (
              <>
                <Text style={styles.sectionTitle}>URLタイプを選択</Text>

                <TouchableOpacity
                  style={styles.typeCard}
                  onPress={() => setUrlType("recruitment")}
                >
                  <MaterialIcons
                    name="event-available"
                    size={32}
                    color={colors.primary}
                  />
                  <View style={styles.typeCardContent}>
                    <Text style={styles.typeCardTitle}>募集シフト型</Text>
                    <Text style={styles.typeCardDescription}>
                      特定の募集シフトに応募するURL
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.typeCard}
                  onPress={() => setUrlType("free_add")}
                >
                  <MaterialIcons
                    name="add-circle-outline"
                    size={32}
                    color={colors.primary}
                  />
                  <View style={styles.typeCardContent}>
                    <Text style={styles.typeCardTitle}>フリー追加型</Text>
                    <Text style={styles.typeCardDescription}>
                      自由に日時を入力してシフト追加
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </>
            )}

            {urlType === "recruitment" && !generatedUrl && (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setUrlType(null)}
                >
                  <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
                  <Text style={styles.backButtonText}>戻る</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>募集シフト型URL</Text>
                <Text style={styles.helperText}>
                  ※ この機能は既存の募集シフト機能と統合予定です
                </Text>
              </>
            )}

            {urlType === "free_add" && !generatedUrl && (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setUrlType(null)}
                >
                  <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
                  <Text style={styles.backButtonText}>戻る</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>フリー追加型URL設定</Text>
                <Text style={styles.helperText}>
                  講師は任意の日時を入力してシフトを追加できます
                </Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>URL有効期限（時間）</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="168 (デフォルト: 7日間)"
                    value={expiryHours}
                    onChangeText={setExpiryHours}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>最大使用回数（空欄=無制限）</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="無制限"
                    value={maxUses}
                    onChangeText={setMaxUses}
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    generating && styles.generateButtonDisabled,
                  ]}
                  onPress={handleGenerateFreeAddUrl}
                  disabled={generating}
                >
                  {generating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.generateButtonText}>URL発行</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {generatedUrl && (
              <>
                <View style={styles.successContainer}>
                  <MaterialIcons
                    name="check-circle"
                    size={48}
                    color={colors.success}
                  />
                  <Text style={styles.successText}>URL発行完了</Text>
                </View>

                <View style={styles.urlContainer}>
                  <Text style={styles.urlText} numberOfLines={3}>
                    {generatedUrl}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCopyUrl}
                >
                  <MaterialIcons name="content-copy" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>URLをコピー</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.lineButton]}
                  onPress={handleShareLine}
                >
                  <MaterialIcons name="share" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>LINEで共有</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleClose}
                >
                  <Text style={styles.doneButtonText}>完了</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </TouchableOpacity>
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
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 600,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: layout.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  modalContent: {
    padding: layout.padding.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: layout.padding.large,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: layout.padding.medium,
  },
  typeCardContent: {
    flex: 1,
    marginLeft: layout.padding.medium,
  },
  typeCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  typeCardDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.medium,
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: colors.primary,
  },
  helperText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: layout.padding.medium,
  },
  formGroup: {
    marginBottom: layout.padding.large,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: layout.padding.medium,
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: colors.primary,
    padding: layout.padding.large,
    borderRadius: 12,
    alignItems: "center",
    marginTop: layout.padding.medium,
  },
  generateButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  successContainer: {
    alignItems: "center",
    marginBottom: layout.padding.large,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.success,
    marginTop: layout.padding.small,
  },
  urlContainer: {
    backgroundColor: colors.background,
    padding: layout.padding.large,
    borderRadius: 12,
    marginBottom: layout.padding.medium,
  },
  urlText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: layout.padding.large,
    borderRadius: 12,
    marginBottom: layout.padding.medium,
  },
  lineButton: {
    backgroundColor: "#06C755", // LINE緑色
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: layout.padding.small,
  },
  doneButton: {
    padding: layout.padding.large,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
