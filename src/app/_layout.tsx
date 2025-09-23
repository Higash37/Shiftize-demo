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
    'Added non-passive event listener',
    /Added non-passive event listener/,
    'message handler took',
    /message handler took/,
    '[Violation]',
    /\[Violation\]/,
    /style\.tintColor is deprecated/,
    'Please use props.tintColor',
  ]);

  // Console全体を無効化（開発中のみ）
  // React Native Web警告を抑制
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString?.() || '';
    if (
      message.includes('Added non-passive event listener') ||
      message.includes('[Violation]') ||
      message.includes('message handler took')
    ) {
      return; // 特定の警告をスキップ
    }
    // originalWarn(...args); // 開発中は全警告を無効
  };
  
  console.error = (...args: any[]) => {
    const message = args[0]?.toString?.() || '';
    if (message.includes('[Violation]')) {
      return; // Violation警告をスキップ
    }
    // 重要なエラーのみ表示
    originalError(...args);
  };
  
  const noop = () => {};
  console.error = (message, ...args) => {
    // 🔒 SECURITY: 機密情報の漏洩を防ぐため、開発環境のみで詳細表示
    if (typeof message === 'string' && !message.includes('deprecated')) {
      if (__DEV__) {
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
    console.log('🔍 DEBUG: Layout useEffect triggered');
    console.log('🔍 Loading:', loading);
    console.log('🔍 User:', user?.email || 'No user');
    console.log('🔍 Role:', role);
    console.log('🔍 Segments:', segments);

    if (loading) {
      console.log('🔍 Early return: loading is true');
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inLandingGroup = segments[0] === "(landing)";
    // (main) グループ内のページを正しく判定
    const inMainGroup = segments[0] === "(main)" ||
                       segments[0] === "user" ||
                       segments[0] === "master" ||
                       segments[0] === "user-settings" ||
                       segments.includes("user") ||
                       segments.includes("master");
    const atRoot = segments.length < 1;

    console.log('🔍 Group checks:', { inAuthGroup, inLandingGroup, inMainGroup, atRoot });

    // ルートページまたはランディングページは認証に関係なく常にアクセス可能
    if (inLandingGroup || atRoot) {
      console.log('🔍 Early return: landing or root');
      return;
    }

    // 認証が必要なページのチェック
    if (!user) {
      console.log('🔍 User is NOT authenticated');
      // 未認証ユーザーの場合
      if (inMainGroup) {
        console.log('🔍 Redirecting to login - saving current path');
        // 現在のパスを保存してログインページへ
        const currentPath = segments.join('/');
        const urlParams = typeof window !== 'undefined' ? window.location.search : '';
        const redirectPath = encodeURIComponent('/' + currentPath + urlParams);
        console.log('🔍 Current path:', currentPath);
        console.log('🔍 URL params:', urlParams);
        console.log('🔍 Encoded redirect path:', redirectPath);
        router.replace(`/(auth)/login?redirect=${redirectPath}`);
        return;
      }
      console.log('🔍 Not in main group, doing nothing');
      // 認証グループでもない場合は何もしない（index.tsxがランディングを表示する）
    } else {
      console.log('🔍 User IS authenticated');
      if (inAuthGroup) {
        console.log('🔍 User in auth group - checking redirect');
        // 認証済みユーザーが認証画面にいる場合
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const redirectPath = urlParams.get('redirect');

          console.log('🔍 DEBUG: Auth group redirect check');
          console.log('🔍 Current URL:', window.location.href);
          console.log('🔍 URL params:', window.location.search);
          console.log('🔍 Redirect path:', redirectPath);
          console.log('🔍 Segments:', segments);

          if (redirectPath) {
            const decodedPath = decodeURIComponent(redirectPath);
            console.log('🔍 Decoded redirect path:', decodedPath);
            // リダイレクトパスがある場合はそこに移動
            router.replace(decodedPath);
            return;
          }
        }

        // リダイレクトパスがない場合のみデフォルトのホーム画面へ
        // ただし、既に他のページにいる場合は強制リダイレクトしない
        const currentSegments = segments.filter(seg => seg && seg !== '(auth)');
        console.log('🔍 DEBUG: Home redirect check');
        console.log('🔍 Current segments:', currentSegments);
        console.log('🔍 Includes login:', segments.includes('login'));
        console.log('🔍 Should redirect to home:', currentSegments.length === 0 || segments.includes('login'));

        if (currentSegments.length === 0 || segments.includes('login')) {
          console.log('🔍 Redirecting to home for role:', role);
          if (role === "master") {
            router.replace("/(main)/master/home");
          } else if (role === "user") {
            router.replace("/(main)/user/home");
          }
        }
      } else if (inMainGroup) {
        // 認証済みユーザーがメインページにいる場合は何もしない
        console.log('🔍 User authenticated and in main group - staying on current page');
      }
    }
  }, [user, role, loading, segments]);

  useEffect(() => {
    let timeoutId: any;
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !loading) {
        // ランディングページにいる場合は認証チェックをスキップ
        const inLandingGroup = segments[0] === "(landing)";
        const inAuthGroup = segments[0] === "(auth)";
        if (inLandingGroup) {
          return;
        }

        // 認証状態を再確認する前に少し待つ
        timeoutId = setTimeout(() => {
          if (!user && !loading && !inAuthGroup) {
            // 現在のパスとパラメータを保存してリダイレクト
            const currentPath = segments.join('/');
            const urlParams = typeof window !== 'undefined' ? window.location.search : '';
            const redirectPath = encodeURIComponent('/' + currentPath + urlParams);
            router.replace(`/(auth)/login?redirect=${redirectPath}`);
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
