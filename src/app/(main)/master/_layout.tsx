import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter } from "expo-router";
import { View, Dimensions, StyleSheet } from "react-native";
import { Routes } from "@/common/common-constants/RouteConstants";
import { MasterFooter } from "@/common/common-ui/ui-layout";

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

// PWA�X�^���h�A���[�����[�h�̌��o
function isStandalonePWA() {
  if (typeof window !== "undefined") {
    const navigatorStandalone = window.navigator as NavigatorWithStandalone;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      navigatorStandalone.standalone === true
    );
  }
  return false;
}

const { height: screenHeight } = Dimensions.get("window");

export default function MasterLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [isPWA, setIsPWA] = useState(false);
  const wasAuthorized = useRef(false);

  if (user && role === "master") {
    wasAuthorized.current = true;
  }

  useEffect(() => {
    // PWAモードかどうかを検出
    setIsPWA(isStandalonePWA());
  }, []);

  useEffect(() => {
    // ユーザーロールが不適切な場合はリダイレクト
    if (user && role !== "master") {
      router.replace(Routes.main.user.home);
    }
  }, [user, role, router]);

  // ロード中は何も表示しない
  if (loading) {
    return null;
  }

  // 一度も認可されていない場合のみnullを返す（リダイレクト待ち）
  if ((!user || role !== "master") && !wasAuthorized.current) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false, // デフォルトヘッダーを非表示にする
          gestureEnabled: true,
          animation: "slide_from_right",
          presentation: "card",
        }}
      >
        <Stack.Screen 
          name="home"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="gantt-view"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="gantt-edit"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="today"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="info"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="users/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="shifts/create"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="shifts/this-month"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="shifts/next-month"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      
      {/* フッター - 固定サイズ、画面幅いっぱいに配置 */}
      <View style={[styles.footerArea, isPWA && styles.footerPWA]}>
        <MasterFooter />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    height: screenHeight,
  },
  footerArea: {
    width: "100%",
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  footerPWA: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
