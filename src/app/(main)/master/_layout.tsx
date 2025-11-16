import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { Routes } from "@/common/common-constants/RouteConstants";
import { MasterFooter } from "@/common/common-ui/ui-layout";
import Toast from "react-native-toast-message";

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
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // PWAモードかどうかを検出
    setIsPWA(isStandalonePWA());
  }, []);

  useEffect(() => {
    if (loading) return;

    // ユーザーロールが不適切な場合はリダイレクト
    if (user && role !== "master") {
      router.replace(Routes.main.user.home);
    }
  }, [user, loading, role, router]);

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
          name="master-settings/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="master-settings/backup"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="master-settings/shift-appearance"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="master-settings/shift-holiday"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="master-settings/shift-rule"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="master-settings/shift-status"
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
