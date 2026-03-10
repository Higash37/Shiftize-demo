/**
 * @file user/home.tsx
 * @description 一般ユーザーのホーム画面。ヘッダー + カレンダー付きシフト一覧。
 *
 * Header + HomeCommonScreen の組み合わせで構成される。
 * HomeCommonScreen はマスター・ユーザー共通のホーム画面コンポーネント。
 *
 * screenOptions: Expo Router がナビゲーションバーに表示するタイトル等の設定。
 * headerBackVisible: false で「戻る」ボタンを非表示にする（ホーム画面のため）。
 */

import React from "react";
// Header: 一般ユーザー向けのヘッダーコンポーネント
import { Header } from "@/common/common-ui/ui-layout";
// HomeCommonScreen: マスター・ユーザー共通のホーム画面
import HomeCommonScreen from "../../../modules/home-view/home-screens/HomeCommonScreen";

/** Expo Router のスクリーンオプション */
export const screenOptions = {
  title: "ホーム",
  headerBackVisible: false,
};

/**
 * UserHomeScreen: ユーザーホーム画面。
 * <> (Fragment) で Header と HomeCommonScreen を並べて表示する。
 */
export default function UserHomeScreen() {
  return (
    <>
      <Header title="ホーム" />
      <HomeCommonScreen />
    </>
  );
}
