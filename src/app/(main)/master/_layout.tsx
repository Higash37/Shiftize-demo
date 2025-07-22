import { Stack, Slot } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { MasterFooter } from "@/common/common-ui/ui-layout";
import Toast from "react-native-toast-message";

// PWAスタンドアローンモードの検出
function isStandalonePWA() {
  if (typeof window !== "undefined") {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator).standalone === true
    );
  }
  return false;
}

export default function MasterLayout() {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // PWAモードかどうかを検出
    setIsPWA(isStandalonePWA());
  }, []);

  useEffect(() => {
    // ユーザーの認証状態が確定するまで待機
    if (loading) return;

    // 未認証の場合はログインページへリダイレクト
    if (!user) {
      router.replace("/(auth)/login");
      return;
    } // ユーザーロールが不適切な場合はリダイレクト
    if (role !== "master") {
      router.replace("/(main)/user/home");
      return;
    }

    // 認証済みユーザーがauthグループにいる場合はメインページへリダイレクト
    const inAuthGroup = segments[0] === "(auth)";
    if (inAuthGroup) {
      router.replace("/(main)/master/home");
    }
  }, [user, loading, role, segments]);
  // ローディング中は待機画面を表示
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト待ち）
  if (!user || role !== "master") {
    return null;
  }

  return (
    <View style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* メインコンテンツエリア - フッター分を除いた高さ */}
      <View style={{ flex: 1, ...(isPWA && { paddingBottom: 80 }) }}>
        <Stack
          screenOptions={{
            headerShown: false, // デフォルトヘッダーを非表示にする
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        >
          <Slot />
        </Stack>
      </View>
      {/* フッター - 固定サイズ、画面幅いっぱいに配置 */}
      <View
        style={{
          width: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          ...(isPWA && {
            position: "fixed" as "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            width: "100vw" as "100vw",
            minWidth: "100vw" as "100vw",
            maxWidth: "100vw" as "100vw",
            margin: 0,
            padding: 0,
          }),
        }}
      >
        <MasterFooter />
      </View>
      <Toast />
    </View>
  );
}
