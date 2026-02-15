import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { getDefaultHomeRoute } from "@/common/common-constants/RouteConstants";
import { LoginForm } from "@/modules/login-view/loginView/LoginForm";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

// ServiceIntroModalを遅延読み込み
const ServiceIntroModal = lazy(() =>
  import("@/modules/reusable-widgets/service-intro/ServiceIntroModal").then(module => ({ default: module.ServiceIntroModal }))
);

export default function Login() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showServiceIntro, setShowServiceIntro] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const params = useLocalSearchParams();
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(() => createLoginScreenStyles(theme, bp), [theme, bp]);
  const { colorScheme } = theme;

  // URLパラメータをチェックしてデモモーダルを自動表示
  useEffect(() => {
    if (params["demo"] === "true") {
      setShowDemoModal(true);
      // demoパラメータのみを削除し、redirectパラメータは保持
      const newParams = new URLSearchParams();
      if (params["redirect"]) {
        newParams.set("redirect", params["redirect"] as string);
      }
      const redirectUrl = newParams.toString()
        ? `/(auth)/login?${newParams.toString()}`
        : "/(auth)/login";
      router.replace(redirectUrl);
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
      const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);

      let result;
      if (isEmailFormat) {
        result = await signIn(emailOrUsername, password);
      } else {
        if (!storeId) {
          throw new Error("店舗IDが必要です");
        }
        const email = `${storeId}${emailOrUsername}@example.com`;
        result = await signIn(email, password, storeId);
      }

      // ログイン成功: 明示的にリダイレクト
      const redirectParam = params["redirect"] as string | undefined;
      if (redirectParam) {
        router.replace(decodeURIComponent(redirectParam));
      } else {
        router.replace(getDefaultHomeRoute(result.role));
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "ログインに失敗しました。メールアドレス・ニックネームまたはパスワードが違います"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <Box
        variant="primary"
        style={styles.header}
      >
        <View style={styles.headerContainer}>
          {/* Left: Spacer */}
          <View style={styles.headerSpacer} />
          {/* Center: Title */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/(main)")}
          >
            <Text style={styles.headerTitle}>
              Shiftize
            </Text>
            <Text style={styles.headerSubtitle}>
              シフト管理システム
            </Text>
          </TouchableOpacity>
          {/* Right: Icons */}
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowServiceIntro(true)}
            >
              <AntDesign
                name="question-circle"
                size={24}
                color={colorScheme.onPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/(auth)/auth-welcome")}
            >
              <AntDesign
                name="home"
                size={24}
                color={colorScheme.onPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Box>
      {/* Content */}
      <View style={styles.content}>
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
      {showServiceIntro && (
        <Suspense fallback={null}>
          <ServiceIntroModal
            visible={showServiceIntro}
            onClose={() => setShowServiceIntro(false)}
          />
        </Suspense>
      )}
    </SafeAreaView>
  );
}

const createLoginScreenStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
) => {
  const { isMobile, isDesktop } = breakpoint;
  const isCompact = isMobile || isDesktop;

  return StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    header: {
      alignItems: "center",
      paddingVertical: isCompact ? theme.spacing.sm : theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xxl,
      borderBottomLeftRadius: theme.shape.large,
      borderBottomRightRadius: theme.shape.large,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      ...theme.elevation.level2.shadow,
    },
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
    headerTitle: {
      ...(isCompact ? theme.typography.titleLarge : theme.typography.headlineMedium),
      color: theme.colorScheme.onPrimary,
      textAlign: "center",
    },
    headerSubtitle: {
      ...(isCompact ? theme.typography.bodySmall : theme.typography.bodyLarge),
      color: theme.colorScheme.onPrimary,
      opacity: 0.9,
      textAlign: "center",
    },
    headerIcons: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    headerSpacer: {
      width: 80,
    },
    iconButton: {
      padding: theme.spacing.sm,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    errorContainer: {
      backgroundColor: theme.colorScheme.errorContainer,
      borderRadius: theme.shape.small,
      borderWidth: 1,
      borderColor: theme.colorScheme.error,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    errorText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onErrorContainer,
      textAlign: "center",
      fontWeight: "500",
    },
  });
};
