import { useCallback } from "react";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import {
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
} from "@/common/common-models/ModelIndex";
import { ShiftService } from "@/services/firebase/firebase-shift";

export interface UseGanttShiftActionsProps {
  user: { uid: string; storeId?: string } | null;
  users?: Array<{ uid: string; color?: string; nickname?: string }>;
  onShiftUpdate?: () => Promise<void> | void;
  refreshPage?: () => void;
}

export function useGanttShiftActions({
  user,
  users = [],
  onShiftUpdate,
  refreshPage,
}: UseGanttShiftActionsProps) {
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
        extendedTasks?: any[]; // 拡張タスク配列を追加
      }
    ) => {
      if (editingShift) {
        if (editingShift?.status === "deletion_requested") {
          newShiftData.status = "rejected"; // 削除申請中のシフトを却下状態に変更
        }
        // Master が直接却下にする場合の処理
        if (newShiftData.status === "rejected") {
          await updateDoc(doc(db, "shifts", editingShift.id), {
            ...newShiftData,
            updatedAt: serverTimestamp(),
          });
          if (refreshPage) {
            refreshPage();
          }
          return;
        }

        // 編集時にもユーザーカラー情報を更新する
        const selectedUserId = newShiftData.userId;
        let userColor;
        try {
          // ユーザーリストから色情報を探す
          const selectedUser = users.find((u) => u.uid === selectedUserId);
          if (selectedUser && selectedUser.color) {
            userColor = selectedUser.color;
          }
        } catch (error) {
        }

        // ステータス変更の場合は通知機能を使用
        if (editingShift.status !== newShiftData.status && newShiftData.status === "approved") {
          // 承認の場合は通知機能付きのapproveShiftChanges関数を使用
          await ShiftService.approveShiftChanges(editingShift.id, {
            nickname: (user as any)?.nickname || "教室長",
            userId: user?.uid || ""
          });
          
          // ステータス以外の変更がある場合は追加で更新
          const { status, ...otherChanges } = newShiftData;
          if (Object.keys(otherChanges).length > 0) {
            await updateDoc(doc(db, "shifts", editingShift.id), {
              ...otherChanges,
              userColor: userColor || "#4A90E2",
              updatedAt: serverTimestamp(),
            });
          }
        } else {
          // その他の変更は直接更新
          await updateDoc(doc(db, "shifts", editingShift.id), {
            ...newShiftData,
            userColor: userColor || "#4A90E2", // ユーザーカラー情報も更新
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        if (newShiftData.status === "deleted") {
          newShiftData.status = "deletion_requested"; // 削除申請中に変更
        }

        // 選択されたユーザーIDを取得（優先的に選択されたユーザーIDを使用）
        const selectedUserId = newShiftData.userId;

        // ユーザーカラーを取得
        let userColor;
        try {
          // ユーザーリストから色情報を探す
          const selectedUser = users.find((u) => u.uid === selectedUserId);
          if (selectedUser && selectedUser.color) {
            userColor = selectedUser.color;
          }
        } catch (error) {
        }

        await addDoc(collection(db, "shifts"), {
          ...newShiftData,
          storeId: user?.storeId || "",
          status: newShiftData.status, // newShiftData.statusを尊重
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // 選択されたユーザーIDを使用
          userId: selectedUserId,
          // ユーザーの色情報を保存
          userColor: userColor || "#4A90E2", // デフォルト青色
        });
      }
      if (refreshPage) {
        refreshPage();
      }
    },
    [user, users, refreshPage]
  );

  // シフト削除
  const deleteShift = useCallback(
    async (shift: { id: string; status: string }) => {
      
      try {
        // 通知付き削除を使用
        const { ShiftAPIService } = await import("@/services/api/ShiftAPIService");
        const deletedBy = user ? { nickname: (user as any).nickname, userId: user.uid } : undefined;
        
        // ステータスに応じて仕様通りに分岐
        if (shift.status === "deleted") {
          await ShiftAPIService.deleteShift(shift.id, deletedBy);
        } else if (shift.status === "pending" || shift.status === "rejected") {
          await ShiftAPIService.deleteShift(shift.id, deletedBy);
        } else if (shift.status === "approved") {
          // マスターが承認済みシフトを削除する場合は直接削除（通知付き）
          await ShiftAPIService.deleteShift(shift.id, deletedBy);
        } else if (shift.status === "deletion_requested") {
          await ShiftAPIService.deleteShift(shift.id, deletedBy);
        }
      } catch (error) {
        // フォールバック: 直接Firebase操作
        if (shift.status === "deleted") {
          await deleteDoc(doc(db, "shifts", shift.id));
        } else {
          await updateDoc(doc(db, "shifts", shift.id), {
            status: "deleted",
            updatedAt: serverTimestamp(),
          });
        }
      }
      
      if (refreshPage) {
        refreshPage();
      }
    },
    [refreshPage, user]
  );

  const updateShiftStatus = useCallback(
    async (shiftId: string, status: ShiftStatus) => {
      if (!user) throw new Error("ユーザーが未ログインです");

      // 承認の場合は通知機能付きのapproveShiftChanges関数を使用
      if (status === "approved") {
        await ShiftService.approveShiftChanges(shiftId, {
          nickname: (user as any).nickname || "教室長",
          userId: user.uid
        });
      } else {
        // その他のステータス変更は直接更新
        const shiftRef = doc(db, "shifts", shiftId);
        await updateDoc(shiftRef, { status });
      }

      if (refreshPage) {
        refreshPage();
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
