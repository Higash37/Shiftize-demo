import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, useWindowDimensions, SafeAreaView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { LoginForm } from "@/modules/login-view/loginView/LoginForm";
import { designSystem } from "@/common/common-constants/DesignSystem";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

export default function Login() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width > 1024; // PC判定
  const isMobile = width <= 768; // スマホ判定

  const handleLogin = async (
    username: string,
    password: string,
    storeId: string
  ) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const email = `${storeId}${username}@example.com`;
      await signIn(email, password, storeId);
    } catch (error) {
      setErrorMessage("ニックネームまたはパスワードが違います");
    } finally {
      setLoading(false);
    }
  };

  // レスポンシブヘッダースタイル
  const getHeaderStyle = () => {
    const baseStyle = {
      ...designSystem.layout.headerPrimary,
      borderTopLeftRadius: 0, // 上部角丸を明示的に削除
      borderTopRightRadius: 0, // 上部角丸を明示的に削除
    };

    if (isDesktop) {
      // PC: 高さをさらに小さく（30%さらに縮小）
      return {
        ...baseStyle,
        paddingVertical: layout.padding.small, // 8px (さらに小さく)
      };
    } else if (isMobile) {
      // スマホ: 高さをさらに小さく（30%さらに縮小）
      return {
        ...baseStyle,
        paddingVertical: layout.padding.small, // 8px (さらに小さく)
      };
    } else {
      // タブレット: そのまま（24px）
      return baseStyle;
    }
  };

  // レスポンシブテキストスタイル
  const getHeaderTextStyle = () => {
    if (isDesktop || isMobile) {
      // PC・スマホ: 文字サイズをさらに小さく（30%さらに縮小）
      return {
        ...designSystem.text.headerTitle,
        fontSize: 20, // 28px から さらに小さく
      };
    } else {
      // タブレット: そのまま
      return designSystem.text.headerTitle;
    }
  };

  const getSubtitleTextStyle = () => {
    if (isDesktop || isMobile) {
      // PC・スマホ: サブタイトルをさらに小さく（30%さらに縮小）
      return {
        ...designSystem.text.subtitle,
        fontSize: 12, // 16px から さらに小さく
      };
    } else {
      // タブレット: そのまま
      return designSystem.text.subtitle;
    }
  };

  return (
    <SafeAreaView style={designSystem.page.safeContainer}>
      {/* Header */}
      <Box variant="primary" style={getHeaderStyle()}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push("/(main)")}
        >
          <Text style={getHeaderTextStyle()}>Shiftize</Text>
          <Text style={getSubtitleTextStyle()}>ログイン</Text>
        </TouchableOpacity>
      </Box>

      {/* Content */}
      <View style={designSystem.page.content}>
        <LoginForm onLogin={handleLogin} loading={loading} />
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    ...designSystem.card.outlineCard,
    backgroundColor: colors.error + "10", // 薄い赤背景
    borderColor: colors.error,
    marginTop: 16,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
