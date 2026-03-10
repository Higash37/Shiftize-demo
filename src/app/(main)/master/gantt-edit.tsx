/**
 * @file master/gantt-edit.tsx
 * @description マスター用ガントチャート編集画面（シフトの追加・変更・削除が可能）。
 *
 * 【gantt-view.tsx との違い】
 * - gantt-view: 閲覧専用。シフトの表示のみ
 * - gantt-edit: ★このファイル。シフトの追加・更新・削除・ドラッグによる時間変更が可能
 *
 * 【初期月の設定】
 * 翌月を初期表示にしている（来月のシフトを編集する用途が多いため）。
 *
 * 【ServiceProvider パターン】
 * ServiceProvider.shifts.updateShift() のように、サービスレイヤー経由でDB操作を行う。
 * 画面コンポーネントがSupabaseを直接呼ぶのではなく、サービスを経由することで
 * テスタビリティと保守性を確保する。
 */

import React, { useMemo } from "react";
// useShiftsByMonth: 指定月のシフトをリアルタイムで取得するフック
import { useShiftsByMonth } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
// ServiceProvider: 各サービスのシングルトンアクセサ
import { ServiceProvider } from "@/services/ServiceProvider";
// GanttEditView: ガントチャート編集UIコンポーネント
import { GanttEditView } from "@/modules/master-view/ganttEdit/GanttEditView";
import { ShiftData } from "@/modules/master-view/ganttView/gantt-modals/ShiftModal";
import { Alert } from "react-native";
// calculateDurationHours: 開始・終了時刻から勤務時間を計算する関数
import { calculateDurationHours } from "@/common/common-utils/util-shift/wageCalculator";

// 初期表示月を翌月に設定
const INITIAL_DATE = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
const INITIAL_YEAR = INITIAL_DATE.getFullYear();
const INITIAL_MONTH = INITIAL_DATE.getMonth();

/**
 * GanttEditScreen: ガントチャート編集画面。
 * シフトの追加・更新・削除・ドラッグ操作を提供する。
 */
export default function GanttEditScreen() {
  const { user } = useAuth();
  const [currentYearMonth, setCurrentYearMonth] = React.useState({
    year: INITIAL_YEAR,
    month: INITIAL_MONTH,
  });

  // useShiftsByMonth: 指定月のシフトデータを取得
  // changeMonth: 表示月を変更、refetch: データを再取得
  const {
    shifts,
    changeMonth,
    refetch,
    loading: shiftsLoading,
    error: shiftsError,
  } = useShiftsByMonth(user?.storeId, currentYearMonth.year, currentYearMonth.month);

  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useUsers(user?.storeId);

  /** 月変更ハンドラー */
  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    changeMonth(year, month);
  };

  /** シフト更新後のリフレッシュ */
  const handleShiftUpdate = async () => {
    await refetch();
  };

  /** リフレッシュページ（リアルタイムリスナーで自動更新されるためダミー） */
  const refreshPage = () => {};

  /**
   * handleTimeChange: ガントチャート上でシフトをドラッグして時間を変更した時のハンドラー。
   *
   * @param shiftId - 変更対象のシフトID
   * @param newStartTime - 新しい開始時刻（例: "09:00"）
   * @param newEndTime - 新しい終了時刻（例: "17:00"）
   */
  const handleTimeChange = async (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    try {
      // 新しい時間から勤務時間（小数の時間数）を計算
      const durationHours = calculateDurationHours(newStartTime, newEndTime);

      // ServiceProvider 経由でDB更新
      await ServiceProvider.shifts.updateShift(shiftId, {
        startTime: newStartTime,
        endTime: newEndTime,
        duration: durationHours,
      });
      // リアルタイムリスナーが自動的にUIを更新する
    } catch (error) {
      console.error("Failed to save shift", error);
      console.error("Failed to update shift time", error);
      // Alert.alert: React Native のアラートダイアログ
      Alert.alert("エラー", "シフト時間の変更に失敗しました");
    }
  };

  /** シフトタップ時（現在は何もしない） */
  const handleShiftPress = (shift: ShiftData) => {
    void shift;
  };

  /**
   * handleShiftSave: シフトの保存（新規作成 or 更新）ハンドラー。
   *
   * @param data - 保存するシフトデータ
   * @throws Error - 保存失敗時
   */
  const handleShiftSave = async (data: ShiftData) => {
    try {
      if (data.id) {
        // --- 既存シフトの更新 ---
        const durationHours = calculateDurationHours(data.startTime, data.endTime);

        await ServiceProvider.shifts.updateShift(data.id, {
          userId: data.userId,
          storeId: user?.storeId || "",
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: "user",
          subject: data.subject || "",
          isCompleted: false,
          duration: durationHours,
          status: data.status || "approved",  // マスターによる編集は承認済み
          classes: data.classes || [],
        });
      } else {
        // --- 新規シフトの作成 ---
        // 対象ユーザーの情報を取得（ニックネーム設定用）
        const targetUser = users.find((u) => u.uid === data.userId);
        const durationHours = calculateDurationHours(data.startTime, data.endTime);

        await ServiceProvider.shifts.addShift({
          userId: data.userId,
          storeId: user?.storeId || "",
          nickname: targetUser?.nickname || "",
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: "user",
          subject: data.subject || "",
          isCompleted: false,
          status: "approved",  // マスターによる新規作成は常に承認済み
          duration: durationHours,
          classes: data.classes || [],
        });
      }
    } catch (error) {
      console.error("Failed to delete shift", error);
      Alert.alert("エラー", "シフトの保存に失敗しました");
      throw error;  // 呼び出し元にもエラーを伝播
    }
  };

  /**
   * handleShiftDelete: シフトの削除ハンドラー。
   * 物理削除ではなく論理削除（markShiftAsDeleted）を行う。
   *
   * @param shiftId - 削除するシフトのID
   */
  const handleShiftDelete = async (shiftId: string) => {
    try {
      // markShiftAsDeleted: statusを"deleted"に更新する論理削除
      await ServiceProvider.shifts.markShiftAsDeleted(shiftId);
    } catch (error) {
      Alert.alert("エラー", "シフトの削除に失敗しました");
      throw error;
    }
  };

  // useMemo: currentYearMonth が変わった時だけ日付配列を再生成
  const days = useMemo(() => {
    const { year, month } = currentYearMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    });
  }, [currentYearMonth]);

  return (
    <GanttEditView
      shifts={shifts}
      users={users.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        color: user.color || '#000000',
      }))}
      days={days}
      loading={shiftsLoading || usersLoading}
      // エラーメッセージの取得: Error オブジェクトか文字列かを判定
      error={
        (shiftsError
          ? typeof shiftsError === "string"
            ? shiftsError
            : shiftsError?.message
          : null) ||
        (usersError
          ? typeof usersError === "string"
            ? usersError
            : usersError?.message
          : null)
      }
      currentYearMonth={currentYearMonth}
      onMonthChange={handleMonthChange}
      onShiftUpdate={handleShiftUpdate}
      onShiftPress={handleShiftPress}
      onShiftSave={handleShiftSave}
      onShiftDelete={handleShiftDelete}
      onTimeChange={handleTimeChange}
      refreshPage={refreshPage}
    />
  );
}
