/**
 * @file master/index.tsx
 * @description マスターダッシュボード画面。ユーザー一覧とステータスの概要を表示。
 *
 * useUser フックでユーザー一覧を取得し、MasterDashboardView に渡す。
 * useUser は内部で ServiceProvider.users を使ってSupabaseからデータを取得する。
 */

import React from "react";
// useUser: ユーザー一覧・CRUD操作を提供するカスタムフック
import { useUser } from "@/modules/reusable-widgets/user-management/user-hooks/useUser";
// MasterDashboardView: マスターダッシュボードのUIコンポーネント
import { MasterDashboardView } from "@/modules/master-view/masterDashboard/MasterDashboardView";

/**
 * MasterDashboardScreen: マスターダッシュボード画面。
 */
export default function MasterDashboardScreen() {
  // useUser: ユーザー一覧 (users)、ローディング状態 (loading)、エラー (error) を返す
  const { users, loading, error } = useUser();
  // MasterDashboardView にデータを渡してUIを描画
  return <MasterDashboardView users={users} loading={loading} error={error} />;
}
