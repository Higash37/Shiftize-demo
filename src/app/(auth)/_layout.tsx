import { Slot } from "expo-router";
import { View } from "react-native";

/**
 * 認証レイアウト
 * 認証ガードはルートレイアウト（useRouteGuard）で処理されるため、
 * ここではシンプルにSlotを表示するのみ
 */
export default function AuthLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
