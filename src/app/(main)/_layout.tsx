/**
 * @file (main)/_layout.tsx
 * @description メイン画面（認証後の画面）のレイアウト。
 *
 * 【このファイルの位置づけ】
 * 認証済みユーザーがアクセスする画面群（/(main)/...）の共通レイアウト。
 * 設定用のContext Provider（Settings, TimeSegmentTypes等）をまとめて提供する。
 *
 * ============================================================
 * 【なぜ (main) と (auth) を分けるのか — レイアウト分離の設計思想】
 * ============================================================
 *
 * ■ 目的: 認証前と認証後で異なる「共通枠組み」を適用するため。
 *
 *   (auth)/: ログインやオンボーディング画面。
 *     → Provider は最小限（テーマだけ）。シフトデータの取得は不要。
 *
 *   (main)/: ログイン後のメイン画面。
 *     → Settings, TimeSegmentTypes, StaffRoles 等のProviderが必要。
 *     → 認証ガードで未ログインユーザーを弾く必要がある。
 *
 *   もし分離しなかったら:
 *   → ログイン画面でもシフトデータの取得が走り、無駄なAPI呼び出しが発生。
 *   → 認証チェックのロジックが全ページに分散して管理が困難に。
 *
 * ■ この設計パターンの名前: "Authenticated Layout" パターン
 *   多くのフレームワーク（Next.js, Nuxt, Laravel等）で採用されている定番構造。
 *
 * ============================================================
 * 【Provider 階層（ルートレイアウトから連続）】
 * ============================================================
 *
 * AuthProvider（ルートレイアウト）
 *   → SettingsProvider（★ここから: 店舗設定）
 *     → TimeSegmentTypesProvider（時間帯区分）
 *       → StaffRolesProvider（スタッフロール）
 *         → ShiftTaskAssignmentsProvider（シフトタスク割当）
 *           → TodoBadgeProvider（Todoバッジ通知）
 *             → <Slot />（子ページ: master/ または user/）
 *
 * ■ なぜ Provider を入れ子にするのか:
 *   React の Context API は「ツリー上のどこかに Provider があれば、
 *   その子孫ならどこからでもデータにアクセスできる」仕組み。
 *   レイアウトファイルに Provider を置くことで、
 *   各ページコンポーネントで毎回 Provider を書く手間を省ける。
 *
 * 【認証状態の安定化】
 * TOKEN_REFRESHED等で user が一瞬 null になるケースがある。
 * その度に子コンポーネントがアンマウント→再マウントされると
 * 状態がリセットされてUXが悪化する。
 * wasAuthenticated フラグで「一度認証されたらコンテンツを維持する」ことで回避。
 */

import { useRef } from "react";
// Slot: 子ルートのレンダリング位置を示すコンポーネント
import { Slot } from "expo-router";
// useAuth: 認証情報（user, loading等）を取得するフック
import { useAuth } from "@/services/auth/useAuth";
// 各種Context Provider: 子コンポーネントに共通データを提供する
import { SettingsProvider } from "@/common/common-utils/util-settings";
import { TimeSegmentTypesProvider } from "@/common/common-context/TimeSegmentTypesContext";
import { StaffRolesProvider } from "@/common/common-context/StaffRolesContext";
import { ShiftTaskAssignmentsProvider } from "@/common/common-context/ShiftTaskAssignmentsContext";
import { TodoBadgeProvider } from "@/common/common-context/TodoBadgeContext";
import { PendingShiftBadgeProvider } from "@/common/common-context/PendingShiftBadgeContext";

/**
 * MainLayout: メイングループのレイアウトコンポーネント。
 *
 * 認証ガードはルートレイアウトの useRouteGuard で処理されるため、
 * ここでは Provider の管理と認証状態の安定化のみを担当する。
 */
export default function MainLayout() {
  // useAuth: 現在のユーザー情報とロード状態を取得
  const { user, loading } = useAuth();

  /**
   * useRef でフラグを保持: 一度認証されたら true にセット。
   * useRef は再レンダリングを引き起こさないため、パフォーマンスに影響しない。
   */
  const wasAuthenticated = useRef(false);

  // ユーザーが存在する（認証済み）ならフラグをON
  if (user) {
    wasAuthenticated.current = true;
  }

  // 初回ロード中（セッション復元中）は何も表示しない
  if (loading) {
    return null;
  }

  // 一度も認証されていない場合は null を返す。
  // ルートレイアウトの useRouteGuard がログイン画面にリダイレクトする。
  if (!user && !wasAuthenticated.current) {
    return null;
  }

  // Provider を入れ子にして子コンポーネントに共通データを提供する。
  // storeId は user?.storeId で取得し、null の場合は空文字をフォールバック。
  // || は OR演算子で、左辺が falsy（null, undefined, ""等）なら右辺を返す。
  return (
    <SettingsProvider>
      <TimeSegmentTypesProvider storeId={user?.storeId || ""}>
        <StaffRolesProvider storeId={user?.storeId || ""}>
          <ShiftTaskAssignmentsProvider storeId={user?.storeId || ""}>
            <TodoBadgeProvider storeId={user?.storeId || ""} userId={user?.uid}>
              <PendingShiftBadgeProvider storeId={user?.storeId || ""}>
                {/* Slot: /(main)/master/... や /(main)/user/... がここに表示される */}
                <Slot />
              </PendingShiftBadgeProvider>
            </TodoBadgeProvider>
          </ShiftTaskAssignmentsProvider>
        </StaffRolesProvider>
      </TimeSegmentTypesProvider>
    </SettingsProvider>
  );
}
