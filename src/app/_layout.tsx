import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider } from "@/services/auth/AuthContext";
import { useAuth } from "@/services/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { View, AppState } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments?.[0] === "(auth)";
    const inLandingGroup = segments?.[0] === "(landing)";
    const inMainGroup = segments?.[0] === "(main)";
    const atRoot = !segments || segments.length === 0;

    // デバッグ用ログ
    console.log("Navigation Debug:", {
      segments,
      user: !!user,
      role,
      loading,
      inAuthGroup,
      inLandingGroup,
      inMainGroup,
      atRoot,
    });

    // ルートページまたはランディングページは認証に関係なく常にアクセス可能
    if (inLandingGroup || atRoot) {
      console.log("At root or landing - no redirect");
      return;
    }

    // 認証が必要なページのチェック
    if (!user) {
      // 未認証ユーザーの場合
      if (inMainGroup) {
        // メインアプリにアクセスしようとした場合はログインページへ
        router.replace("/(auth)/login");
        return;
      }
      // 認証グループでもない場合は何もしない（index.tsxがランディングを表示する）
    } else {
      // 認証済みユーザーの場合
      if (inAuthGroup) {
        // 認証済みユーザーが認証画面にいる場合はメインアプリへリダイレクト
        if (role === "master") {
          router.replace("/(main)/master/home");
        } else if (role === "user") {
          router.replace("/(main)/user/home");
        }
      }
    }
  }, [user, role, loading, segments]);

  useEffect(() => {
    let timeoutId: any;
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !loading) {
        // ランディングページにいる場合は認証チェックをスキップ
        const inLandingGroup = segments?.[0] === "(landing)";
        if (inLandingGroup) {
          return;
        }

        // 認証状態を再確認する前に少し待つ
        timeoutId = setTimeout(() => {
          if (!user && !loading) {
            router.replace("/(auth)/login");
          }
        }, 1000); // 1秒待機
      }
    });
    return () => {
      clearTimeout(timeoutId);
      subscription.remove();
    };
  }, [user, loading, segments]);

  // シンプルなWeb/PWA対応 - CSSはindex.htmlに任せる
  const getLayoutStyle = () => {
    return {
      flex: 1,
      backgroundColor: "#F2F2F7",
    };
  };

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <View style={getLayoutStyle()}>
        <Slot />
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider
        value={{
          dark: false,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.background,
            text: colors.text.primary,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '900' },
          },
        }}
      >
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
