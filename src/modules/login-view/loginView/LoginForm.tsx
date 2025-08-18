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
  Modal,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { loginFormStyles } from "./LoginForm.styles";
import type { LoginFormProps } from "./LoginForm.types";
import { YoutubeSkeleton } from "@/common/common-ui/ui-loading/SkeletonLoader";
import { useAutoReloadOnLayoutBug } from "@/common/common-ui/ui-loading/useAutoReloadOnLayoutBug";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";
import { designSystem } from "@/common/common-constants/DesignSystem";
import { colors } from "@/common/common-constants/ColorConstants";
import Box from "@/common/common-ui/ui-base/BoxComponent";

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  loading, 
  showDemoModal: externalShowDemoModal, 
  setShowDemoModal: externalSetShowDemoModal 
}) => {
  useAutoReloadOnLayoutBug();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [saveStoreId, setSaveStoreId] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [storeIdAndUsername, setStoreIdAndUsername] = useState(""); // 店舗ID+ニックネーム
  const [loginMode, setLoginMode] = useState<'storeId' | 'email'>('storeId'); // ログイン方式
  const [emailInput, setEmailInput] = useState(""); // メールアドレス入力
  const [demoRoleModalVisible, setDemoRoleModalVisible] = useState(externalShowDemoModal || false); // デモ役割選択モーダル
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isTablet = width >= 768 && width < 1024; // タブレットサイズ
  const isPC = width >= 1024; // PC以上
  const isTabletOrDesktop = width >= 768; // タブレット以上（既存ロジック維持）

  // フォーカスの状態を管理
  const [storeIdAndUsernameFocused, setStoreIdAndUsernameFocused] =
    useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
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

  // 外部からのデモモーダル制御
  useEffect(() => {
    if (externalShowDemoModal !== undefined) {
      setDemoRoleModalVisible(externalShowDemoModal);
    }
  }, [externalShowDemoModal]);

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
    
    if (loginMode === 'storeId') {
      // 従来の店舗ID + ニックネーム方式
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
    } else {
      // メールアドレス方式
      if (!emailInput || !password) {
        setErrorMessage("メールアドレスとパスワードを入力してください");
        return;
      }

      // セキュアなメールアドレス検証
      const { validateEmail } = await import("@/common/common-utils/validation/inputValidation");
      const emailValidation = validateEmail(emailInput);
      if (!emailValidation.isValid) {
        setErrorMessage(emailValidation.error || "有効なメールアドレスを入力してください");
        return;
      }

      if (onLogin) {
        try {
          const storeId = await StoreIdStorage.getStoreId() || "default";
          await onLogin(emailInput, password, storeId);
          setErrorMessage("");
        } catch (error) {
          setErrorMessage("ログインに失敗しました。再度お試しください。");
        }
      } else {
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
    <View style={[
      styles.container,
      isTabletOrDesktop && styles.containerTablet
    ]}>
      <View style={[
        styles.formCard,
        isTablet && styles.formCardTablet,
        isPC && styles.formCardPC
      ]}>
        <Box variant="card">
          <View style={{marginBottom: 20}}>
            <Text style={{fontSize: 24, fontWeight: 'bold', textAlign: 'center'}}>ログイン</Text>
          </View>
          {/* エラーメッセージ */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
          {/* ログイン方式切り替えタブ */}
          <View style={{flexDirection: 'row', marginBottom: 20, backgroundColor: '#f0f0f0', borderRadius: 8}}>
            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: loginMode === 'storeId' ? '#007bff' : 'transparent',
                borderRadius: 8,
              }}
              onPress={() => setLoginMode('storeId')}
            >
              <MaterialIcons name="store" size={18} color={loginMode === 'storeId' ? '#fff' : '#007bff'} />
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: loginMode === 'storeId' ? '#fff' : '#007bff',
                marginLeft: 8,
              }}>
                店舗ID
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: loginMode === 'email' ? '#007bff' : 'transparent',
                borderRadius: 8,
              }}
              onPress={() => setLoginMode('email')}
            >
              <MaterialIcons name="email" size={18} color={loginMode === 'email' ? '#fff' : '#007bff'} />
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: loginMode === 'email' ? '#fff' : '#007bff',
                marginLeft: 8,
              }}>
                メール
              </Text>
            </TouchableOpacity>
          </View>

          {/* 入力フィールド - ログイン方式により切り替え */}
          {loginMode === 'storeId' && (
            <View style={{marginBottom: 20}}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                <MaterialIcons name="store" size={20} color="#007bff" />
                <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginLeft: 8}}>店舗ID + ニックネーム</Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#fff'
                }}
                value={storeIdAndUsername}
                onChangeText={setStoreIdAndUsername}
                placeholder="例: 1234山田太郎"
                autoCapitalize="none"
              />
            </View>
          )}
          {loginMode === 'email' && (
            <View style={{marginBottom: 20}}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                <MaterialIcons name="email" size={20} color="#007bff" />
                <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginLeft: 8}}>メールアドレス</Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#fff'
                }}
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}
          {/* パスワード入力 */}
          <View style={{marginBottom: 20}}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
              <MaterialIcons name="lock" size={20} color="#007bff" />
              <Text style={{fontSize: 16, fontWeight: '500', color: '#333', marginLeft: 8}}>パスワード</Text>
            </View>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#fff'
              }}
              value={password}
              onChangeText={setPassword}
              placeholder="パスワードを入力"
              secureTextEntry
            />
          </View>
          {/* ログインボタン */}
          <TouchableOpacity
            style={{
              backgroundColor: '#007bff',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              width: '100%',
              opacity: loading ? 0.7 : 1
            }}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold'
            }}>
              {loading ? "ログイン中..." : "ログイン"}
            </Text>
          </TouchableOpacity>
        </Box>

        {/* デモリンク - ボックス外 */}
        <TouchableOpacity
          style={{
            marginTop: 20,
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
          onPress={() => {
            const newState = true;
            setDemoRoleModalVisible(newState);
            if (externalSetShowDemoModal) {
              externalSetShowDemoModal(newState);
            }
          }}
        >
          <Text style={{
            color: '#007bff',
            fontSize: 14,
            fontWeight: '500',
            textDecorationLine: 'underline',
            textAlign: 'center',
          }}>
            デモを体験する
          </Text>
        </TouchableOpacity>

        {/* デモ役割選択モーダル */}
        <Modal
          visible={demoRoleModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setDemoRoleModalVisible(false);
            if (externalSetShowDemoModal) {
              externalSetShowDemoModal(false);
            }
          }}
        >
          <Pressable 
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 16,
            }}
            onPress={() => {
              setDemoRoleModalVisible(false);
              if (externalSetShowDemoModal) {
                externalSetShowDemoModal(false);
              }
            }}
          >
            <Pressable 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 24,
                width: '100%',
                maxWidth: 400,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <MaterialIcons name="person" size={24} color="#3b82f6" />
                <Text style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginLeft: 12,
                }}>
                  デモアカウントを選択
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setDemoRoleModalVisible(false);
                    if (externalSetShowDemoModal) {
                      externalSetShowDemoModal(false);
                    }
                  }}
                  style={{ padding: 4 }}
                >
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* 説明 */}
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 24,
                textAlign: 'center',
                lineHeight: 20,
              }}>
                体験したい役割を選択してください。{'\n'}自動でログイン情報が入力されます。
              </Text>

              {/* 役割選択ボタン */}
              <View style={{ gap: 12 }}>
                {/* 教室長用 */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#f8faff',
                    borderWidth: 2,
                    borderColor: '#3b82f6',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setStoreIdAndUsername('0000佐藤');
                    setPassword('123456');
                    setLoginMode('storeId');
                    setDemoRoleModalVisible(false);
                    if (externalSetShowDemoModal) {
                      externalSetShowDemoModal(false);
                    }
                  }}
                >
                  <Text style={{
                    color: '#3b82f6',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}>
                    🏫 教室長として体験
                  </Text>
                  <Text style={{
                    color: '#6b7280',
                    fontSize: 12,
                  }}>
                    ID: 0000佐藤 / Pass: 123456
                  </Text>
                  <Text style={{
                    color: '#6b7280',
                    fontSize: 11,
                    marginTop: 4,
                  }}>
                    全機能・管理者権限でお試し
                  </Text>
                </TouchableOpacity>

                {/* 講師用 */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#f0fdf4',
                    borderWidth: 2,
                    borderColor: '#10b981',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setStoreIdAndUsername('0000町田');
                    setPassword('123456');
                    setLoginMode('storeId');
                    setDemoRoleModalVisible(false);
                    if (externalSetShowDemoModal) {
                      externalSetShowDemoModal(false);
                    }
                  }}
                >
                  <Text style={{
                    color: '#10b981',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}>
                    👨‍🏫 講師として体験
                  </Text>
                  <Text style={{
                    color: '#6b7280',
                    fontSize: 12,
                  }}>
                    ID: 0000町田 / Pass: 123456
                  </Text>
                  <Text style={{
                    color: '#6b7280',
                    fontSize: 11,
                    marginTop: 4,
                  }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerTablet: {
    alignItems: "center", // タブレット以上で中央寄せ
  },
  formCard: {
    marginBottom: 20,
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
  // タブ機能のスタイル
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  tabTextActive: {
    color: colors.text.white,
  },
});