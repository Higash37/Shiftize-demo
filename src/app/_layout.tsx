import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { AuthProvider } from "@/services/auth/AuthContext";
import { StatusBar } from "expo-status-bar";
import { View, Text, TextInput, Platform } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouteGuard } from "@/common/common-hooks/useRouteGuard";
import { VersionManager } from "@/services/version/VersionManager";
import { useBasicFonts } from "@/common/common-utils/performance/fontLoader";
import { initializeServices } from "@/services/initializeServices";
import { MD3ThemeProvider, useMD3Theme } from "@/common/common-theme/md3";
import { APP_FONT_FAMILY } from "@/common/common-constants/FontConstants";

// アプリ全体のデフォルトフォントを設定
if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
(Text as any).defaultProps.style = { fontFamily: APP_FONT_FAMILY };

if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
(TextInput as any).defaultProps.style = { fontFamily: APP_FONT_FAMILY };

initializeServices();

/** MD3テーマ → React Navigation ThemeProvider へのブリッジ */
function NavigationThemeBridge({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useMD3Theme();

  return (
    <ThemeProvider
      value={{
        dark: false,
        colors: {
          primary: colorScheme.primary,
          background: colorScheme.surface,
          card: colorScheme.surfaceContainer,
          text: colorScheme.onSurface,
          border: colorScheme.outlineVariant,
          notification: colorScheme.primary,
        },
        fonts: {
          regular: { fontFamily: APP_FONT_FAMILY, fontWeight: "400" },
          medium: { fontFamily: APP_FONT_FAMILY, fontWeight: "500" },
          bold: { fontFamily: APP_FONT_FAMILY, fontWeight: "700" },
          heavy: { fontFamily: APP_FONT_FAMILY, fontWeight: "900" },
        },
      }}
    >
      {children}
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  // 🛡️ ルーティングガード（認証チェックとリダイレクト）
  useRouteGuard();

  // MD3テーマ
  const { colorScheme } = useMD3Theme();

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

  return (
    <>
      <StatusBar
        style="dark"
        backgroundColor={colorScheme.surface}
      />
      <View style={{ flex: 1, backgroundColor: colorScheme.surface }}>
        <Slot />
      </View>
    </>
  );
}

export default function RootLayout() {
  // 基本的なフォント（よく使われるもの）のみを初期読み込み
  // 拡張フォントは必要に応じて各コンポーネントで遅延読み込み
  const [fontsLoaded, fontError] = useBasicFonts();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <MD3ThemeProvider>
        <NavigationThemeBridge>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </NavigationThemeBridge>
      </MD3ThemeProvider>
    </SafeAreaProvider>
  );
}
