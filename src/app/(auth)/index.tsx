/**
 * @file (auth)/index.tsx
 * @description 認証グループのインデックスページ。ログイン画面にリダイレクトする。
 *
 * 【Expo Router のインデックスルート】
 * ディレクトリ内の index.tsx はそのディレクトリのデフォルトページ。
 * /(auth)/ にアクセスすると、この index.tsx が表示される。
 */

import React from "react";
// Redirect: 即座に指定先に遷移するコンポーネント
import { Redirect } from "expo-router";

/**
 * AuthIndex: 認証グループのインデックス。
 * /(auth)/ にアクセスされたらログイン画面にリダイレクトする。
 */
export default function AuthIndex() {
  return <Redirect href="/(auth)/login" />;
}
