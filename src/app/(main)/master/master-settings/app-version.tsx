import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { updateAppVersion } from "@/services/version/VersionManager";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase-core";
import { colors } from "@/common/common-constants/ThemeConstants";

export default function AppVersionManager() {
  const router = useRouter();
  const [currentVersion, setCurrentVersion] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadCurrentVersion();
  }, []);

  const loadCurrentVersion = async () => {
    try {
      const versionDoc = await getDoc(doc(db, "settings", "app_version"));
      if (versionDoc.exists()) {
        const data = versionDoc.data();
        setCurrentVersion(data['version'] || "1.0.0");
        setNewVersion(data['version'] || "1.0.0");
        setForceUpdate(data['forceUpdate'] || false);
        setUpdateMessage(data['updateMessage'] || "");
        if (data['updatedAt']) {
          setLastUpdate(data['updatedAt'].toDate());
        }
      } else {
        setCurrentVersion("1.0.0");
        setNewVersion("1.0.0");
      }
    } catch (error) {
      console.error("Failed to load current version", error);
    }
  };

  const handleUpdateVersion = async () => {
    if (!newVersion) {
      Alert.alert("エラー", "バージョンを入力してください");
      return;
    }

    // バージョン形式のバリデーション
    const versionPattern = /^\d+\.\d+\.\d+$/;
    if (!versionPattern.test(newVersion)) {
      Alert.alert("エラー", "バージョンは x.x.x 形式で入力してください");
      return;
    }

    Alert.alert(
      "確認",
      `バージョンを ${newVersion} に更新します。${
        forceUpdate ? "\n既存ユーザーは強制的に更新されます。" : ""
      }`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "更新",
          onPress: async () => {
            setIsLoading(true);
            try {
              await updateAppVersion(
                newVersion,
                forceUpdate,
                updateMessage || undefined
              );
              Alert.alert("成功", "バージョン情報を更新しました");
              await loadCurrentVersion();
                        } catch (error) {
              console.error("Failed to update app version", error);
              Alert.alert("�G���[", "�X�V�Ɏ��s���܂���");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>アプリバージョン管理</Text>

        <View style={styles.infoSection}>
          <Text style={styles.label}>現在のバージョン</Text>
          <Text style={styles.currentVersion}>{currentVersion}</Text>
          {lastUpdate && (
            <Text style={styles.lastUpdateText}>
              最終更新: {lastUpdate.toLocaleString("ja-JP")}
            </Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>新しいバージョン</Text>
          <TextInput
            style={styles.input}
            value={newVersion}
            onChangeText={setNewVersion}
            placeholder="例: 1.0.1"
            placeholderTextColor={colors.text.disabled}
          />
        </View>

        <View style={styles.switchSection}>
          <Text style={styles.label}>強制アップデート</Text>
          <Switch
            value={forceUpdate}
            onValueChange={setForceUpdate}
            trackColor={{ false: colors.text.disabled, true: colors.primary }}
            thumbColor={forceUpdate ? colors.text.white : colors.border}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>更新メッセージ（任意）</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={updateMessage}
            onChangeText={setUpdateMessage}
            placeholder="例: 重要なバグ修正が含まれています"
            placeholderTextColor={colors.text.disabled}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>📝 メモ</Text>
          <Text style={styles.noteText}>
            • 強制アップデート: ONにすると既存ユーザーは自動的に更新されます
          </Text>
          <Text style={styles.noteText}>
            • 強制アップデート: OFFの場合、ユーザーに更新を促すダイアログが表示されます
          </Text>
          <Text style={styles.noteText}>
            • バージョンチェックは1分ごとに自動実行されます
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            isLoading && styles.updateButtonDisabled,
          ]}
          onPress={handleUpdateVersion}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.text.white} />
          ) : (
            <Text style={styles.updateButtonText}>バージョン更新</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: colors.primary,
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.primary,
    marginBottom: 8,
  },
  currentVersion: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: colors.text.primary,
  },
  lastUpdateText: {
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 4,
  },
  inputSection: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  messageInput: {
    minHeight: 80,
    textAlignVertical: "top" as const,
  },
  switchSection: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 20,
    paddingVertical: 8,
  },
  noteSection: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.primary,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  updateButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  backButton: {
    padding: 16,
    alignItems: "center" as const,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
};
