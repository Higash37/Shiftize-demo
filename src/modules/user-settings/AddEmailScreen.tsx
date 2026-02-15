import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors } from "@/common/common-constants/ColorConstants";
import { typography } from "@/common/common-constants/TypographyConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Button from "@/common/common-ui/ui-forms/FormButton";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { useAuth } from "@/services/auth/useAuth";
import { ServiceProvider } from "@/services/ServiceProvider";

/**
 * 既存ユーザーが実際のメールアドレスを追加する画面
 */
export const AddEmailScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width > 768;
  const { user: currentUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = (): boolean => {
    if (!email) {
      setError("メールアドレスを入力してください");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("有効なメールアドレスを入力してください");
      return false;
    }
    if (!password) {
      setError("現在のパスワードを入力してください");
      return false;
    }
    return true;
  };

  const handleAddEmail = async () => {
    if (!validateForm()) return;
    if (!currentUser) {
      setError("ログインが必要です");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: パスワード確認は Supabase Auth の reauthenticate を使用すべき
      // 現在は簡易実装でスキップ
      if (!password) {
        throw new Error("パスワードを入力してください");
      }

      // メールアドレス追加処理
      await ServiceProvider.users.addSecondaryEmail(currentUser.uid, email);

      Alert.alert(
        "完了",
        "実際のメールアドレスが追加されました。今後は自動生成メールアドレスと実際のメールアドレス、どちらでもログインできます。",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      setError(err.message || "メールアドレスの追加に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        <Box style={[styles.formCard, isDesktop && styles.formCardDesktop]}>
          <Text style={styles.title}>実際のメールアドレスを追加</Text>
          <Text style={styles.subtitle}>
            実際のメールアドレスを追加すると、自動生成メールアドレスと実際のメールアドレス、どちらでもログインできるようになります。
          </Text>

          {/* 現在の情報表示 */}
          <View style={styles.currentInfoContainer}>
            <Text style={styles.currentInfoLabel}>現在のログイン情報</Text>
            <Text style={styles.currentInfoText}>
              自動生成メール: {currentUser?.email}
            </Text>
            <Text style={styles.currentInfoText}>
              ニックネーム: {currentUser?.nickname}
            </Text>
          </View>

          {/* エラーメッセージ */}
          {error && (
            <Box variant="outlined" style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </Box>
          )}

          {/* 実際のメールアドレス入力 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>追加する実際のメールアドレス</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@gmail.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* パスワード確認 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>現在のパスワード（確認用）</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="現在のパスワードを入力"
              placeholderTextColor="#999"
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* 注意事項 */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ 追加後は以下の2つの方法でログインできます：{"\n"}•
              自動生成メール: {currentUser?.email}
              {"\n"}• 実際のメール: 上記で入力したメールアドレス
            </Text>
          </View>

          {/* ボタン */}
          <View style={styles.buttonContainer}>
            <Button
              title="キャンセル"
              onPress={() => router.back()}
              variant="outline"
              disabled={loading}
              style={styles.button}
            />
            <Button
              title={loading ? "追加中..." : "メールアドレスを追加"}
              onPress={handleAddEmail}
              disabled={loading}
              style={styles.button}
            />
          </View>
        </Box>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: layout.padding.large,
  },
  contentDesktop: {
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    padding: layout.padding.xlarge,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.large,
    ...shadows.medium,
  },
  formCardDesktop: {
    width: "100%",
    maxWidth: 500,
  },
  title: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
    marginBottom: layout.padding.xlarge,
    textAlign: "center",
    lineHeight: 22,
  },
  currentInfoContainer: {
    backgroundColor: colors.primary + "10",
    padding: layout.padding.large,
    borderRadius: layout.borderRadius.medium,
    marginBottom: layout.padding.xlarge,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  currentInfoLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: layout.padding.small,
  },
  currentInfoText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  errorContainer: {
    backgroundColor: colors.error + "10",
    borderColor: colors.error,
    marginBottom: layout.padding.large,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    fontSize: typography.fontSize.medium,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: layout.padding.large,
  },
  inputLabel: {
    fontSize: typography.fontSize.medium,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.small,
    padding: layout.padding.medium,
    fontSize: typography.fontSize.medium,
    backgroundColor: colors.background,
    color: colors.text.primary,
  },
  warningContainer: {
    backgroundColor: colors.warning + "10",
    padding: layout.padding.large,
    borderRadius: layout.borderRadius.medium,
    marginBottom: layout.padding.xlarge,
    borderWidth: 1,
    borderColor: colors.warning + "30",
  },
  warningText: {
    fontSize: typography.fontSize.small,
    color: colors.warning,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: layout.padding.large,
  },
  button: {
    flex: 1,
  },
});
