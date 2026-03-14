/** @file useGanttShiftActions.ts
 *  @description シフトの保存・削除・ステータス更新を行うカスタムフック。
 *    ガントチャートのモーダルから呼ばれるCRUD操作をまとめている。
 */

// 【このファイルの位置づけ】
// - import元: ServiceProvider（Supabaseアクセス）, shiftHistoryLogger（監査ログ）
// - importされる先: GanttChartMonthView（saveShift, deleteShift, updateShiftStatus を使う）
// - 役割: シフトの「追加」「編集」「削除」「ステータス変更」をビジネスロジックとしてまとめる。
//   コンポーネントから DB 操作を切り離して再利用しやすくする「カスタムフック」パターン。

import { useCallback, useRef } from "react";
import {
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
} from "@/common/common-models/ModelIndex";
import { ServiceProvider } from "@/services/ServiceProvider";
import { AuthError } from "@/common/common-errors/AppErrors";
import { createActor } from "@/services/shift-history/shiftHistoryLogger";

// UseGanttShiftActionsProps: このフックに渡すオプション
export interface UseGanttShiftActionsProps {
  user: { uid: string; storeId?: string; nickname?: string; role?: string } | null;
  users?: Array<{ uid: string; color?: string; nickname?: string }>;
  onShiftUpdate?: () => Promise<void> | void;
  refreshPage?: () => void; // 互換性のため残すが使用しない
}

export function useGanttShiftActions({
  user,
  users = [],
  onShiftUpdate,
  refreshPage: _refreshPage,
}: UseGanttShiftActionsProps) {
  // useRef で「保存処理中」フラグを管理。useState と違い、値を変えても再レンダリングされない。
  // ボタン連打で二重保存されるのを防ぐ「排他制御」に使う。
  const savingRef = useRef(false);

  const buildActor = useCallback(() => createActor(user), [user]);

  /** 既存シフトを編集する */
  const updateExistingShift = async (
    editingShift: ShiftItem,
    newShiftData: {
      date: string;
      startTime: string;
      endTime: string;
      userId: string;
      nickname: string;
      status: ShiftStatus;
      classes: ClassTimeSlot[];
    }
  ) => {
    const actor = buildActor();

    // 削除申請中のシフト → 却下に変更
    if (editingShift.status === "deletion_requested") {
      newShiftData.status = "rejected";
    }

    // 却下の場合はそのまま更新して終了
    if (newShiftData.status === "rejected") {
      await ServiceProvider.shifts.updateShift(
        editingShift.id,
        { ...newShiftData, updatedAt: new Date() },
        actor
      );
      return;
    }

    // 承認への変更 → approveShiftChanges を使用
    const isApproving =
      editingShift.status !== newShiftData.status &&
      newShiftData.status === "approved";

    if (isApproving) {
      await ServiceProvider.shifts.approveShiftChanges(editingShift.id, actor);

      // ステータス以外の変更がある場合は追加で更新
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, ...otherChanges } = newShiftData;
      if (Object.keys(otherChanges).length > 0) {
        await ServiceProvider.shifts.updateShift(
          editingShift.id,
          { ...otherChanges, updatedAt: new Date() },
          actor
        );
      }
      return;
    }

    // その他の変更は直接更新
    await ServiceProvider.shifts.updateShift(
      editingShift.id,
      { ...newShiftData, updatedAt: new Date() },
      actor
    );
  };

  /** 新規シフトを作成する */
  const createNewShift = async (
    newShiftData: {
      date: string;
      startTime: string;
      endTime: string;
      userId: string;
      nickname: string;
      status: ShiftStatus;
      classes: ClassTimeSlot[];
    }
  ) => {
    const actor = buildActor();

    if (newShiftData.status === "deleted") {
      newShiftData.status = "deletion_requested";
    }

    await ServiceProvider.shifts.addShift(
      {
        ...newShiftData,
        storeId: user?.storeId || "",
        type: "user" as const,
        isCompleted: false,
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      actor
    );
  };

  // シフト保存（追加・編集の振り分け）
  const saveShift = useCallback(
    async (
      editingShift: ShiftItem | null,
      newShiftData: {
        date: string;
        startTime: string;
        endTime: string;
        userId: string;
        nickname: string;
        status: ShiftStatus;
        classes: ClassTimeSlot[];
      }
    ) => {
      if (savingRef.current) return;
      savingRef.current = true;

      try {
        if (editingShift) {
          await updateExistingShift(editingShift, newShiftData);
        } else {
          await createNewShift(newShiftData);
        }

        // リアルタイムリスナーが自動反映するため、onShiftUpdateはバックグラウンドで実行
        onShiftUpdate?.();
      } finally {
        savingRef.current = false;
      }
    },
    [user, users, onShiftUpdate]
  );

  // シフト削除（ステータスに関わらず完全削除）
  const deleteShift = useCallback(
    async (shift: { id: string; status: string }) => {
      await ServiceProvider.shifts.markShiftAsDeleted(shift.id, buildActor());
      onShiftUpdate?.();
    },
    [user, onShiftUpdate]
  );

  const updateShiftStatus = useCallback(
    async (shiftId: string, status: ShiftStatus) => {
      if (!user) throw new AuthError("ユーザーが未ログインです");

      const actor = buildActor()!;

      if (status === "approved") {
        await ServiceProvider.shifts.approveShiftChanges(shiftId, actor);
      } else {
        await ServiceProvider.shifts.updateShift(shiftId, { status }, actor);
      }

      onShiftUpdate?.();
    },
    [user, onShiftUpdate]
  );

  return {
    saveShift,
    deleteShift,
    updateShiftStatus,
  };
}
