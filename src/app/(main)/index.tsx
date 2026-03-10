/**
 * @file (main)/index.tsx
 * @description メイングループのインデックスページ。ユーザーホーム画面にリダイレクトする。
 *
 * /(main)/ にアクセスされた場合、ユーザーのホーム画面にリダイレクトする。
 * useEffect で router.replace を実行し、履歴を残さずに遷移する。
 *
 * HomeCommonScreen は遷移先が表示されるまでの間のプレースホルダーとして表示される。
 */

import { useEffect } from "react";
// router: プログラム的なページ遷移を行うオブジェクト
import { router } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { User } from "@/common/common-models/ModelIndex";
import HomeCommonScreen from "../../modules/home-view/home-screens/HomeCommonScreen";

/**
 * HomePage: メイングループのインデックスページ。
 * /(main)/ にアクセスされたら /(main)/user/home にリダイレクトする。
 */
export default function HomePage() {
  // useAuth() as { user: User | null } は型アサーション。
  // useAuth の戻り値を明示的な型に変換している。
  const { user } = useAuth() as { user: User | null };

  useEffect(() => {
    // router.replace: 現在の履歴エントリを置換して遷移。
    // 「戻る」ボタンでこのページに戻れないようにする。
    router.replace("/(main)/user/home");
  }, [user]); // user が変わったら再実行

  // リダイレクト中のプレースホルダー表示
  return <HomeCommonScreen />;
}
