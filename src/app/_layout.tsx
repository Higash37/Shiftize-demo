import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { AuthProvider } from "@/services/auth/AuthContext";
import { StatusBar } from "expo-status-bar";
import { View, Platform } from "react-native";
import { useFonts } from "expo-font";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { usePushNotifications } from "@/common/common-hooks/usePushNotifications";
import { useRouteGuard } from "@/common/common-hooks/useRouteGuard";
import { VersionManager } from "@/services/version/VersionManager";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

function RootLayoutNav() {
  // 🔔 プッシュ通知初期化
  usePushNotifications();

  // 🛡️ ルーティングガード（認証チェックとリダイレクト）
  useRouteGuard();

  // 🔄 バージョンチェックとキャッシュ管理
  useEffect(() => {
    // Web環境でのみバージョンチェックを実行
    if (Platform.OS === "web") {
      // アプリ起動時に即座にチェック
      VersionManager.checkForUpdatesOnStartup();

      // 定期的なバージョンチェックを開始（1分ごと）
      VersionManager.startVersionCheck(() => {
        // オプショナルアップデート時の通知
        if (confirm("新しいバージョンが利用可能です。今すぐ更新しますか？")) {
          globalThis.window.location.reload();
        }
      });

      // クリーンアップ
      return () => {
        VersionManager.stopVersionCheck();
      };
    }
  }, []);

  // シンプルなWeb/PWA対応 - CSSはindex.htmlに任せる
  const getLayoutStyle = () => {
    return {
      flex: 1,
      backgroundColor: colors.background,
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
  const [fontsLoaded, fontError] = useFonts({
    ...AntDesign.font,
    ...MaterialIcons.font,
    ...Ionicons.font,
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialCommunityIcons.font,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider
        value={{
          dark: false,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text.primary,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: { fontFamily: "System", fontWeight: "400" },
            medium: { fontFamily: "System", fontWeight: "500" },
            bold: { fontFamily: "System", fontWeight: "700" },
            heavy: { fontFamily: "System", fontWeight: "900" },
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
