import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { View } from "react-native";

export default function AuthLayout() {
  const { user, role, loading, authError } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      // 認証エラーがある場合は遷移しない
      if (authError) {
        return;
      }

      if (user) {
        let route;
        if (role === "master") {
          route = "/(main)/master/home";
        } else if (role === "user") {
          route = "/(main)/user/home";
        }
        if (route) {
          try {
            router.replace(route);
          } catch (navError) {
            // Silent error handling for navigation
          }
        }
      }
    };

    checkAuth();
  }, [user, role, loading, authError]);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
