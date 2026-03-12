/**
 * @file login/index.tsx
 * @description ログイン画面。メールアドレスまたはニックネームでログインする。
 *
 * 【このファイルの位置づけ — ログインフロー】
 *   ユーザーがフォームに入力
 *        ↓ handleLogin()
 *   useAuth().signIn()（AuthContext.tsx）
 *        ↓
 *   supabase.auth.signInWithPassword()
 *        ↓ 認証成功
 *   router.replace() でホーム画面へ遷移
 *
 * 【主要な処理】
 * 1. URLパラメータ "demo=true" でデモモーダルを自動表示
 * 2. LoginForm コンポーネントにログイン処理を委譲
 * 3. ログイン成功時にロールに応じたホーム画面にリダイレクト
 * 4. サービス紹介モーダルの遅延読み込み（lazy import）
 */

import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// AntDesign: Ant Design のアイコンセット
import { AntDesign } from "@expo/vector-icons";
// router: プログラム的なページ遷移（push, replace, back等）
// useLocalSearchParams: URLクエリパラメータを取得するフック
import { router, useLocalSearchParams } from "expo-router";
// useAuth: 認証Context（signIn, signOut, user等）を取得するカスタムフック
import { useAuth } from "@/services/auth/useAuth";
// getDefaultHomeRoute: ロールに応じたデフォルトのホーム画面URLを返す
import { getDefaultHomeRoute } from "@/common/common-constants/RouteConstants";
// LoginForm: ログインフォームのUIコンポーネント
import { LoginForm } from "@/modules/login-view/loginView/LoginForm";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

/**
 * ServiceIntroModalの遅延読み込み（Lazy Loading）。
 *
 * lazy(() => import(...)) はコンポーネントを必要になるまで読み込まない。
 * 初回表示時のバンドルサイズを削減し、ページの読み込み速度を向上させる。
 * .then(module => ({ default: module.ServiceIntroModal })) は
 * 名前付きエクスポートをデフォルトエクスポートに変換する処理。
 * lazy は default export のみをサポートするため。
 */
const ServiceIntroModal = lazy(() =>
  import("@/modules/reusable-widgets/service-intro/ServiceIntroModal").then(module => ({ default: module.ServiceIntroModal }))
);

/**
 * Login: ログイン画面のメインコンポーネント。
 */
