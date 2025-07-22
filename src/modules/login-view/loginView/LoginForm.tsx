import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
  StyleSheet,
  TextStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { loginFormStyles } from "./LoginForm.styles";
import type { LoginFormProps } from "./LoginForm.types";
import { YoutubeSkeleton } from "@/common/common-ui/ui-loading/SkeletonLoader";
import { useAutoReloadOnLayoutBug } from "@/common/common-ui/ui-loading/useAutoReloadOnLayoutBug";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";
import { designSystem } from "@/common/common-constants/DesignSystem";
import { colors } from "@/common/common-constants/ColorConstants";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";
import Button from "@/common/common-ui/ui-forms/FormButton";

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
  useAutoReloadOnLayoutBug();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [saveStoreId, setSaveStoreId] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [storeIdAndUsername, setStoreIdAndUsername] = useState(""); // 店舗ID+ニックネーム
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isTablet = width >= 768 && width < 1024; // タブレットサイズ
  const isPC = width >= 1024; // PC以上
  const isTabletOrDesktop = width >= 768; // タブレット以上（既存ロジック維持）

  // フォーカスの状態を管理
  const [storeIdAndUsernameFocused, setStoreIdAndUsernameFocused] =
    useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // コンポーネントマウント時に保存された店舗IDを読み込み
  useEffect(() => {
    const loadSavedStoreId = async () => {
      try {
        const savedStoreId = await StoreIdStorage.getStoreId();
        if (savedStoreId) {
          setStoreIdAndUsername(savedStoreId); // 保存された店舗IDを初期値に設定
          setSaveStoreId(true);
        }
      } catch (error) {
        // Error loading saved store ID - fail silently
      }
    };

    loadSavedStoreId();
  }, []);

  // 入力文字列から店舗IDとニックネームを分離
  const parseStoreIdAndUsername = (input: string) => {
    if (input.length < 4) {
      return { storeId: input, username: "" };
    }
    const storeId = input.substring(0, 4);
    const username = input.substring(4);
    return { storeId, username };
  };

  const handleLogin = async () => {
    const { storeId, username } = parseStoreIdAndUsername(storeIdAndUsername);

    if (!username || !password || !storeId) {
      setErrorMessage(
        "店舗ID（4桁）+ ニックネーム・パスワードを入力してください"
      );
      return;
    }

    // storeIdの形式チェック（4桁の数字）
    if (!/^\d{4}$/.test(storeId)) {
      setErrorMessage("店舗IDは4桁の数字で入力してください");
      return;
    }

    if (onLogin) {
      try {
        await onLogin(username, password, storeId);

        // 店舗ID保存の設定に応じて処理
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
  };

  const inputStyle = (focused: boolean, hasError: boolean = false) => [
    styles.input,
    focused && styles.inputFocused,
    hasError && styles.inputError,
  ];

  if (loading) {
    return <YoutubeSkeleton />;
  }

  return (
    <View
      style={[styles.container, isTabletOrDesktop && styles.containerTablet]}
    >
      {/* メインフォームカード */}
      <Box
        variant="card"
        style={[
          styles.formCard,
          isTablet && styles.formCardTablet,
          isPC && styles.formCardPC,
        ]}
      >
        <Text style={designSystem.text.welcomeText}>ログイン</Text>

        {/* エラーメッセージ */}
        {errorMessage && (
          <Box variant="outlined" style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Box>
        )}

        {/* 店舗ID + ニックネーム入力 */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <MaterialIcons name="store" size={20} color={colors.primary} />
            <Text style={styles.label}>店舗ID + ニックネーム</Text>
          </View>
          <TextInput
            style={inputStyle(storeIdAndUsernameFocused, !!errorMessage)}
            value={storeIdAndUsername}
            onChangeText={setStoreIdAndUsername}
            autoCapitalize="none"
            onFocus={() => setStoreIdAndUsernameFocused(true)}
            onBlur={() => setStoreIdAndUsernameFocused(false)}
            placeholder="例: 1234山田太郎"
            keyboardType="default"
            placeholderTextColor="#999"
          />
        </View>

        {/* パスワード入力 */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <MaterialIcons name="lock" size={20} color={colors.primary} />
            <Text style={styles.label}>パスワード</Text>
          </View>
          <TextInput
            style={inputStyle(passwordFocused, !!errorMessage)}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            placeholder="パスワードを入力"
            placeholderTextColor="#999"
          />
        </View>

        {/* 店舗ID保存チェックボックス */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setSaveStoreId(!saveStoreId)}
        >
          <View
            style={[styles.checkbox, saveStoreId && styles.checkboxChecked]}
          >
            {saveStoreId && (
              <MaterialIcons name="check" size={16} color={colors.text.white} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>店舗IDを保存する</Text>
        </TouchableOpacity>

        {/* ログインボタン */}
        <Button
          title={loading ? "ログイン中..." : "ログイン"}
          onPress={handleLogin}
          variant="primary"
          size="compact"
          fullWidth
          disabled={loading}
          style={styles.loginButton}
        />
      </Box>

      {/* フッター情報 */}
      <Box variant="default" style={styles.footerInfo}>
        <Text style={designSystem.text.footerText}>
          パスワード変更の際は管理者（教室長）までお問い合わせください。
        </Text>
        <Text style={styles.exampleText}>
          入力例: 1234山田太郎（店舗ID4桁 + ニックネーム）
        </Text>
      </Box>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerTablet: {
    alignItems: "center", // タブレット以上で中央寄せ
  },
  formCard: {
    marginBottom: 2,
  },
  formCardTablet: {
    width: "80%", // タブレットで幅を80%に変更
    maxWidth: 600, // 最大幅も調整
  },
  formCardPC: {
    width: "60%", // PC以上では60%を維持
    maxWidth: 500, // PC用の最大幅
  },
  errorContainer: {
    backgroundColor: colors.error + "10",
    borderColor: colors.error,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  input: {
    ...designSystem.input.input,
    fontSize: 16, // ズーム防止のため16px以上に設定
  },
  inputFocused: {
    ...designSystem.input.inputFocused,
  },
  inputError: {
    ...designSystem.input.inputError,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  loginButton: {
    marginTop: 8,
  },
  footerInfo: {
    backgroundColor: "transparent",
  },
  exampleText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
    color: colors.text.disabled,
  } as TextStyle,
});
