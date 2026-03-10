/**
 * @file user/_layout.tsx
 * @description 一般ユーザー（講師）画面のレイアウト。Stack ナビゲーション + フッター。
 *
 * 【master/_layout.tsx との違い】
 * - role === "user" のユーザー向け
 * - 募集シフトページ（recruitment）は master も閲覧可能
 * - MasterFooter ではなく一般ユーザー向けの Footer を使用
 *
 * ============================================================
 * 【なぜ master/ と user/ で別のレイアウトを持つのか】
 * ============================================================
 *
 * ■ 理由: 管理者と一般ユーザーでは画面構成が大きく異なるため。
 *   - master: ガントチャート、ユーザー管理、設定画面など高機能
 *   - user: シフト提出、自分のシフト確認など限定的な機能
 *   - フッターのメニュー項目も異なる（MasterFooter vs Footer）
 *
 * ■ この設計パターン:
 *   管理者画面と一般ユーザー画面を分離する「ダッシュボード分離パターン」。
 *   WordPressの管理画面（/wp-admin/）と一般ユーザー画面が別なのと同じ発想。
 *   SaaS アプリでは admin/ と app/ で分けるのが一般的。
 *
 * ============================================================
 * 【useSegments の使い方】
 * ============================================================
 *
 * ■ "Segment"（セグメント）= URLのパスを "/" で区切った各部分。
 *   例: /(main)/user/shifts/create
 *     → ["(main)", "user", "shifts", "create"]
 *
 *   URLを分解して「今どのページにいるか」をプログラムで判定できる。
 *   segments.includes("recruitment") で募集シフトページかどうかを判定している。
 *
 * ■ なぜ募集シフトだけ特別か:
 *   募集シフトは master が作成し、user が応募する機能。
 *   master が「このシフトを見せたい」と思ったとき、
 *   user のレイアウト内にある recruitment ページを master も閲覧できる必要がある。
 *   → role チェックで例外として扱っている。
 */

// Stack: スタックナビゲーションコンポーネント
import { Stack } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/services/auth/useAuth";
// useRouter: プログラム的なナビゲーション用フック
// useSegments: 現在のURLのパスセグメントを取得するフック
import { useRouter, useSegments } from "expo-router";
import { View, Dimensions, StyleSheet } from "react-native";
import { Routes } from "@/common/common-constants/RouteConstants";
// Footer: 一般ユーザー画面用のフッターナビゲーション
import { Footer } from "@/common/common-ui/ui-layout";

const { height: screenHeight } = Dimensions.get("window");

/**
 * userLayout: 一般ユーザー画面のレイアウトコンポーネント。
 */
export default function userLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  // useSegments: 現在のURLをセグメント配列で返す
  const segments = useSegments();

  // useMemo: segments が変わった時だけ再計算
  // 募集シフトページかどうかの判定
  const isRecruitmentPage = useMemo(
    () => segments.includes("recruitment"),
    [segments]
  );

  /**
   * wasAuthorized: 一度でも認可されたら true にセット。
   * user ロール or 募集シフトページなら認可する。
   */
  const wasAuthorized = useRef(false);

  if (user && (role === "user" || isRecruitmentPage)) {
    wasAuthorized.current = true;
  }

  // ロールが user でない、かつ募集シフトページでもない場合 → master ホームにリダイレクト
  useEffect(() => {
    if (user && role !== "user" && !isRecruitmentPage) {
      router.replace(Routes.main.master.home);
    }
  }, [user, role, isRecruitmentPage, router]);

  // ロード中は何も表示しない
  if (loading) {
    return null;
  }

  // 一度も認可されていない場合は null（リダイレクト待ち）
  const isUnauthorized = !user || (role !== "user" && !isRecruitmentPage);
  if (isUnauthorized && !wasAuthorized.current) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Stack ナビゲーション */}
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: "slide_from_right",
          presentation: "card",
        }}
      >
        <Stack.Screen
          name="home"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shifts/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shifts/create"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="today"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="change-password"
          options={{ headerShown: false }}
        />
      </Stack>

      {/* フッター: 一般ユーザー向けナビゲーション */}
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    height: screenHeight,
  },
});
