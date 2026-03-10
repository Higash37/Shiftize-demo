/**
 * @file useAuthGuard.ts
 * @description 認証状態に基づいてルーティングを制御するガードフック
 *
 * ============================================================
 * 【なぜ "use" で始まるのか — React Hooks の命名規約と歴史】
 * ============================================================
 *
 * ■ React Hooks 登場の歴史
 *   2018年10月、React 16.8 で Hooks が導入された。
 *   それ以前の React では、状態（state）やライフサイクル（componentDidMount 等）を
 *   使うにはクラスコンポーネントを書く必要があった。
 *
 *   クラスコンポーネント時代の問題:
 *   - ロジックの再利用が難しい: 同じロジック（例: 認証チェック）を複数の画面で使いたい場合、
 *     Higher-Order Component（HOC）や render props という複雑なパターンが必要だった。
 *   - コードが肥大化する: componentDidMount, componentDidUpdate, componentWillUnmount に
 *     関連するロジックが分散し、1つの機能のコードがファイル中に散らばった。
 *   - this の罠: JavaScript の this はコンテキストによって変わるため、
 *     イベントハンドラで this.setState を呼ぶと意図しない動作をすることがあった。
 *
 *   Hooks はこれらの問題を解決し、関数コンポーネントでも状態やライフサイクルを使えるようにした。
 *
 * ■ "use" プレフィックスが必須な理由（React のルール）
 *   React は内部で「この関数は Hook である」ことを "use" プレフィックスで判別している。
 *   これは単なる命名規約ではなく、React の Lint ルール（eslint-plugin-react-hooks）が
 *   "use" で始まる関数を Hook として認識し、以下のルールを強制する:
 *   1. Hook はコンポーネントのトップレベルでのみ呼べる（if文やループの中で呼べない）
 *   2. Hook は React の関数コンポーネントまたは他のカスタム Hook の中でのみ呼べる
 *   "use" を付けないと、これらのルール違反を検出できなくなる。
 *
 * ■ カスタムフックとは何か — いつ作るべきか
 *   カスタムフック = 複数の React Hook を組み合わせて、再利用可能なロジックにまとめたもの。
 *   内部で useState, useEffect, useContext 等の既存 Hook を使う関数。
 *
 *   カスタムフックを作るべきケース:
 *   - 同じロジックを2つ以上のコンポーネントで使う場合
 *   - コンポーネントのロジックが複雑になり、分離したい場合
 *   - テストしやすくするために、UIとロジックを分離したい場合
 *
 *   作らなくてよいケース:
 *   - そのコンポーネントでしか使わない単純なロジック
 *   - Hook を1つも呼ばない純粋な関数（→ 普通のユーティリティ関数にする）
 *
 * ■ このファイルの場合
 *   useAuthGuard = 認証ガードのロジックをフックとして切り出す理由:
 *   - 内部で useAuth(), useRouter(), useSegments(), useEffect() を組み合わせている
 *   - 「認証状態を監視して、未認証ならログイン画面にリダイレクトする」という
 *     汎用的なガードロジックを、どのレイアウトコンポーネントでも再利用できるようにしている
 *   - UIとルーティングロジックを分離し、レイアウトファイルをシンプルに保つ
 * ============================================================
 */
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { Routes, getDefaultHomeRoute, RouteGroups } from "@/common/common-constants/RouteConstants";

/** 認証状態に応じて適切な画面にリダイレクトするフック */
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

