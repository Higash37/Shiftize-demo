/**
 * @file master/_layout.tsx
 * @description マスター（管理者）画面のレイアウト。Stack ナビゲーション + フッター。
 *
 * ============================================================
 * 【Stack ナビゲーションとは — モバイルアプリの基本概念】
 * ============================================================
 *
 * ■ "Stack"（スタック）の由来:
 *   データ構造の「スタック」（積み重ね）に由来する。
 *   - Push: 新しい画面をスタックの上に積む（画面遷移）
 *   - Pop: 一番上の画面を取り除く（戻る操作）
 *
 *   例: [ホーム] → [ガント] → [シフト作成]
 *       ← 戻る        ← 戻る
 *
 *   この概念は iOS の UINavigationController（2008年〜）に端を発する。
 *   iPhoneの登場とともに「画面を右からスライドして表示、左にスライドで戻る」
 *   というUXパターンが確立された。Android にも Activity Stack として同様の概念がある。
 *
 * ■ Stack vs Tabs（タブ）の使い分け:
 *   - Stack: 深い階層へ掘り下げるナビゲーション（設定 → 詳細設定 → アカウント）
 *   - Tabs: 並列な画面を切り替えるナビゲーション（ホーム / 検索 / プロフィール）
 *   このアプリではフッターのTabsで大カテゴリを切り替え、
 *   各カテゴリ内ではStackで画面遷移する「Tabs + Stack」の複合パターンを採用。
 *
 * ■ headerShown: false の理由:
 *   Expo Router / React Navigation はデフォルトでヘッダー（タイトルバー）を表示するが、
 *   このアプリではカスタムヘッダー（MasterHeader）を使っているためデフォルトを無効化。
 *
 * ============================================================
 * 【ロールベースのアクセス制御 — RBAC】
 * ============================================================
 *
 * RBAC = Role-Based Access Control（ロールベースアクセス制御）。
 * ユーザーの「ロール」（役割）に応じてアクセスできる画面を制限するセキュリティパターン。
 *
 * このアプリのロール:
 * - "master": 管理者。全機能にアクセス可能。
 * - "user": 一般ユーザー（講師）。シフト提出・閲覧のみ。
 *
 * role !== "master" のユーザーがこのレイアウトにアクセスした場合、
 * user ホーム画面にリダイレクトする。
 *
 * ============================================================
 * 【PWA対応】
 * ============================================================
 *
 * PWA = Progressive Web App（プログレッシブ・ウェブ・アプリ）。
 * Webサイトをネイティブアプリのようにインストール・起動できる技術（Google提唱、2015年〜）。
 * - ブラウザタブ: 通常のWebページとして表示（アドレスバーあり）
 * - スタンドアローン: ホーム画面から起動、アドレスバーなし、アプリのように振る舞う
 *
 * スタンドアローンモードではフッターの位置を画面最下部に固定する（absoluteポジション）。
 */

// Stack: Expo Router のスタックナビゲーションコンポーネント
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter } from "expo-router";
import { View, Dimensions, StyleSheet } from "react-native";
import { Routes } from "@/common/common-constants/RouteConstants";
// MasterFooter: マスター画面用のフッターナビゲーション
import { MasterFooter } from "@/common/common-ui/ui-layout";

// NavigatorWithStandalone: navigator に standalone プロパティを追加した型
// standalone: PWAがホーム画面から起動されたかを示すプロパティ（Safari独自）
type NavigatorWithStandalone = Navigator & { standalone?: boolean };

/**
 * isStandalonePWA: PWAスタンドアローンモードかどうかを検出する。
 *
 * PWAには2つの起動モード:
 * - ブラウザタブ: 通常のブラウザ内で表示（アドレスバーあり）
 * - スタンドアローン: ホーム画面から起動した独立アプリ風（アドレスバーなし）
 *
 * 検出方法:
 * 1. CSS Media Query: (display-mode: standalone) が true
 * 2. navigator.standalone: Safari独自のプロパティが true
 */
function isStandalonePWA() {
  if (typeof window !== "undefined") {
    const navigatorStandalone = window.navigator as NavigatorWithStandalone;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      navigatorStandalone.standalone === true
    );
  }
  return false;
}

// 画面の高さを取得（レイアウト計算に使用）
const { height: screenHeight } = Dimensions.get("window");

/**
 * MasterLayout: マスター画面のレイアウトコンポーネント。
 * Stack ナビゲーション + フッターを提供する。
 */
export default function MasterLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [isPWA, setIsPWA] = useState(false);

  /**
   * wasAuthorized: 一度でも master として認可されたら true にセット。
   * TOKEN_REFRESHED等で一瞬 user が null になっても画面を維持する。
   */
  const wasAuthorized = useRef(false);

  // ユーザーが master ロールならフラグON
  if (user && role === "master") {
    wasAuthorized.current = true;
  }

  // PWAモードの検出
  useEffect(() => {
    setIsPWA(isStandalonePWA());
  }, []);

  // ロールが master でない場合は user ホームにリダイレクト
  useEffect(() => {
    if (user && role !== "master") {
      router.replace(Routes.main.user.home);
    }
  }, [user, role, router]);

  // ロード中は何も表示しない
  if (loading) {
    return null;
  }

  // 一度も認可されていない場合は null（リダイレクト待ち）
  if ((!user || role !== "master") && !wasAuthorized.current) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Stack ナビゲーション: 各ページをスタック式に管理 */}
      <Stack
        screenOptions={{
          headerShown: false,               // Expo Router のデフォルトヘッダーを非表示
          gestureEnabled: true,             // スワイプで戻る操作を有効化
          animation: "slide_from_right",    // ページ遷移アニメーション: 右からスライド
          presentation: "card",             // ページの表示方式: カード型
        }}
      >
        {/* 各ページの登録。name はファイルパスに対応する */}
        <Stack.Screen
          name="home"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="gantt-view"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="gantt-edit"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="today"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="info"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="users/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shifts/create"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shifts/this-month"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shifts/next-month"
          options={{ headerShown: false }}
        />
      </Stack>

      {/* フッター: PWAモードではabsoluteポジションで固定 */}
      <View style={[styles.footerArea, isPWA && styles.footerPWA]}>
        <MasterFooter />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    height: screenHeight,
  },
  footerArea: {
    width: "100%",
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  footerPWA: {
    // PWAスタンドアローン時: 画面最下部に絶対配置
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,  // 他のコンテンツの上に表示
  },
});
