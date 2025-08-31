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
import { VersionManager } from "@/services/version/VersionManager";

// Web環境での開発警告を抑制
if (Platform.OS === 'web' && __DEV__) {
  // LogBox警告を無視
  const { LogBox } = require('react-native');
  LogBox.ignoreAllLogs(true); // 開発中は全ログを無視
  LogBox.ignoreLogs([
    'shadow* style props are deprecated', 
    'Use "boxShadow"',
    '"shadow*" style props are deprecated. Use "boxShadow".',
    '"shadow*" style props are deprecated',
    /shadow.*deprecated/i,
    /boxShadow/i,
    'Layout children must be of type Screen',
    'props.pointerEvents is deprecated',
    'props.pointerEvents is deprecated. Use style.pointerEvents',
    /props\.pointerEvents is deprecated/,
    'Image: style.tintColor is deprecated',
    /style\.tintColor is deprecated/,
    'Please use props.tintColor',
  ]);

  // Console全体を無効化（開発中のみ）
  const noop = () => {};
  console.warn = noop;
  console.error = (message, ...args) => {
    // 🔒 SECURITY: 機密情報の漏洩を防ぐため、開発環境のみで詳細表示
    if (typeof message === 'string' && !message.includes('deprecated')) {
      if (__DEV__) {
        console.log('🚨 Error:', message, ...args);
      } else {
        // 本番環境では最小限のエラーログのみ
        console.error('Application error occurred');
      }
    }
  };
}

function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // 🔔 プッシュ通知初期化
  usePushNotifications();

  // 🔄 バージョンチェックとキャッシュ管理
  useEffect(() => {
    // Web環境でのみバージョンチェックを実行
    if (Platform.OS === 'web') {
      // アプリ起動時に即座にチェック
      VersionManager.checkForUpdatesOnStartup();
      
      // 定期的なバージョンチェックを開始（1分ごと）
      VersionManager.startVersionCheck(() => {
        // オプショナルアップデート時の通知
        if (confirm('新しいバージョンが利用可能です。今すぐ更新しますか？')) {
          window.location.reload();
        }
      });
      
      // クリーンアップ
      return () => {
        VersionManager.stopVersionCheck();
      };
    }
  }, []);

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
