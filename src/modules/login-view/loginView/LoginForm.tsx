import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { LoginFormProps } from "./LoginForm.types";
import { YoutubeSkeleton } from "@/common/common-ui/ui-loading/SkeletonLoader";
import { useAutoReloadOnLayoutBug } from "@/common/common-ui/ui-loading/useAutoReloadOnLayoutBug";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { createLoginFormStyles } from "./LoginForm.styles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  loading,
  showDemoModal: externalShowDemoModal,
  setShowDemoModal: externalSetShowDemoModal,
}) => {
  useAutoReloadOnLayoutBug();
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(() => createLoginFormStyles(theme, bp), [theme, bp]);
  const { colorScheme } = theme;

  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [storeIdAndUsername, setStoreIdAndUsername] = useState("");
  const [loginMode, setLoginMode] = useState<"storeId" | "email">("storeId");
  const [emailInput, setEmailInput] = useState("");
  const [saveStoreId, setSaveStoreId] = useState(true);
  const [demoRoleModalVisible, setDemoRoleModalVisible] = useState(
    externalShowDemoModal || false
  );

  useEffect(() => {
    const loadSavedStoreId = async () => {
      try {
        const savedStoreId = await StoreIdStorage.getStoreId();
        if (savedStoreId) {
          setStoreIdAndUsername(savedStoreId);
          setSaveStoreId(true);
        }
      } catch (error) {
        // Error loading saved store ID - fail silently
      }
    };
    loadSavedStoreId();
  }, []);

  useEffect(() => {
    if (externalShowDemoModal !== undefined) {
      setDemoRoleModalVisible(externalShowDemoModal);
    }
  }, [externalShowDemoModal]);

  const parseStoreIdAndUsername = (input: string) => {
    if (input.length < 4) {
      return { storeId: input, username: "" };
    }
    return { storeId: input.substring(0, 4), username: input.substring(4) };
  };

  const handleLogin = async () => {
    if (loginMode === "storeId") {
      const { storeId, username } = parseStoreIdAndUsername(storeIdAndUsername);

      if (!username || !password || !storeId) {
        setErrorMessage(
          "店舗ID（4桁）+ ニックネーム・パスワードを入力してください"
        );
        return;
      }

      if (!/^\d{4}$/.test(storeId)) {
        setErrorMessage("店舗IDは4桁の数字で入力してください");
        return;
      }

      if (onLogin) {
        try {
          await onLogin(username, password, storeId);
          if (saveStoreId) {
            await StoreIdStorage.saveStoreId(storeId);
          } else {
            await StoreIdStorage.clearStoreId();
          }
          setErrorMessage("");
        } catch (error) {
          setErrorMessage("ログインに失敗しました。再度お試しください。");
        }
      }
    } else {
      if (!emailInput || !password) {
        setErrorMessage("メールアドレスとパスワードを入力してください");
        return;
      }

      const { validateEmail } = await import(
        "@/common/common-utils/validation/inputValidation"
      );
      const emailValidation = validateEmail(emailInput);
      if (!emailValidation.isValid) {
        setErrorMessage(
          emailValidation.error || "有効なメールアドレスを入力してください"
        );
        return;
      }

      if (onLogin) {
        try {
          const storeId =
            (await StoreIdStorage.getStoreId()) || "default";
          await onLogin(emailInput, password, storeId);
          setErrorMessage("");
        } catch (error) {
          setErrorMessage("ログインに失敗しました。再度お試しください。");
        }
      }
    }
  };

  const closeDemoModal = () => {
    setDemoRoleModalVisible(false);
    if (externalSetShowDemoModal) {
      externalSetShowDemoModal(false);
    }
  };

  if (loading) {
    return <YoutubeSkeleton />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <Box variant="card">
          {/* タイトル */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>ログイン</Text>
          </View>

          {/* エラーメッセージ */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* ログイン方式切り替えタブ */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                loginMode === "storeId" && styles.tabActive,
              ]}
              onPress={() => setLoginMode("storeId")}
            >
              <MaterialIcons
                name="store"
                size={18}
                color={
                  loginMode === "storeId"
                    ? colorScheme.onPrimary
                    : colorScheme.primary
                }
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  loginMode === "storeId" && styles.tabTextActive,
                ]}
              >
                店舗ID
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                loginMode === "email" && styles.tabActive,
              ]}
              onPress={() => setLoginMode("email")}
            >
              <MaterialIcons
                name="email"
                size={18}
                color={
                  loginMode === "email"
                    ? colorScheme.onPrimary
                    : colorScheme.primary
                }
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  loginMode === "email" && styles.tabTextActive,
                ]}
              >
                メール
              </Text>
            </TouchableOpacity>
          </View>

          {/* 入力フィールド - ログイン方式により切り替え */}
          {loginMode === "storeId" && (
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialIcons
                  name="store"
                  size={20}
                  color={colorScheme.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>店舗ID + ニックネーム</Text>
              </View>
              <TextInput
                style={styles.input}
                value={storeIdAndUsername}
                onChangeText={setStoreIdAndUsername}
                placeholder="例: 1234山田太郎"
                placeholderTextColor={colorScheme.onSurfaceVariant}
                autoCapitalize="none"
              />
            </View>
          )}
          {loginMode === "email" && (
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialIcons
                  name="email"
                  size={20}
                  color={colorScheme.primary}
                  style={styles.labelIcon}
                />
                <Text style={styles.label}>メールアドレス</Text>
              </View>
              <TextInput
                style={styles.input}
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="example@email.com"
                placeholderTextColor={colorScheme.onSurfaceVariant}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* パスワード入力 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color={colorScheme.primary}
                style={styles.labelIcon}
              />
              <Text style={styles.label}>パスワード</Text>
            </View>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="パスワードを入力"
              placeholderTextColor={colorScheme.onSurfaceVariant}
              secureTextEntry
            />
          </View>

          {/* ログインボタン */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "ログイン中..." : "ログイン"}
            </Text>
          </TouchableOpacity>
        </Box>

        {/* デモリンク - ボックス外 */}
        <TouchableOpacity
          style={styles.demoLink}
          onPress={() => {
            setDemoRoleModalVisible(true);
            if (externalSetShowDemoModal) {
              externalSetShowDemoModal(true);
            }
          }}
        >
          <Text style={styles.demoLinkText}>デモを体験する</Text>
        </TouchableOpacity>

        {/* デモ役割選択モーダル */}
        <Modal
          visible={demoRoleModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeDemoModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeDemoModal}>
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <View style={styles.modalHeader}>
                <MaterialIcons
                  name="person"
                  size={24}
                  color={colorScheme.primary}
                />
                <Text style={styles.modalTitle}>デモアカウントを選択</Text>
                <TouchableOpacity onPress={closeDemoModal} style={styles.modalCloseButton}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={colorScheme.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>

              {/* 説明 */}
              <Text style={styles.modalDescription}>
                体験したい役割を選択してください。{"\n"}
                自動でログイン情報が入力されます。
              </Text>

              {/* 役割選択ボタン */}
              <View style={styles.modalButtonGroup}>
                {/* 教室長用 */}
                <TouchableOpacity
                  style={styles.demoButtonMaster}
                  onPress={() => {
                    setStoreIdAndUsername("0000佐藤");
                    setPassword("123456");
                    setLoginMode("storeId");
                    closeDemoModal();
                  }}
                >
                  <Text style={styles.demoButtonMasterTitle}>
                    🏫 教室長として体験
                  </Text>
                  <Text style={styles.demoButtonSub}>
                    ID: 0000佐藤 / Pass: 123456
                  </Text>
                  <Text style={styles.demoButtonCaption}>
                    全機能・管理者権限でお試し
                  </Text>
                </TouchableOpacity>

                {/* 講師用 */}
                <TouchableOpacity
                  style={styles.demoButtonTeacher}
                  onPress={() => {
                    setStoreIdAndUsername("0000町田");
                    setPassword("123456");
                    setLoginMode("storeId");
                    closeDemoModal();
                  }}
                >
                  <Text style={styles.demoButtonTeacherTitle}>
                    👨‍🏫 講師として体験
                  </Text>
                  <Text style={styles.demoButtonSub}>
                    ID: 0000町田 / Pass: 123456
                  </Text>
                  <Text style={styles.demoButtonCaption}>
                    講師権限でお試し
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
};
