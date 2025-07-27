import { Stack, Slot } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { MasterFooter } from "@/common/common-ui/ui-layout";
import Toast from "react-native-toast-message";

// PWAスタンドアローンモードの検出
function isStandalonePWA() {
  if (typeof window !== "undefined") {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }
  return false;
}

const { height: screenHeight } = Dimensions.get("window");

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
          name="files"
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
          name="tasks"
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
          name="settings/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="settings/backup"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="settings/shift-appearance"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="settings/shift-holiday"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="settings/shift-rule"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="settings/shift-status"
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
          name="taskManagement/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="kanban-task/index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      
      {/* フッター - 固定サイズ、画面幅いっぱいに配置 */}
      <View style={[styles.footerArea, isPWA && styles.footerPWA]}>
        <MasterFooter />
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    height: screenHeight,
  },
  contentArea: {
    flex: 1,
  },
  footerArea: {
    width: "100%",
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  footerPWA: {
    position: "absolute" as any,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
