import { useRef } from "react";
import { Slot } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { SettingsProvider } from "@/common/common-utils/util-settings";
import { TimeSegmentTypesProvider } from "@/common/common-context/TimeSegmentTypesContext";
import { StaffRolesProvider } from "@/common/common-context/StaffRolesContext";
import { ShiftTaskAssignmentsProvider } from "@/common/common-context/ShiftTaskAssignmentsContext";

/**
 * メインレイアウト
 * 認証ガードはルートレイアウト（useRouteGuard）で処理されるため、
 * ここではSettingsProviderのみを管理
 *
 * 注意: userが一瞬nullになるケース（TOKEN_REFRESHED等）で子コンポーネントが
 * 全アンマウントされるのを防ぐため、一度認証されたらコンテンツを維持する
 */
export default function MainLayout() {
  const { user, loading } = useAuth();
  const wasAuthenticated = useRef(false);

  if (user) {
    wasAuthenticated.current = true;
  }

  // 初回ロード中は何も表示しない
  if (loading) {
    return null;
  }

  // 一度も認証されていない場合のみnullを返す（useRouteGuardがリダイレクト処理）
  if (!user && !wasAuthenticated.current) {
    return null;
  }

  return (
    <SettingsProvider>
      <TimeSegmentTypesProvider storeId={user?.storeId || ""}>
        <StaffRolesProvider storeId={user?.storeId || ""}>
          <ShiftTaskAssignmentsProvider storeId={user?.storeId || ""}>
            <Slot />
          </ShiftTaskAssignmentsProvider>
        </StaffRolesProvider>
      </TimeSegmentTypesProvider>
    </SettingsProvider>
  );
}
