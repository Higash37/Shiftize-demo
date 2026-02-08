import { useCallback, useRef } from "react";
import {
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
} from "@/common/common-models/ModelIndex";
import { ServiceProvider } from "@/services/ServiceProvider";

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
  refreshPage,
}: UseGanttShiftActionsProps) {
  // 保存処理中のフラグ（重複防止）
  const savingRef = useRef(false);

  // シフト保存（追加・編集）
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
      // 既に保存処理中の場合はスキップ
      if (savingRef.current) {
        return;
      }
      
      savingRef.current = true;
      
      try {
        const actor = user ? {
          userId: user.uid,
          nickname: user.nickname || "教室長",
          role: ((user.role as "master" | "teacher") || "master") as "master" | "teacher",
        } : undefined;

        if (editingShift) {
        if (editingShift?.status === "deletion_requested") {
          newShiftData.status = "rejected"; // 削除申請中のシフトを却下状態に変更
        }
        // Master が直接却下にする場合の処理
        if (newShiftData.status === "rejected") {
          await ServiceProvider.shifts.updateShift(
            editingShift.id,
            { ...newShiftData, updatedAt: new Date() },
            actor
          );
          return;
        }

        // 編集時にもユーザーカラー情報を更新する
        const selectedUserId = newShiftData.userId;
        let userColor;
        try {
          const selectedUser = users.find((u) => u.uid === selectedUserId);
          if (selectedUser && selectedUser.color) {
            userColor = selectedUser.color;
          }
        } catch (error) {
        }

        // ステータス変更の場合は通知機能を使用
        if (editingShift.status !== newShiftData.status && newShiftData.status === "approved") {
          await ServiceProvider.shifts.approveShiftChanges(editingShift.id, actor);

          // ステータス以外の変更がある場合は追加で更新
          const { status, ...otherChanges } = newShiftData;
          if (Object.keys(otherChanges).length > 0) {
            await ServiceProvider.shifts.updateShift(
              editingShift.id,
              { ...otherChanges, updatedAt: new Date() },
              actor
            );
          }
        } else {
          // その他の変更は直接更新
          await ServiceProvider.shifts.updateShift(
            editingShift.id,
            { ...newShiftData, updatedAt: new Date() },
            actor
          );
        }
      } else {
        if (newShiftData.status === "deleted") {
          newShiftData.status = "deletion_requested";
        }

        const selectedUserId = newShiftData.userId;

        await ServiceProvider.shifts.addShift(
          {
            ...newShiftData,
            storeId: user?.storeId || "",
            userId: selectedUserId,
            nickname: newShiftData.nickname,
            type: "user" as const,
            isCompleted: false,
            duration: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          actor
        );
        }
      } finally {
        // 処理完了後にフラグをリセット
        setTimeout(() => {
          savingRef.current = false;
        }, 500); // 500msのデバウンス
      }
    },
    [user, users, refreshPage]
  );

  // シフト削除
  const deleteShift = useCallback(
    async (shift: { id: string; status: string }) => {
      const actor = user ? {
        userId: user.uid,
        nickname: user.nickname || "教室長",
        role: ((user.role as "master" | "teacher") || "master") as "master" | "teacher",
      } : undefined;

      if (shift.status === "approved") {
        // マスターが承認済みシフトを削除する場合はステータス変更
        await ServiceProvider.shifts.updateShift(
          shift.id,
          { status: "deleted" as ShiftStatus, updatedAt: new Date() },
          actor
        );
      } else {
        // その他は完全削除
        await ServiceProvider.shifts.markShiftAsDeleted(shift.id, actor);
      }
    },
    [refreshPage, user]
  );

  const updateShiftStatus = useCallback(
    async (shiftId: string, status: ShiftStatus) => {
      if (!user) throw new Error("ユーザーが未ログインです");

      const actor = {
        userId: user.uid,
        nickname: user.nickname || "教室長",
        role: ((user.role as "master" | "teacher") || "master") as "master" | "teacher",
      };

      if (status === "approved") {
        await ServiceProvider.shifts.approveShiftChanges(shiftId, actor);
      } else {
        await ServiceProvider.shifts.updateShift(shiftId, { status }, actor);
      }
    },
    [user, refreshPage]
  );

  return {
    saveShift,
    deleteShift,
    updateShiftStatus,
  };
}
