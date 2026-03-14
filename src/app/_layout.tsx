/**
 * @file _layout.tsx（ルートレイアウト）
 * @description アプリ全体のルートレイアウト。全画面に共通する設定を行う。
 *
 * ============================================================
 * 【"Layout" とは何か — 歴史と由来】
 * ============================================================
 *
 * "Layout"（レイアウト）は「配置・構成」を意味する英語。
 * Web/アプリ開発では「ページの共通枠組み」を指す。
 *
 * ■ 歴史的背景:
 *   1. 初期のWeb（2000年代前半）:
 *      HTML で全ページにヘッダー・フッターをコピペしていた。
 *      → 変更するとき全ページを修正する必要がある = DRY原則違反
 *
 *   2. テンプレートエンジン時代（PHP, Rails, Django）:
 *      「レイアウトテンプレート」という概念が登場。
 *      - Ruby on Rails: application.html.erb がレイアウトファイル
 *      - PHP/Laravel: layouts/app.blade.php
 *      → ヘッダー・フッター等の共通部分を1箇所に書き、
 *        各ページの中身だけを「yield」や「slot」で差し込む仕組み。
 *
 *   3. React SPA時代（2015年〜）:
 *      React Router で <Layout> コンポーネントを作り、
 *      <Outlet /> で子ルートを表示するパターンが定着。
 *
 *   4. Next.js のファイルベースルーティング（2016年〜）:
 *      pages/ ディレクトリのファイルが自動でルートになる革新的な仕組み。
 *      Next.js 13 で app/ ディレクトリと layout.tsx が導入された。
 *
 *   5. Expo Router（2023年〜、このプロジェクトが使用）:
 *      Next.js の app/ ディレクトリ方式をReact Native向けに移植。
 *      _layout.tsx がレイアウトファイルとして機能する。
 *
 * ■ なぜファイル名が「_layout」でアンダースコア付きか:
 *   アンダースコア「_」は「このファイルはページではない」というExpo Routerの規約。
 *   - index.tsx  → URLでアクセスできるページ（例: "/"）
 *   - _layout.tsx → ページではなく、周りのページを囲むラッパー
 *   → "_" がついていると URL として公開されない。
 *   この規約は Next.js の _app.tsx, _document.tsx から引き継がれている。
 *   さらに遡ると、Unix/Linux で「.」で始まる隠しファイルの慣習に似た発想。
 *
 * ============================================================
 * 【Expo Router のファイルベースルーティング】
 * ============================================================
 *
 * Expo Router は src/app/ ディレクトリ構造がそのままURLパスになる仕組み:
 *   src/app/_layout.tsx       → ルートレイアウト（★このファイル。全画面を囲む）
 *   src/app/index.tsx         → "/" のページ
 *   src/app/(auth)/...        → 認証関連ページ（括弧はURLに含まれない）
 *   src/app/(main)/...        → メイン画面ページ（括弧はURLに含まれない）
 *
 * ■ なぜファイルベースルーティングが主流になったか:
 *   従来: ルート設定ファイルに手動でパスとコンポーネントを対応づけていた
 *     例: { path: "/login", component: LoginPage }
 *   → ファイルを作るだけで自動でルートになる = 設定ミスが減る、直感的
 *
 * ============================================================
 * 【_layout.tsx の役割】
 * ============================================================
 *
 * _layout.tsx は「レイアウトファイル」で、同ディレクトリとサブディレクトリの
 * 全ページを囲むラッパー。ヘッダー、フッター、Context Provider等を設定する。
 * <Slot /> が子ページのレンダリング位置を示す。
 *
 * ■ レイアウトの入れ子構造:
 *   src/app/_layout.tsx           ← ★全画面を囲む（このファイル）
 *     src/app/(main)/_layout.tsx  ← メイン画面を囲む
 *       src/app/(main)/master/_layout.tsx ← 管理者画面を囲む
 *         → 各ページ（home.tsx, gantt-view.tsx 等）
 *
 *   ページが表示されるとき、外側のレイアウトから順に適用される。
 *   ロシアの入れ子人形（マトリョーシカ）のようなイメージ。
 *
 * 【Slot vs Stack vs Tabs】
 * - Slot: 子ルートをそのまま表示。ナビゲーションUIなし。シンプルなラッパー。
 * - Stack: ページを積み重ね式に管理。「戻る」で前のページに戻れる。iOSのナビゲーション。
 * - Tabs: 下部タブで複数ページを切り替え。Instagram, LINEなどが典型例。
 *
 * 【このファイルの Provider 階層】
 * SafeAreaProvider（安全領域管理）
 *   → MD3ThemeProvider（Material Design 3 テーマ）
 *     → NavigationThemeBridge（MD3テーマ → React Navigation テーマ変換）
 *       → AuthProvider（認証状態管理）
 *         → RootLayoutNav（ルートガード + 子ページ表示）
 *           → <Slot />（子ページがここにレンダリングされる）
 */

