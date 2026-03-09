import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { Routes, getDefaultHomeRoute, RouteGroups } from "@/common/common-constants/RouteConstants";

/**
 * 認証ガードフック
 * 認証状態に基づいてルーティングを制御
 */
export const useAuthGuard = () => {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) {
      return;
    }

    const atRoot = RouteGroups.isAtRoot(segments);

    // ルートページは認証に関係なく常にアクセス可能
    if (atRoot) {
      return;
    }

    // 認証が必要なページのチェック
    if (user) {
      handleAuthenticatedUser();
      return;
    }

    handleUnauthenticatedUser();
  }, [user, role, loading, segments, router]);

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

