/**
 * @file MD3ThemeContext.tsx
 * @description Material Design 3 テーマをReactコンポーネントツリー全体に配信するためのContext。
 *
 * 【このファイルの位置づけ】
 * - MD3ThemeProvider: アプリのルートに配置し、テーマを子コンポーネントに提供する
 * - useMD3Theme: 任意のコンポーネントからテーマにアクセスするフック
 * - lightTheme: 事前構築されたライトテーマオブジェクト
 * - 関連ファイル: MD3Theme.types.ts, MD3Colors.ts, MD3Typography.ts, MD3Shape.ts,
 *                MD3Elevation.ts, MD3Spacing.ts
 *
 * 【React Context とは】
 * propsを通じてバケツリレーしなくても、コンポーネントツリー全体でデータを共有できる仕組み。
 * テーマのようにアプリ全体で共通して使う値の配信に適している。
 *
 * 【Provider / Consumer パターン】
 * 1. createContext() でContextを作成
 * 2. Provider コンポーネントで値を配信
 * 3. useContext() フックで値を取得
 */

import React, { createContext, useContext } from "react";
import { MD3Theme } from "./MD3Theme.types";
import { lightColorScheme } from "./MD3Colors";
import { md3Typography } from "./MD3Typography";
import { md3Shape } from "./MD3Shape";
import { md3Elevation } from "./MD3Elevation";
import { md3Spacing } from "./MD3Spacing";

// ---------------------------------------------------------------------------
// Pre-built theme object (light only)
// ---------------------------------------------------------------------------

/**
 * lightTheme - 事前構築済みのライトテーマオブジェクト
 *
 * MD3Theme型に準拠した完全なテーマ定義。
 * 各サブシステム（色、文字、角丸、影、余白）を組み合わせて1つのオブジェクトにする。
 *
 * 【なぜ事前構築するのか】
 * ランタイムで毎回オブジェクトを生成すると、Reactの再レンダリングが発生するため、
 * 不変のオブジェクトとして事前に定義しておく。
 */
export const lightTheme: MD3Theme = {
  colorScheme: lightColorScheme,  // 色の定義
  typography: md3Typography,       // 文字スタイルの定義
  shape: md3Shape,                 // 角丸の定義
  elevation: md3Elevation,         // 影の定義
  spacing: md3Spacing,             // 余白の定義
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * MD3ThemeContext - テーマ用のReact Context
 *
 * createContext の引数はデフォルト値。Providerの外側で使われた場合にこの値が返る。
 * ここではlightThemeをデフォルトにしている。
 *
 * 【TypeScript構文の解説】
 * - `createContext<MD3Theme>` → ジェネリクス。Contextが保持する値の型を指定する
 */
const MD3ThemeContext = createContext<MD3Theme>(lightTheme);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * MD3ThemeProvider - テーマを子コンポーネントに提供するProviderコンポーネント
 *
 * アプリのルート（App.tsx等）に配置する。
 * このProviderの内側にあるすべてのコンポーネントが useMD3Theme() でテーマを取得可能。
 *
 * 【使い方の例】
 * ```tsx
 * // App.tsx
 * <MD3ThemeProvider>
 *   <NavigationContainer>
 *     <AppScreens />
 *   </NavigationContainer>
 * </MD3ThemeProvider>
 * ```
 *
 * 【TypeScript構文の解説】
 * - `React.FC<{ children: React.ReactNode }>` → 関数コンポーネントの型。
 *   childrenプロパティを受け取ることを示す
 * - `React.ReactNode` → JSX要素、文字列、数値、null等、Reactがレンダリング可能な型
 */
export const MD3ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <MD3ThemeContext.Provider value={lightTheme}>
    {children}
  </MD3ThemeContext.Provider>
);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useMD3Theme - 現在のMD3テーマを取得するカスタムフック
 *
 * MD3ThemeProviderの内側で使用する。テーマオブジェクト（色、文字、角丸、影、余白）を返す。
 *
 * 【useContext とは】
 * createContext() で作ったContextの現在の値を取得するReactフック。
 * 最も近い上位のProviderの値が返される。
 *
 * @returns MD3Theme - テーマオブジェクト（colorScheme, typography, shape, elevation, spacing）
 *
 * @example
 * ```tsx
 * const { colorScheme, typography, shape } = useMD3Theme();
 * <Text style={[typography.bodyLarge, { color: colorScheme.onSurface }]}>
 *   Hello
 * </Text>
 * ```
 */
export const useMD3Theme = (): MD3Theme => {
  return useContext(MD3ThemeContext);
};
