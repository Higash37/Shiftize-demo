/**
 * @file user/change-password.tsx
 * @description パスワード変更画面。
 *
 * ChangePassword コンポーネントにパスワード変更のUIとロジックを委譲し、
 * 完了時に router.back() で前の画面に戻る。
 */

import React from "react";
// ChangePassword: パスワード変更フォームコンポーネント
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";
// useRouter: プログラム的なナビゲーション用フック
import { useRouter } from "expo-router";

/**
 * ChangePasswordScreen: パスワード変更画面。
 * onComplete コールバックで router.back()（前の画面に戻る）を実行する。
 */
const ChangePasswordScreen = () => {
  const router = useRouter();
  // onComplete: パスワード変更が成功した時に呼ばれるコールバック
  return <ChangePassword onComplete={() => router.back()} />;
};

export default ChangePasswordScreen;
