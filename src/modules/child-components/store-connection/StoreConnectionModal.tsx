import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  Clipboard,
} from "react-native";
import Input from "@/common/common-ui/ui-forms/FormInput";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { AntDesign } from "@expo/vector-icons";
import { colors, typography, shadows } from "@/common/common-constants/ThemeConstants";
import { MultiStoreService } from "@/services/firebase/firebase-multistore";
import { useAuth } from "@/services/auth/useAuth";

interface StoreConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentStoreId: string;
  onConnectionSuccess: () => void;
  connectedStores?: string[]; // 連携済み店舗のリスト
}

/**
 * 店舗連携モーダルコンポーネント
 */
export const StoreConnectionModal: React.FC<StoreConnectionModalProps> = ({
  visible,
  onClose,
  currentStoreId,
  onConnectionSuccess,
  connectedStores = [],
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"generate" | "connect" | "disconnect">(
    "generate"
  );
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [targetStoreId, setTargetStoreId] = useState<string>("");
  const [connectionPassword, setConnectionPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleGeneratePassword = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const password = await MultiStoreService.generateConnectionPassword(
        currentStoreId,
        user.uid
      );
      setGeneratedPassword(password);
      Alert.alert(
        "連携パスワード生成完了",
        `連携パスワード: ${password}\n\nこのパスワードを連携したい相手に伝えてください。\n有効期限: 24時間`
      );
    } catch (error) {
      Alert.alert("エラー", "連携パスワードの生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStore = async () => {
    if (!user?.uid || !targetStoreId || !connectionPassword) {
      Alert.alert("エラー", "教室IDと連携パスワードを入力してください");
      return;
    }

    try {
      setLoading(true);
      await MultiStoreService.connectStores(
        currentStoreId,
        targetStoreId,
        connectionPassword,
        user.uid
      );

      Alert.alert("連携完了", `教室${targetStoreId}との連携が完了しました！`, [
        {
          text: "OK",
          onPress: () => {
            onConnectionSuccess();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("連携エラー", error.message || "店舗連携に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGeneratedPassword("");
    setTargetStoreId("");
    setConnectionPassword("");
    setMode("generate");
  };

  const handleCopyPassword = async () => {
    if (generatedPassword) {
      try {
        Clipboard.setString(generatedPassword);
        Alert.alert(
          "コピー完了",
          "パスワードがクリップボードにコピーされました"
        );
      } catch (error) {
        Alert.alert("エラー", "パスワードのコピーに失敗しました");
      }
    }
  };

  const handleDisconnectStore = async (disconnectStoreId: string) => {
    if (!user?.uid) return;

    Alert.alert(
      "連携解除確認",
      `教室${disconnectStoreId}との連携を解除しますか？`,
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "解除",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await MultiStoreService.disconnectStores(
                currentStoreId,
                disconnectStoreId,
                user.uid
              );

              Alert.alert(
                "連携解除完了",
                `教室${disconnectStoreId}との連携を解除しました`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      onConnectionSuccess();
                      onClose();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert("エラー", error.message || "連携解除に失敗しました");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          activeOpacity={1}
          onPress={() => {
            onClose();
            resetForm();
          }}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>教室連携</Text>
            <TouchableOpacity
              onPress={() => {
                onClose();
                resetForm();
              }}
            >
              <AntDesign name="close" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "generate" && styles.modeButtonActive,
              ]}
              onPress={() => setMode("generate")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === "generate" && styles.modeButtonTextActive,
                ]}
              >
                パスワード生成
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "connect" && styles.modeButtonActive,
              ]}
              onPress={() => setMode("connect")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === "connect" && styles.modeButtonTextActive,
                ]}
              >
                教室に連携
              </Text>
            </TouchableOpacity>
            {connectedStores.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === "disconnect" && styles.modeButtonActive,
                ]}
                onPress={() => setMode("disconnect")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === "disconnect" && styles.modeButtonTextActive,
                  ]}
                >
                  連携解除
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {mode === "generate" && (
            <View style={styles.generateSection}>
              <Text style={styles.sectionTitle}>連携パスワードを生成</Text>
              <Text style={styles.description}>
                他の教室と連携するためのパスワードを生成します。
                生成されたパスワードを連携したい相手に伝えてください。
              </Text>

              {generatedPassword && (
                <View style={styles.passwordDisplay}>
                  <Text style={styles.passwordLabel}>
                    生成されたパスワード:
                  </Text>
                  <TouchableOpacity
                    style={styles.passwordContainer}
                    onPress={handleCopyPassword}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.passwordText}>{generatedPassword}</Text>
                    <AntDesign name="copy1" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.passwordNote}>
                    有効期限: 24時間 | タップしてコピー
                  </Text>
                </View>
              )}

              <Button
                title="パスワード生成"
                onPress={handleGeneratePassword}
                loading={loading}
                style={styles.actionButton}
              />
            </View>
          )}
          {mode === "connect" && (
            <View style={styles.connectSection}>
              <Text style={styles.sectionTitle}>教室に連携</Text>
              <Text style={styles.description}>
                連携したい教室のIDとパスワードを入力してください。
              </Text>

              <Input
                label="連携先教室ID（4桁）"
                value={targetStoreId}
                onChangeText={setTargetStoreId}
                placeholder="例: 1422"
                maxLength={4}
                keyboardType="numeric"
                style={styles.input}
              />

              <Input
                label="連携パスワード"
                value={connectionPassword}
                onChangeText={setConnectionPassword}
                placeholder="連携パスワードを入力"
                style={styles.input}
              />

              <Button
                title="連携実行"
                onPress={handleConnectStore}
                loading={loading}
                disabled={!targetStoreId || !connectionPassword}
                style={styles.actionButton}
              />
            </View>
          )}
          {mode === "disconnect" && (
            <View style={styles.disconnectSection}>
              <Text style={styles.sectionTitle}>連携解除</Text>
              <Text style={styles.description}>
                連携を解除したい教室を選択してください。
              </Text>

              {connectedStores.length > 0 ? (
                connectedStores.map((storeId) => (
                  <TouchableOpacity
                    key={storeId}
                    style={styles.connectedStoreItem}
                    onPress={() => handleDisconnectStore(storeId)}
                    disabled={loading}
                  >
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeIdText}>教室{storeId}</Text>
                      <AntDesign
                        name="disconnect"
                        size={16}
                        color={colors.error}
                      />
                    </View>
                    <Text style={styles.disconnectText}>
                      タップして連携解除
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noStoresText}>
                  連携している教室がありません
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    ...shadows.modal,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: "700",
    color: colors.text.primary,
  },
  modeSelector: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: colors.text.white,
  },
  generateSection: {
    gap: 16,
  },
  connectSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: "600",
    color: colors.text.primary,
  },
  description: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  passwordDisplay: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  passwordLabel: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary + "30",
    marginBottom: 8,
    gap: 12,
  },
  passwordText: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 2,
    flex: 1,
  },
  passwordNote: {
    fontSize: typography.fontSize.small,
    color: colors.warning,
  },
  input: {
    marginBottom: 12,
  },
  actionButton: {
    marginTop: 8,
  },
  disconnectSection: {
    gap: 16,
  },
  connectedStoreItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error + "30",
  },
  storeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  storeIdText: {
    fontSize: typography.fontSize.medium,
    fontWeight: "600",
    color: colors.text.primary,
  },
  disconnectText: {
    fontSize: typography.fontSize.small,
    color: colors.error,
  },
  noStoresText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
    textAlign: "center",
    padding: 20,
  },
});
