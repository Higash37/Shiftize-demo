import { Stack } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter, useSegments } from "expo-router";
import { View, Dimensions, StyleSheet } from "react-native";
import { Routes } from "@/common/common-constants/RouteConstants";
import { Footer } from "@/common/common-ui/ui-layout";
import Toast from "react-native-toast-message";

const { height: screenHeight } = Dimensions.get("window");

export default function userLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const isRecruitmentPage = useMemo(
    () => segments.includes("recruitment"),
    [segments]
  );
  const wasAuthorized = useRef(false);

  if (user && (role === "user" || isRecruitmentPage)) {
    wasAuthorized.current = true;
  }

  useEffect(() => {
    // ユーザーロールが不適切な場合はリダイレクト
    // ただし、募集シフトページ(recruitment)はmasterも閲覧可能
    if (user && role !== "user" && !isRecruitmentPage) {
      router.replace(Routes.main.master.home);
    }
  }, [user, role, isRecruitmentPage, router]);

  // ロード中は何も表示しない
  if (loading) {
    return null;
  }

  // 一度も認可されていない場合のみnullを返す（リダイレクト待ち）
  const isUnauthorized = !user || (role !== "user" && !isRecruitmentPage);
  if (isUnauthorized && !wasAuthorized.current) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
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
          name="shifts/index"
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
          name="today"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="change-password"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      
      {/* フッター - 固定サイズ */}
      <Footer />
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
});
