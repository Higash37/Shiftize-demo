import React, { useEffect } from "react";
import { Stack, Slot, useRouter, useSegments } from "expo-router";
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

  // console.warn/error も抑制
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    const message = String(args[0] || '');
    if (message.includes('shadow') && (message.includes('deprecated') || message.includes('boxShadow'))) {
      return;
    }
    if (message.includes('Layout children must be of type Screen')) {
      return;
    }
    if (message.includes('props.pointerEvents is deprecated')) {
      return;
    }
    if (message.includes('No route named') && message.includes('exists in nested children')) {
      return;
    }
    if (message.includes('Unexpected text node') && message.includes('A text node cannot be a child of a')) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    const message = String(args[0] || '');
    if (message.includes('shadow') && (message.includes('deprecated') || message.includes('boxShadow'))) {
      return;
    }
    if (message.includes('Layout children must be of type Screen')) {
      return;
    }
    if (message.includes('props.pointerEvents is deprecated')) {
      return;
    }
    if (message.includes('No route named') && message.includes('exists in nested children')) {
      return;
    }
    if (message.includes('Unexpected text node') && message.includes('A text node cannot be a child of a')) {
      return;
    }
    originalError.apply(console, args);
  };
}

function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // 🔔 プッシュ通知初期化
  const { isInitialized, hasPermission, error } = usePushNotifications();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (inAuthGroup) {
      if (role === "master") {
        router.replace("/(main)/master/home");
      } else if (role === "user") {
        router.replace("/(main)/user/home");
      }
    }
  }, [user, role, loading, segments]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !user) {
        router.replace("/(auth)/login");
      }
    });
    return () => subscription.remove();
  }, [user]);

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
        }}
      >
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
