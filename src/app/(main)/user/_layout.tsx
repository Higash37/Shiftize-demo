import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { Routes } from "@/common/common-constants/RouteConstants";
import { Footer } from "@/common/common-ui/ui-layout";
import Toast from "react-native-toast-message";

const { height: screenHeight } = Dimensions.get("window");

export default function userLayout() {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    // ユーザーロールが不適切な場合はリダイレクト
    // ただし、募集シフトページ(recruitment)はmasterも閲覧可能
    const isRecruitmentPage = segments.includes("recruitment");
    if (user && role !== "user" && !isRecruitmentPage) {
      router.replace(Routes.main.master.home);
    }
  }, [user, loading, role, segments, router]);

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
  // ただし、募集シフトページはmasterもアクセス可能
  const isRecruitmentPage = segments.includes("recruitment");
  if (!user || (role !== "user" && !isRecruitmentPage)) {
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
          name="files"
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
  contentArea: {
    flex: 1,
  },
});
