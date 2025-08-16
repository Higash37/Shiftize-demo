import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { loginFormStyles as styles } from "./LoginForm.styles";
import type { LoginFormProps } from "./LoginForm.types";
import { YoutubeSkeleton } from "@/common/common-ui/ui-loading/SkeletonLoader";
import { useAutoReloadOnLayoutBug } from "@/common/common-ui/ui-loading/useAutoReloadOnLayoutBug";
import Box from "@/common/common-ui/ui-base/BoxComponent";

// Components
import { ErrorMessage } from "./components/ErrorMessage";
import { LoginModeTab } from "./components/LoginModeTab";
import { StoreIdInput } from "./components/StoreIdInput";
import { EmailInput } from "./components/EmailInput";
import { PasswordInput } from "./components/PasswordInput";
import { LoginButton } from "./components/LoginButton";
import { DemoRoleModal } from "./components/DemoRoleModal";

// Hooks
import { useLoginState } from "./hooks/useLoginState";
import { useLoginHandlers } from "./hooks/useLoginHandlers";

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  loading, 
  showDemoModal: externalShowDemoModal, 
  setShowDemoModal: externalSetShowDemoModal 
}) => {
  useAutoReloadOnLayoutBug();
  
  const {
    password,
    errorMessage,
    storeIdAndUsername,
    loginMode,
    emailInput,
    demoRoleModalVisible,
    saveStoreId,
    isTablet,
    isPC,
    isTabletOrDesktop,
    setPassword,
    setErrorMessage,
    setStoreIdAndUsername,
    setLoginMode,
    setEmailInput,
    setDemoRoleModalVisible,
  } = useLoginState(externalShowDemoModal, externalSetShowDemoModal);

  const { handleLogin, handleDemoLogin } = useLoginHandlers({
    onLogin,
    storeIdAndUsername,
    emailInput,
    password,
    loginMode,
    saveStoreId,
    setErrorMessage,
  });

  const handleDemoRoleSelect = (role: 'master' | 'user') => {
    handleDemoLogin(role, {
      setStoreIdAndUsername,
      setPassword,
      setLoginMode,
      setDemoRoleModalVisible,
      externalSetShowDemoModal,
    });
  };

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
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20
          }}>
            ログイン
          </Text>
          
          <ErrorMessage message={errorMessage} />
          
          <LoginModeTab 
            loginMode={loginMode}
            onModeChange={setLoginMode}
          />

          {/* 入力フィールド - ログイン方式により切り替え */}
          {loginMode === 'storeId' ? (
            <StoreIdInput
              value={storeIdAndUsername}
              onChange={setStoreIdAndUsername}
            />
          ) : (
            <EmailInput
              value={emailInput}
              onChange={setEmailInput}
            />
          )}

          <PasswordInput
            value={password}
            onChange={setPassword}
          />
          
          <LoginButton
            onPress={handleLogin}
            loading={loading}
          />
        </Box>

        {/* デモリンク - ボックス外 */}
        <TouchableOpacity
          style={{
            marginTop: 20,
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
          onPress={() => {
            setDemoRoleModalVisible(true);
            if (externalSetShowDemoModal) {
              externalSetShowDemoModal(true);
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
        <DemoRoleModal
          visible={demoRoleModalVisible}
          onClose={() => {
            setDemoRoleModalVisible(false);
            if (externalSetShowDemoModal) {
              externalSetShowDemoModal(false);
            }
          }}
          onSelectRole={handleDemoRoleSelect}
        />
      </View>
    </View>
  );
};