import React, { useEffect } from "react";
// Slot: Expo Routerの子ルートレンダリングコンポーネント
import { Slot } from "expo-router";
// AuthProvider: 認証状態をアプリ全体に提供するContext Provider
import { AuthProvider } from "@/services/auth/AuthContext";
// StatusBar: 画面上部のステータスバー（時計、バッテリー等）のスタイル設定
import { StatusBar } from "expo-status-bar";
import { View, Text, TextInput, Platform } from "react-native";
// ThemeProvider: React Navigationのテーマ設定用Provider
import { ThemeProvider } from "@react-navigation/native";
// SafeAreaProvider: iPhoneのノッチ等の安全領域を管理するProvider
import { SafeAreaProvider } from "react-native-safe-area-context";
// useRouteGuard: 認証チェックとリダイレクトを行うカスタムフック
import { useRouteGuard } from "@/common/common-hooks/useRouteGuard";
// VersionManager: アプリの自動更新を管理するユーティリティ
import { VersionManager } from "@/services/version/VersionManager";
// useBasicFonts: 基本フォントを読み込むカスタムフック
import { useBasicFonts } from "@/common/common-utils/performance/fontLoader";
// initializeServices: ServiceProviderにサービスインスタンスを登録する初期化関数
import { initializeServices } from "@/services/initializeServices";
// MD3ThemeProvider: Material Design 3テーマを提供するProvider
// useMD3Theme: 現在のMD3テーマを取得するフック
import { MD3ThemeProvider, useMD3Theme } from "@/common/common-theme/md3";
// APP_FONT_FAMILY: アプリ全体で使用するフォントファミリー名
import { APP_FONT_FAMILY } from "@/common/common-constants/FontConstants";

// ── アプリ全体のデフォルトフォントを設定 ──
// React NativeのTextとTextInputのデフォルトスタイルを書き換える。
// defaultProps パターン: グローバルに全コンポーネントのデフォルトpropsを設定する。
// (Text as any) は型チェックをバイパスしている（defaultPropsは非公式API）。
if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
(Text as any).defaultProps.style = { fontFamily: APP_FONT_FAMILY };

if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
(TextInput as any).defaultProps.style = { fontFamily: APP_FONT_FAMILY };

// ── サービスの初期化（モジュールレベルで1回だけ実行） ──
// ServiceProviderに各サービス（Auth, Shift, User等）のインスタンスを登録する
initializeServices();

/**
 * NavigationThemeBridge: MD3テーマをReact Navigationのテーマ形式に変換するブリッジ。
 *
 * 【なぜブリッジが必要か】
 * - MD3ThemeProvider: Material Design 3のカラースキーム（primary, surface等）を提供
 * - React Navigation: 独自のテーマ形式（colors.primary, colors.background等）を期待
 * → 2つのテーマシステムの色を接続する変換層が必要
 *
 * @param children - 子コンポーネント（アプリ全体）
 */
