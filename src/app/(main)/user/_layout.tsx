import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { Footer } from "@/common/common-ui/ui-layout";
import Toast from "react-native-toast-message";

const { height: screenHeight } = Dimensions.get("window");

export default function userLayout() {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // ユーザーの認証状態が確定するまで待機
    if (loading) return;

    // 未認証の場合はログインページへリダイレクト
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    // ユーザーロールが不適切な場合はリダイレクト
    if (role !== "user") {
      router.replace("/(main)/master/home");
      return;
    }

    // 認証済みユーザーがauthグループにいる場合はメインページへリダイレクト
    const inAuthGroup = segments[0] === "(auth)";
    if (inAuthGroup) {
      router.replace("/(main)/user/home");
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
  if (!user || role !== "user") {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* メインコンテンツエリア - フッター分を除いた高さ */}
      <View style={styles.contentArea}>
        <Slot />
      </View>
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
    height: 0, // これが重要：flexと組み合わせて適切なサイズ制限を設ける
  },
});
