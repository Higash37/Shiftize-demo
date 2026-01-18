import { Slot } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";

/**
 * クイックシフトレイアウト
 * 認証が必要なシンプルな単ページ用
 */
export default function QuickLayout() {
  const { user, loading } = useAuth();

  // ローディング中は何も表示しない
  if (loading) {
    return null;
  }

  // 未認証の場合は何も表示しない（ルートレイアウトで処理）
  if (!user) {
    return null;
  }

  return <Slot />;
}