function NavigationThemeBridge({ children }: { children: React.ReactNode }) {
  // useMD3Theme: 現在のMD3カラースキームを取得
  const { colorScheme } = useMD3Theme();

  return (
    <ThemeProvider
      value={{
        dark: false,  // ダークモードOFF
        colors: {
          // MD3のカラーをReact Navigationの期待する形式にマッピング
          primary: colorScheme.primary,             // メインカラー
          background: colorScheme.surface,          // 背景色
          card: colorScheme.surfaceContainer,       // カード背景色
          text: colorScheme.onSurface,              // テキスト色
          border: colorScheme.outlineVariant,       // ボーダー色
          notification: colorScheme.primary,        // 通知バッジ色
        },
        fonts: {
          // フォントの太さバリエーション
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

/**
 * RootLayoutNav: ルートレイアウトのナビゲーション部分。
 * ルートガード（認証チェック）とバージョンチェックを担当する。
 */
function RootLayoutNav() {
  // useRouteGuard: 未認証ユーザーをログイン画面にリダイレクトする。
  // 認証が必要なルート（/(main)/...）にアクセスしたとき、
  // ログインしていなければ /(auth)/login に遷移させる。
  useRouteGuard();

  // MD3テーマの取得
  const { colorScheme } = useMD3Theme();

  // ── バージョンチェック（Web環境のみ） ──
  useEffect(() => {
    // Platform.OS: 実行環境を識別する（"web", "ios", "android"）
    if (Platform.OS === "web") {
      // アプリ起動時に即座にバージョンチェック
      VersionManager.checkForUpdatesOnStartup();

      // 定期的なバージョンチェックを開始（60秒ごと）
      VersionManager.startVersionCheck(() => {
        // オプショナルアップデート: ユーザーに確認ダイアログを表示
        if (confirm("新しいバージョンが利用可能です。今すぐ更新しますか？")) {
          globalThis.window.location.reload();
        }
      });

      // クリーンアップ関数: コンポーネントアンマウント時にタイマーを解除
      return () => {
        VersionManager.stopVersionCheck();
      };
    }
  }, []); // [] = マウント時に1回だけ実行

  return (
    <>
      {/* ステータスバーのスタイル設定（時計やバッテリー表示） */}
      <StatusBar
        style="dark"                              // テキスト色: 黒
        backgroundColor={colorScheme.surface}     // 背景色
      />
      {/* flex: 1 で画面全体を占有 */}
      <View style={{ flex: 1, backgroundColor: colorScheme.surface }}>
        {/* Slot: 子ルートがここにレンダリングされる。
            例: /(auth)/login にアクセスすると、Slot の位置に Login コンポーネントが表示される */}
        <Slot />
      </View>
    </>
  );
}

/**
 * RootLayout: アプリのルートコンポーネント（エントリーポイント）。
 * Expo Router が最初に読み込む _layout.tsx の default export。
 *
 * 【Provider のネスト順序が重要】
 * 1. SafeAreaProvider: 安全領域（ノッチ等を避ける）
 * 2. MD3ThemeProvider: テーマカラー
 * 3. NavigationThemeBridge: テーマ変換
 * 4. AuthProvider: 認証状態
 * 5. RootLayoutNav: ルートガード + 画面表示
 *
 * 内側のProviderは外側のProviderの値を参照できるため、
 * AuthProvider内でテーマを使うことが可能。
 */
export default function RootLayout() {
  // 基本フォントの読み込み
  // useBasicFonts: expo-fontを使ってカスタムフォントを非同期読み込みする
  // fontsLoaded: 読み込み完了フラグ、fontError: エラーオブジェクト
  const [fontsLoaded, fontError] = useBasicFonts();

  // フォント読み込み中はnull（何も表示しない）
  // フォントが読み込まれる前にテキストを表示するとデフォルトフォントでちらつく
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Provider階層: 外側から内側へネストする
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
