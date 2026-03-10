/**
 * @file master/gantt-view.tsx
 * @description マスター用ガントチャート閲覧画面（読み取り専用）。
 *
 * 【このファイルの役割】
 * シフトデータとユーザーデータを取得し、GanttViewView（閲覧専用ガントチャート）に渡す。
 * 月の切り替え、日付の生成などの制御ロジックを担当する。
 *
 * 【リアルタイムリスナー】
 * useShiftsRealtime: Supabaseのリアルタイム機能を使い、
 * シフトが追加・更新・削除されると自動的にUIに反映される。
 * そのため handleShiftUpdate は空関数（リスナーが自動更新するため）。
 */

import React from "react";
// ShiftData: ガントチャートで扱うシフトデータの型
import { ShiftData } from "@/modules/master-view/ganttView/gantt-modals/ShiftModal";
// useShiftsRealtime: リアルタイムでシフトを取得・監視するフック
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
// useUsers: ユーザー一覧を取得するフック
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
// GanttViewView: ガントチャート閲覧UIコンポーネント
import { GanttViewView } from "@/modules/master-view/ganttView/GanttViewView";

/**
 * GanttViewScreen: ガントチャート閲覧画面。
 */
export default function GanttViewScreen() {
  const { user } = useAuth();
  // useShiftsRealtime: 店舗IDを指定してシフトをリアルタイム取得
  // shifts: シフト配列、fetchShiftsByMonth: 手動で月を指定して取得
  const { shifts, fetchShiftsByMonth } = useShiftsRealtime(user?.storeId);
  // useUsers: 店舗のユーザー一覧を取得
  const { users } = useUsers(user?.storeId);

  // 現在表示中の年月を state で管理
  // useState の初期値にコールバック関数を渡すと、初回レンダリング時にだけ実行される
  const [currentYearMonth, setCurrentYearMonth] = React.useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
    // getMonth() は 0始まり（0=1月, 11=12月）
  });

  /**
   * generateDaysForMonth: 指定月の全日付を "YYYY-MM-DD" 形式の配列で生成する。
   *
   * @param year - 年
   * @param month - 月（0始まり）
   * @returns string[] - 日付文字列の配列（例: ["2025-03-01", "2025-03-02", ...]）
   */
  const generateDaysForMonth = (year: number, month: number) => {
    // new Date(year, month + 1, 0) で「翌月の0日 = 当月の末日」を取得
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Array.from: 指定長さの配列を生成。第2引数のコールバックで各要素を初期化
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      // ローカルタイムゾーンでの日付文字列を生成（UTC変換を避ける）
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");  // 1桁なら先頭に0
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    });

    return days;
  };

  // 現在の年月から日付配列を生成
  const days = generateDaysForMonth(
    currentYearMonth.year,
    currentYearMonth.month
  );

  /**
   * handleMonthChange: 月が変更された時のハンドラー。
   * state を更新し、新しい月のシフトデータを取得する。
   */
  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    fetchShiftsByMonth(year, month);
  };

  /** handleShiftUpdate: リアルタイムリスナーで自動更新されるため、空関数 */
  const handleShiftUpdate = async () => {};

  /** handleShiftPress: シフトタップ時のハンドラー。閲覧専用のため何もしない */
  const handleShiftPress = (shift: ShiftData) => {
    void shift;  // void: 未使用変数のTypeScript警告を抑制
  };

  return (
    <GanttViewView
      shifts={shifts}
      // users を { uid, nickname, color } の形に変換して渡す
      users={users.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        color: user.color || '#000000',  // 色未設定なら黒
      }))}
      days={days}
      currentYearMonth={currentYearMonth}
      onMonthChange={handleMonthChange}
      onShiftUpdate={handleShiftUpdate}
      onShiftPress={handleShiftPress}
    />
  );
}