export default function Login() {
  // useAuth() から signIn 関数を取得
  const { signIn } = useAuth();
  // ローカルUI状態
  const [loading, setLoading] = useState(false);          // ログイン処理中フラグ
  const [errorMessage, setErrorMessage] = useState("");   // エラーメッセージ
  const [showServiceIntro, setShowServiceIntro] = useState(false);  // サービス紹介モーダル表示
  const [showDemoModal, setShowDemoModal] = useState(false);        // デモモーダル表示

  // useLocalSearchParams: URLの ?key=value 部分を取得
  // 例: /(auth)/login?demo=true&redirect=/main → { demo: "true", redirect: "/main" }
  const params = useLocalSearchParams();

  // テーマとブレークポイント（レスポンシブ対応）
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  // useMemo: テーマやブレークポイントが変わった時だけスタイルを再計算
  const styles = useMemo(() => createLoginScreenStyles(theme, bp), [theme, bp]);
  const { colorScheme } = theme;

  // ── URLパラメータの処理 ──
  // "demo=true" パラメータがあればデモモーダルを自動表示し、パラメータを削除
  useEffect(() => {
    if (params["demo"] === "true") {
      setShowDemoModal(true);
      // demoパラメータを削除して、redirectパラメータだけ残す
      const newParams = new URLSearchParams();
      if (params["redirect"]) {
        newParams.set("redirect", params["redirect"] as string);
      }
      const redirectUrl = newParams.toString()
        ? `/(auth)/login?${newParams.toString()}`
        : "/(auth)/login";
      // router.replace: 現在の履歴エントリを置換（戻るボタンで戻れない）
      router.replace(redirectUrl);
    }
  }, [params]);

  /**
   * handleLogin: ログインボタン押下時のハンドラー。
   *
   * @param emailOrUsername - メールアドレスまたはニックネーム
   * @param password - パスワード
   * @param storeId - 店舗ID（ニックネームログイン時に必要）
   */
  const handleLogin = async (
    emailOrUsername: string,
    password: string,
    storeId?: string
  ) => {
    setLoading(true);
    setErrorMessage("");
    try {
      // メールアドレス形式かどうか判定
      const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);

      let result;
      if (isEmailFormat) {
        // メール形式: そのまま signIn に渡す
        result = await signIn(emailOrUsername, password);
      } else {
        // ニックネーム形式: 店舗ID + ニックネーム + @example.com を生成
        if (!storeId) {
          throw new Error("店舗IDが必要です");
        }
        const email = `${storeId}${emailOrUsername}@example.com`;
        result = await signIn(email, password, storeId);
      }

      // ── ログイン成功後のリダイレクト ──
      // loading=true のまま遷移することで、フォームの再表示（ちらつき）を防ぐ
      const redirectParam = params["redirect"] as string | undefined;
      if (redirectParam) {
        // redirect パラメータがあればそのURLに遷移
        // decodeURIComponent: URLエンコードされた文字列をデコード
        router.replace(decodeURIComponent(redirectParam));
      } else {
        // デフォルト: ロールに応じたホーム画面に遷移
        // master → /(main)/master/home, user → /(main)/user/home
        router.replace(getDefaultHomeRoute(result.role));
      }
    } catch (error) {
      setErrorMessage(
        "ログインに失敗しました。メールアドレス・ニックネームまたはパスワードが違います"
      );
      // エラー時のみ loading を false に戻す（成功時は遷移中なのでtrueのまま）
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ── ヘッダー ── */}
      <Box
        variant="primary"
        style={styles.header}
      >
        <View style={styles.headerContainer}>
          {/* 左: スペーサー（右側のアイコンと対称にするため） */}
          <View style={styles.headerSpacer} />
          {/* 中央: タイトル */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/(main)")}
          >
            <Text style={styles.headerTitle}>
              Shiftize
            </Text>
            <Text style={styles.headerSubtitle}>
              シフト管理システム
            </Text>
          </TouchableOpacity>
          {/* 右: アイコンボタン */}
          <View style={styles.headerIcons}>
            {/* サービス紹介モーダルを開くボタン */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowServiceIntro(true)}
            >
              <AntDesign
                name="question-circle"
                size={24}
                color={colorScheme.onPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Box>

      {/* ── コンテンツ ── */}
      <View style={styles.content}>
        {/* LoginForm: ログインフォームのUIコンポーネント（フォーム入力を管理） */}
        <LoginForm
          onLogin={handleLogin}
          loading={loading}
          showDemoModal={showDemoModal}
          setShowDemoModal={setShowDemoModal}
        />
        {/* エラーメッセージの表示 */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
      </View>

      {/* ── サービス紹介モーダル（遅延読み込み） ── */}
      {/* showServiceIntro が true の時だけレンダリング → lazy import が発動 */}
      {showServiceIntro && (
        // Suspense: lazy コンポーネントの読み込み中にフォールバック（ここではnull）を表示
        <Suspense fallback={null}>
          <ServiceIntroModal
            visible={showServiceIntro}
            onClose={() => setShowServiceIntro(false)}
          />
        </Suspense>
      )}
    </SafeAreaView>
  );
}

/**
 * createLoginScreenStyles: テーマとブレークポイントに応じたスタイルを生成する。
 * 関数で生成することで、テーマ変更時に動的にスタイルを切り替えられる。
 *
 * @param theme - MD3テーマオブジェクト
 * @param breakpoint - 画面サイズに応じたフラグ（isMobile, isTablet, isDesktop）
 * @returns StyleSheet.create() で生成されたスタイルオブジェクト
 */
const createLoginScreenStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
) => {
  const { isMobile, isDesktop } = breakpoint;
  // モバイルとデスクトップはコンパクト表示
  const isCompact = isMobile || isDesktop;

  return StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    header: {
      alignItems: "center",
      // コンパクト時は小さなパディング、タブレットは大きなパディング
      paddingVertical: isCompact ? theme.spacing.sm : theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xxl,
      borderBottomLeftRadius: theme.shape.large,
      borderBottomRightRadius: theme.shape.large,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      ...theme.elevation.level2.shadow,  // スプレッドでシャドウスタイルを適用
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    headerButton: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    headerTitle: {
      ...(isCompact ? theme.typography.titleLarge : theme.typography.headlineMedium),
      color: theme.colorScheme.onPrimary,
      textAlign: "center",
    },
    headerSubtitle: {
      ...(isCompact ? theme.typography.bodySmall : theme.typography.bodyLarge),
      color: theme.colorScheme.onPrimary,
      opacity: 0.9,
      textAlign: "center",
    },
    headerIcons: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    headerSpacer: {
      width: 80,
    },
    iconButton: {
      padding: theme.spacing.sm,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    errorContainer: {
      backgroundColor: theme.colorScheme.errorContainer,
      borderRadius: theme.shape.small,
      borderWidth: 1,
      borderColor: theme.colorScheme.error,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    errorText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onErrorContainer,
      textAlign: "center",
      fontWeight: "500",
    },
  });
};
