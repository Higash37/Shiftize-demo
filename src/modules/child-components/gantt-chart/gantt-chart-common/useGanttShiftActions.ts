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
          console.log("シフト却下完了、ページをリフレッシュ中...");
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
            console.log(
              "編集時にユーザー色を更新:",
              userColor,
              "ユーザー:",
              selectedUser.nickname
            );
          }
        } catch (error) {
          console.error("ユーザー情報取得エラー:", error);
        }

        await updateDoc(doc(db, "shifts", editingShift.id), {
          ...newShiftData,
          userColor: userColor || "#4A90E2", // ユーザーカラー情報も更新
          updatedAt: serverTimestamp(),
        });
      } else {
        if (newShiftData.status === "deleted") {
          newShiftData.status = "deletion_requested"; // 削除申請中に変更
        }

        // 選択されたユーザーIDを取得（優先的に選択されたユーザーIDを使用）
        const selectedUserId = newShiftData.userId;

        console.log("新規シフト追加 - 選択ユーザーID:", selectedUserId);
        console.log("新規シフト追加 - 現在のユーザーID:", user?.uid);

        // ユーザーカラーを取得
        let userColor;
        try {
          // ユーザーリストから色情報を探す
          const selectedUser = users.find((u) => u.uid === selectedUserId);
          if (selectedUser && selectedUser.color) {
            userColor = selectedUser.color;
            console.log(
              "ユーザー色を取得:",
              userColor,
              "ユーザー:",
              selectedUser.nickname
            );
          }
        } catch (error) {
          console.error("ユーザー情報取得エラー:", error);
        }

        console.log("ユーザーリスト:", users);
        if (!selectedUserId) {
          console.error("選択されたユーザーIDが存在しません。");
        } else {
          const selectedUser = users.find((u) => u.uid === selectedUserId);
          if (!selectedUser) {
            console.error("選択されたユーザーがユーザーリストに存在しません。");
          } else {
            console.log(
              "選択されたユーザーのニックネーム:",
              selectedUser.nickname
            );
          }
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
      console.log("シフト保存完了、ページをリフレッシュ中...");
      if (refreshPage) {
        refreshPage();
      }
    },
    [user, users, refreshPage]
  );

  // シフト削除
  const deleteShift = useCallback(
    async (shift: { id: string; status: string }) => {
      // ステータスに応じて仕様通りに分岐
      if (shift.status === "deleted") {
        // 物理削除
        await deleteDoc(doc(db, "shifts", shift.id));
      } else if (shift.status === "pending" || shift.status === "rejected") {
        // 直接削除
        await updateDoc(doc(db, "shifts", shift.id), {
          status: "deleted",
          updatedAt: serverTimestamp(),
        });
      } else if (shift.status === "approved") {
        // 削除申請
        await updateDoc(doc(db, "shifts", shift.id), {
          status: "deletion_requested",
          updatedAt: serverTimestamp(),
        });
      } else if (shift.status === "deletion_requested") {
        // マスターによる承認で完全削除
        await updateDoc(doc(db, "shifts", shift.id), {
          status: "deleted",
          updatedAt: serverTimestamp(),
        });
      }
      console.log("シフト削除完了、ページをリフレッシュ中...");
      if (refreshPage) {
        refreshPage();
      }
    },
    [refreshPage]
  );

  const updateShiftStatus = useCallback(
    async (shiftId: string, status: ShiftStatus) => {
      if (!user) throw new Error("ユーザーが未ログインです");

      const shiftRef = doc(db, "shifts", shiftId);
      console.log(`Updating shift ${shiftId} to status ${status}`); // デバッグ用ログ
      await updateDoc(shiftRef, { status });

      console.log(
        `シフトステータス更新完了 (${status})、ページをリフレッシュ中...`
      );
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
