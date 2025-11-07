import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { AppState } from "react-native";
import { useAuth } from "@/services/auth/useAuth";
import { Routes, RouteGroups, getDefaultHomeRoute } from "@/common/common-constants/RouteConstants";

/**
 * ルーティングガードフック（統合版）
 * 認証ガードとAppState変更時の認証チェックを統合
 */
export const useRouteGuard = () => {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // メインの認証ガード
  useEffect(() => {
    if (loading) {
      return;
    }

    const { inLandingGroup, atRoot } = {
      inLandingGroup: RouteGroups.isLandingGroup(segments),
      atRoot: RouteGroups.isAtRoot(segments),
    };

    // ルートページまたはランディングページは認証に関係なく常にアクセス可能
    if (inLandingGroup || atRoot) {
      return;
    }

    // 認証が必要なページのチェック
    if (user) {
      handleAuthenticatedUser();
      return;
    }

    handleUnauthenticatedUser();
  }, [user, role, loading, segments, router]);

  // AppState変更時の認証チェック
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !loading) {
        // ランディングページにいる場合は認証チェックをスキップ
        const inLandingGroup = RouteGroups.isLandingGroup(segments);
        const inAuthGroup = RouteGroups.isAuthGroup(segments);
        if (inLandingGroup) {
          return;
        }

        // 認証状態を再確認する前に少し待つ
        timeoutId = setTimeout(() => {
          if (user || loading || inAuthGroup) {
            return;
          }
          // 現在のパスとパラメータを保存してリダイレクト
          const currentPath = segments.join("/");
          let urlParams = "";
          if (globalThis.window) {
            urlParams = globalThis.window.location.search;
          }
          const redirectPath = encodeURIComponent("/" + currentPath + urlParams);
          router.replace(`${Routes.auth.login}?redirect=${redirectPath}`);
        }, 1000); // 1秒待機
      }
    });
    return () => {
      clearTimeout(timeoutId);
      subscription.remove();
    };
  }, [user, loading, segments, router]);

  /**
   * 認証済みユーザーのリダイレクト処理
   */
  const handleAuthenticatedUser = () => {
    const inAuthGroup = RouteGroups.isAuthGroup(segments);
    if (!inAuthGroup) {
      return;
    }

    // 認証済みユーザーが認証画面にいる場合
    const redirectPath = getRedirectPath();
    if (redirectPath) {
      const decodedPath = decodeURIComponent(redirectPath);
      router.replace(decodedPath);
      return;
    }

    // リダイレクトパスがない場合のみデフォルトのホーム画面へ
    redirectToDefaultHome();
  };

  /**
   * 未認証ユーザーのリダイレクト処理
   */
  const handleUnauthenticatedUser = () => {
    const inMainGroup = RouteGroups.isMainGroup(segments);
    if (!inMainGroup) {
      return;
    }

    const currentPath = segments.join("/");
    let urlParams = "";
    if (globalThis.window) {
      urlParams = globalThis.window.location.search;
    }
    const redirectPath = encodeURIComponent("/" + currentPath + urlParams);
    router.replace(`${Routes.auth.login}?redirect=${redirectPath}`);
  };

  /**
   * リダイレクトパスの取得
   */
  const getRedirectPath = (): string | null => {
    if (globalThis.window === undefined) {
      return null;
    }
    const urlParams = new URLSearchParams(globalThis.window.location.search);
    return urlParams.get("redirect");
  };

  /**
   * デフォルトホーム画面へのリダイレクト
   */
  const redirectToDefaultHome = () => {
    const currentSegments = segments.filter((seg) => seg && seg !== "(auth)");

    if (currentSegments.length === 0 || segments.includes("login")) {
      const homeRoute = getDefaultHomeRoute(role);
      router.replace(homeRoute);
    }
  };
};

