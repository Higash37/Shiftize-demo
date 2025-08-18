import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider } from "@/services/auth/AuthContext";
import { useAuth } from "@/services/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { View, AppState, Platform } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Web環境でのshadow警告を抑制
if (Platform.OS === 'web' && __DEV__) {
  // LogBox警告を無視
  const { LogBox } = require('react-native');
  LogBox.ignoreLogs([
    'shadow* style props are deprecated', 
    'Use "boxShadow"',
    '"shadow*" style props are deprecated. Use "boxShadow".',
    'Layout children must be of type Screen',
    'props.pointerEvents is deprecated'
  ]);

}

function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // 🔔 プッシュ通知初期化
  usePushNotifications();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    const inLandingGroup = segments[0] === "(landing)";
    const inMainGroup = segments[0] === "(main)";
    const atRoot = segments.length < 1;
    
    // ルートページまたはランディングページは認証に関係なく常にアクセス可能
    if (inLandingGroup || atRoot) {
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
    } else if (inAuthGroup) {
      // 認証済みユーザーが認証画面にいる場合はメインアプリへリダイレクト
      if (role === "master") {
        router.replace("/(main)/master/home");
      } else if (role === "user") {
        router.replace("/(main)/user/home");
      }
    }
  }, [user, role, loading, segments]);

  useEffect(() => {
    let timeoutId: any;
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !loading) {
        // ランディングページにいる場合は認証チェックをスキップ
        const inLandingGroup = segments[0] === "(landing)";
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
