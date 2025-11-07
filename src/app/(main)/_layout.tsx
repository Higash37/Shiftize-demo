import { Slot } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { SettingsProvider } from "@/common/common-utils/util-settings";

/**
 * メインレイアウト
 * 認証ガードはルートレイアウト（useRouteGuard）で処理されるため、
 * ここではローディング状態とSettingsProviderのみを管理
 */
export default function MainLayout() {
  const { user, loading } = useAuth();

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

  // 未認証の場合は何も表示しない（ルートレイアウトで処理）
  if (!user) {
    return null;
  }

  return (
    <SettingsProvider>
      <Slot />
    </SettingsProvider>
  );
}
