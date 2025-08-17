import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { LoginForm } from "@/modules/login-view/loginView/LoginForm";
import { designSystem } from "@/common/common-constants/DesignSystem";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { ServiceIntroModal } from "@/modules/reusable-widgets/service-intro/ServiceIntroModal";

export default function Login() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showServiceIntro, setShowServiceIntro] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width > 1024; // PC判定
  const isMobile = width <= 768; // スマホ判定

  // URLパラメータをチェックしてデモモーダルを自動表示
  useEffect(() => {
    if (params['demo'] === 'true') {
      setShowDemoModal(true);
      // URLからパラメータを削除
      router.replace('/(auth)/login');
    }
  }, [params]);

  const handleLogin = async (
    emailOrUsername: string,
    password: string,
    storeId?: string
  ) => {
    setLoading(true);
    setErrorMessage("");
    try {
      // 通常のFirebaseログイン
      const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);

      if (isEmailFormat) {
        // 実メールアドレスの場合はそのまま使用
        await signIn(emailOrUsername, password);
      } else {
        // 店舗ID + ニックネーム形式の場合は自動生成メールを作成
        if (!storeId) {
          throw new Error("店舗IDが必要です");
        }
        const email = `${storeId}${emailOrUsername}@example.com`;
        await signIn(email, password, storeId);
      }

      // ナビゲーション処理を待つために少し待機
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      setErrorMessage(
        "ログインに失敗しました。メールアドレス・ニックネームまたはパスワードが違います"
      );
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
        <View style={styles.headerContainer}>
          {/* Left: Spacer */}
          <View style={styles.headerSpacer} />

          {/* Center: Title */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/(main)")}
          >
            <Text style={getHeaderTextStyle()}>Shiftize</Text>
            <Text style={getSubtitleTextStyle()}>シフト管理システム</Text>
          </TouchableOpacity>

          {/* Right: Icons */}
          <View style={styles.headerIcons}>
            {/* Help/Support Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowServiceIntro(true)}
            >
              <AntDesign name="questioncircleo" size={24} color="white" />
            </TouchableOpacity>

            {/* Landing Page Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/(landing)")}
            >
              <AntDesign name="home" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Box>

      {/* Content */}
      <View style={designSystem.page.content}>
        <LoginForm 
          onLogin={handleLogin} 
          loading={loading} 
          showDemoModal={showDemoModal}
          setShowDemoModal={setShowDemoModal}
        />
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
      </View>

      {/* サービス紹介モーダル */}
      <ServiceIntroModal
        visible={showServiceIntro}
        onClose={() => setShowServiceIntro(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerSpacer: {
    width: 80, // アイコン2つ分の幅 + gap + padding (24 * 2 + 12 + 8 * 2)
  },
  iconButton: {
    padding: 8,
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
