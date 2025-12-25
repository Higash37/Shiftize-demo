import { Slot } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { SettingsProvider } from "@/common/common-utils/util-settings";

/**
 * メインレイアウト
 * 認証ガードはルートレイアウト（useRouteGuard）で処理されるため、
 * ここではSettingsProviderのみを管理
 */
export default function MainLayout() {
  const { user } = useAuth();

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
