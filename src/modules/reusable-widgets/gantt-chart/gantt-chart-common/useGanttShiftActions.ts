import { useCallback, useRef } from "react";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import {
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
} from "@/common/common-models/ModelIndex";
import { ShiftService } from "@/services/firebase/firebase-shift";
import { logShiftChange, determineActionType } from "@/services/shift-history/shiftHistoryLogger";

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
        extendedTasks?: any[]; // 拡張タスク配列を追加
      }
    ) => {
      // 既に保存処理中の場合はスキップ
      if (savingRef.current) {
        return;
      }
      
      savingRef.current = true;
      
      try {
        // 変更前のシフトデータを取得（ログ用）
        let prevShiftData: ShiftItem | null = null;
        if (editingShift) {
          const shiftDoc = await getDoc(doc(db, "shifts", editingShift.id));
          if (shiftDoc.exists()) {
            prevShiftData = { id: shiftDoc.id, ...shiftDoc.data() } as ShiftItem;
          }
        }
        
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
          // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
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
            userId: user?.uid || "",
            nickname: (user as any)?.nickname || "������",
            role: ((user?.role as "master" | "teacher") || "master")
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
          
          // 変更ログを記録
          if (user && user.storeId) {
            const nextShiftData: ShiftItem = { ...editingShift, ...newShiftData };
            const actionType = determineActionType(prevShiftData, nextShiftData, {
              userId: user.uid,
              nickname: user.nickname || "教室長",
              role: (user.role as "master" | "teacher") || "master"
            });
            
            await logShiftChange(
              actionType,
              {
                userId: user.uid,
                nickname: user.nickname || "教室長",
                role: (user.role as "master" | "teacher") || "master"
              },
              user.storeId,
              nextShiftData,
              prevShiftData
            );
          }
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

        const docRef = await addDoc(collection(db, "shifts"), {
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
        
        // 新規作成ログを記録
        if (user && user.storeId) {
          const nextShiftData: ShiftItem = {
            id: docRef.id,
            ...newShiftData,
            storeId: user.storeId,
            type: "user" as const,
            isCompleted: false,
            duration: "0", // 将来的に計算される
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await logShiftChange(
            user.role === "teacher" ? "teacher_create" : "create",
            {
              userId: user.uid,
              nickname: user.nickname || "教室長",
              role: (user.role as "master" | "teacher") || "master"
            },
            user.storeId,
            nextShiftData,
            null
          );
        }
        }
        // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
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
      // 削除前のシフトデータを取得（ログ用）
      let prevShiftData: ShiftItem | null = null;
      try {
        const shiftDoc = await getDoc(doc(db, "shifts", shift.id));
        if (shiftDoc.exists()) {
          prevShiftData = { id: shiftDoc.id, ...shiftDoc.data() } as ShiftItem;
        }
      } catch (error) {
        // エラーを無視
      }
      
      try {
        // 直接Firebase操作で削除
        const deletedBy = user ? { nickname: (user as any).nickname, userId: user.uid } : undefined;
        
        // ステータスに応じて処理分岐
        if (shift.status === "deleted") {
          await deleteDoc(doc(db, "shifts", shift.id));
        } else if (shift.status === "pending" || shift.status === "rejected") {
          await deleteDoc(doc(db, "shifts", shift.id));
        } else if (shift.status === "approved") {
          // マスターが承認済みシフトを削除する場合
          await updateDoc(doc(db, "shifts", shift.id), {
            status: "deleted",
            deletedAt: serverTimestamp(),
            deletedBy,
          });
        } else if (shift.status === "deletion_requested") {
          await deleteDoc(doc(db, "shifts", shift.id));
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
      
      // 削除ログを記録
      if (user && user.storeId && prevShiftData) {
        await logShiftChange(
          "delete",
          {
            userId: user.uid,
            nickname: user.nickname || "教室長",
            role: (user.role as "master" | "teacher") || "master"
          },
          user.storeId,
          null,
          prevShiftData
        );
      }
      
      // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
    },
    [refreshPage, user]
  );

  const updateShiftStatus = useCallback(
    async (shiftId: string, status: ShiftStatus) => {
      if (!user) throw new Error("ユーザーが未ログインです");

      // 承認の場合は通知機能付きのapproveShiftChanges関数を使用
      if (status === "approved") {
        await ShiftService.approveShiftChanges(shiftId, {
          userId: user.uid,
          nickname: (user as any)?.nickname || "������",
          role: ((user?.role as "master" | "teacher") || "master")
        });
      } else {
        // その他のステータス変更は直接更新
        const shiftRef = doc(db, "shifts", shiftId);
        await updateDoc(shiftRef, { status });
      }

      // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
    },
    [user, refreshPage]
  );

  return {
    saveShift,
    deleteShift,
    updateShiftStatus,
  };
}
