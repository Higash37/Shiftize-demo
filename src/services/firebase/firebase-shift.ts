/**
 * Firebase シフト管理モジュール
 *
 * シフトのCRUD操作と状態管理を提供します。
 */

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  getDoc,
  serverTimestamp,
  where,
  Timestamp,
} from "firebase/firestore";

import { Shift, ShiftItem, ShiftStatus, ShiftType } from "@/common/common-models/ModelIndex";
import { db } from "./firebase-core";
import { ShiftNotificationService, EmailNotificationService } from "@/services/notifications";
import { Platform } from "react-native";
import {
  logShiftChange,
  determineActionType,
  ShiftHistoryActor,
} from "@/services/shift-history/shiftHistoryLogger";

const toDate = (value: unknown): Date => {
  if (!value) {
    return new Date();
  }
  if (value instanceof Date) {
    return value;
  }
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }
  return new Date();
};

const toShiftItem = (id: string, data: Partial<Shift>): ShiftItem => {
  const ensureString = (value?: string | null) => value ?? "";
  const ensureDuration = (value: unknown) => {
    if (value === undefined || value === null) {
      return "";
    }
    return typeof value === "string" ? value : String(value);
  };

  const requestedChanges = (data as any)?.requestedChanges;
  let normalizedRequestedChanges: any = undefined;
  if (Array.isArray(requestedChanges) && requestedChanges.length > 0) {
    normalizedRequestedChanges = requestedChanges[0];
  } else if (requestedChanges && typeof requestedChanges === "object") {
    normalizedRequestedChanges = requestedChanges;
  }

  return {
    id,
    userId: ensureString(data.userId),
    storeId: ensureString(data.storeId),
    nickname: ensureString(data.nickname),
    date: ensureString(data.date),
    startTime: ensureString(data.startTime),
    endTime: ensureString(data.endTime),
    type: (data.type as ShiftType) || "user",
    ...(data.subject !== undefined && { subject: data.subject }),
    ...(data.notes !== undefined && { notes: data.notes }),
    isCompleted: Boolean(
      data.isCompleted ?? ((data.status as ShiftStatus | undefined) === "completed")
    ),
    status: (data.status as ShiftStatus) || "draft",
    duration: ensureDuration(data.duration),
    createdAt: toDate((data as any)?.createdAt),
    updatedAt: toDate((data as any)?.updatedAt),
    ...(data.classes !== undefined && { classes: data.classes }),
    ...(normalizedRequestedChanges !== undefined && { requestedChanges: normalizedRequestedChanges }),
  };
};

const mergeShiftForLogging = (
  id: string,
  prevData: Shift | null | undefined,
  updates: Partial<Shift> | null | undefined
): { prev: ShiftItem | null; next: ShiftItem | null } => {
  const prev = prevData ? toShiftItem(id, prevData) : null;
  if (!updates) {
    return { prev, next: prev };
  }
  const merged: Partial<Shift> = {
    ...(prevData || {}),
    ...updates,
  };
  return {
    prev,
    next: toShiftItem(id, merged),
  };
};

const emitShiftLog = async (
  action: ReturnType<typeof determineActionType>,
  actor: ShiftHistoryActor,
  storeId: string,
  nextShift: ShiftItem | null,
  prevShift: ShiftItem | null,
  metadata?: Record<string, unknown>
) => {
  if (!storeId) {
    return;
  }
  await logShiftChange(action, actor, storeId, nextShift || undefined, prevShift || undefined, metadata);
};

/**
 * シフト関連のサービス
 * シフトのCRUD操作と状態管理を提供します
 */
export const ShiftService = {
  /**
   * シフト一覧を取得します
   */
  getShifts: async (storeId?: string): Promise<Shift[]> => {
    try {
      const shiftsRef = collection(db, "shifts");
      let q;

      // storeIdが指定されている場合はフィルタリング
      if (storeId) {
        q = query(shiftsRef, where("storeId", "==", storeId));
      } else {
        q = query(shiftsRef);
      }

      const querySnapshot = await getDocs(q);

      const shifts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data["userId"] || "",
          storeId: data["storeId"] || "",
          nickname: data["nickname"] || "",
          date: data["date"] || "",
          startTime: data["startTime"] || "",
          endTime: data["endTime"] || "",
          type: data["type"] || "user",
          subject: data["subject"] || "",
          isCompleted: data["isCompleted"] || false,
          status: data["status"] || "draft",
          duration: data["duration"] || "",
          createdAt: data["createdAt"]?.toDate() || new Date(),
          updatedAt: data["updatedAt"]?.toDate() || new Date(),
          classes: data["classes"] || [],
          requestedChanges: data["requestedChanges"] || undefined,
        } as Shift;
      });

      // JavaScriptでソート（Firestoreクエリではなく）
      return shifts.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare === 0) {
          return a.startTime.localeCompare(b.startTime);
        }
        return dateCompare;
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * 新しいシフトを追加します
   */
  addShift: async (shift: Omit<Shift, "id">, actor?: ShiftHistoryActor): Promise<string> => {
    try {
      const shiftsRef = collection(db, "shifts");
      const docRef = await addDoc(shiftsRef, {
        ...shift,
        type: shift.type || "user",
        status: shift.status || "draft", // 渡されたstatusを優先し、なければdraftをデフォルト
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 🔔 通知: 新しいシフト作成
      try {
        const createdShift: Shift = { id: docRef.id, ...shift };
        const creatorNickname = shift.nickname || 'Unknown User';

        if (Platform.OS === 'web') {
          // Web環境: メール通知
          await EmailNotificationService.notifyShiftCreatedByEmail(
            createdShift,
            creatorNickname
          );
        } else {
          // モバイル環境: プッシュ通知
          await ShiftNotificationService.notifyShiftCreated(
            createdShift,
            creatorNickname
          );
        }
      } catch (notificationError) {
      }

      if (actor) {
        const { next } = mergeShiftForLogging(docRef.id, null, {
          ...shift,
          id: docRef.id,
          status: shift.status || "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Shift);
        if (next) {
          const action = determineActionType(null, next, actor);
          await emitShiftLog(action, actor, next.storeId, next, null);
        }
      }

      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 既存のシフトを更新します
   */
  updateShift: async (id: string, shift: Partial<Shift>, actor?: ShiftHistoryActor): Promise<void> => {
    try {
      const shiftRef = doc(db, "shifts", id);
      const previousSnapshot = await getDoc(shiftRef);
      const previousData = previousSnapshot.exists()
        ? (previousSnapshot.data() as Shift)
        : null;

      await updateDoc(shiftRef, {
        ...shift,
        updatedAt: serverTimestamp(),
      });

      if (actor && previousData) {
        const { prev, next } = mergeShiftForLogging(id, previousData, {
          ...shift,
          updatedAt: new Date(),
        } as Shift);
        if (next) {
          const action = determineActionType(prev, next, actor);
          await emitShiftLog(action, actor, next.storeId || prev?.storeId || "", next, prev);
        }
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * シフトを削除します
   */
  markShiftAsDeleted: async (id: string, deletedBy?: ShiftHistoryActor, reason?: string): Promise<void> => {
    try {
      if (__DEV__) {
      }
      
      const shiftRef = doc(db, "shifts", id);
      
      // 🔔 削除前に通知用のシフト情報を取得
      const shiftDoc = await getDoc(shiftRef);
      const shiftData = shiftDoc.data();
      
      if (shiftData && deletedBy) {
        const shift: Shift = { id, ...shiftData } as Shift;
        
        // 通知: シフト削除
        try {
          if (Platform.OS === 'web') {
            // Web環境: メール通知
            await EmailNotificationService.notifyShiftDeletedByEmail(
              shift,
              deletedBy.nickname,
              reason
            );
          } else {
            // モバイル環境: プッシュ通知
            await ShiftNotificationService.notifyShiftDeleted(
              shift,
              deletedBy.nickname,
              reason
            );
          }
        } catch (notificationError) {
          // console.error('Email notification failed:', notificationError);
        }
      }
      
      await deleteDoc(shiftRef);

      if (deletedBy && shiftData) {
        const { prev } = mergeShiftForLogging(id, shiftData as Shift, null);
        if (prev) {
          const action = determineActionType(prev, null, deletedBy);
          await emitShiftLog(action, deletedBy, prev.storeId, null, prev, reason ? { reason } : undefined);
        }
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * シフト変更を承認します
   */
  approveShiftChanges: async (id: string, approver?: ShiftHistoryActor): Promise<void> => {
    try {
      if (__DEV__) {
      }
      
      const shiftRef = doc(db, "shifts", id);
      const shiftDoc = await getDoc(shiftRef);
      const shiftData = shiftDoc.data();

      // pendingからapprovedへの変更、またはrequestedChangesがある場合に通知
      const isPendingToApproved = shiftData?.["status"] === "pending";
      const hasRequestedChanges = shiftData?.["requestedChanges"];

      if (hasRequestedChanges) {
        // requestedChangesがある場合：変更内容を適用
        await updateDoc(shiftRef, {
          ...shiftData["requestedChanges"],
          status: "approved",
          requestedChanges: null,
          updatedAt: serverTimestamp(),
        });
      } else if (isPendingToApproved) {
        // 単純なpending→approved変更の場合
        await updateDoc(shiftRef, {
          status: "approved",
          updatedAt: serverTimestamp(),
        });
      }

      // 🔔 通知: シフト承認（pendingからapprovedまたはrequestedChangesがある場合）
      if ((isPendingToApproved || hasRequestedChanges) && approver) {
        try {
          const shift: Shift = { id, ...shiftData } as Shift;
          
          if (Platform.OS === 'web') {
            // Web環境: メール通知
            await EmailNotificationService.notifyShiftApprovedByEmail(
              shift,
              approver.nickname
            );
          } else {
            // モバイル環境: プッシュ通知
            await ShiftNotificationService.notifyShiftApproved(
              shift,
              approver.nickname,
              shiftData["nickname"] || 'Unknown User'
            );
          }
        } catch (notificationError) {
          // console.error('Approval notification failed:', notificationError);
        }
      }

      if (approver && shiftData && (isPendingToApproved || hasRequestedChanges)) {
        const updates: Partial<Shift> = hasRequestedChanges
          ? {
              ...(shiftData["requestedChanges"] || {}),
              status: "approved",
              requestedChanges: undefined,
              updatedAt: new Date(),
            }
          : {
              status: "approved",
              updatedAt: new Date(),
            };
        const { prev, next } = mergeShiftForLogging(id, shiftData as Shift, updates as Shift);
        if (next) {
          const action = determineActionType(prev, next, approver);
          await emitShiftLog(action, approver, next.storeId || prev?.storeId || "", next, prev);
        }
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * シフトを完了状態にします
   */
  markShiftAsCompleted: async (id: string): Promise<void> => {
    try {
      const shiftRef = doc(db, "shifts", id);
      await updateDoc(shiftRef, {
        status: "completed",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * シフト報告を保存します
   */
  addShiftReport: async (
    shiftId: string,
    reportData: {
      taskCounts: Record<string, { count: number; time: number }>;
      comments: string;
    }
  ) => {
    try {
      const reportsRef = collection(db, "reports");
      await addDoc(reportsRef, {
        shiftId,
        taskCounts: reportData.taskCounts,
        comments: reportData.comments,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * 複数店舗のシフト一覧を取得します（連携店舗対応）
   */
  getShiftsFromMultipleStores: async (storeIds: string[]): Promise<Shift[]> => {
    try {
      if (storeIds.length === 0) {
        return [];
      }

      const shiftsRef = collection(db, "shifts");

      // Firestoreの`in`クエリは最大10個までの制限があるため、バッチで処理
      const allShifts: Shift[] = [];
      const batchSize = 10;

      for (let i = 0; i < storeIds.length; i += batchSize) {
        const batch = storeIds.slice(i, i + batchSize);
        const q = query(shiftsRef, where("storeId", "in", batch));
        const querySnapshot = await getDocs(q);

        const batchShifts = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data["userId"] || "",
            storeId: data["storeId"] || "",
            nickname: data["nickname"] || "",
            date: data["date"] || "",
            startTime: data["startTime"] || "",
            endTime: data["endTime"] || "",
            type: data["type"] || "user",
            subject: data["subject"] || "",
            isCompleted: data["isCompleted"] || false,
            status: data["status"] || "draft",
            duration: data["duration"] || "",
            createdAt: data["createdAt"]?.toDate() || new Date(),
            updatedAt: data["updatedAt"]?.toDate() || new Date(),
            classes: data["classes"] || [],
            requestedChanges: data["requestedChanges"] || undefined,
          } as Shift;
        });

        allShifts.push(...batchShifts);
      }

      // JavaScriptでソート
      return allShifts.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare === 0) {
          return a.startTime.localeCompare(b.startTime);
        }
        return dateCompare;
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザーの連携店舗を含む全シフトを取得します
   */
  getUserAccessibleShifts: async (userData: {
    storeId?: string;
    connectedStores?: string[];
  }): Promise<Shift[]> => {
    try {
      // ユーザーがアクセス可能な店舗IDの配列を作成
      const accessibleStoreIds: string[] = [];

      // 自分の店舗を追加
      if (userData.storeId) {
        accessibleStoreIds.push(userData.storeId);
      }

      // 連携店舗を追加（重複除去）
      if (userData.connectedStores) {
        userData.connectedStores.forEach((storeId) => {
          if (!accessibleStoreIds.includes(storeId)) {
            accessibleStoreIds.push(storeId);
          }
        });
      }

      // 複数店舗のシフトを取得
      return await ShiftService.getShiftsFromMultipleStores(accessibleStoreIds);
    } catch (error) {
      throw error;
    }
  },
};

// エクスポート
export const {
  getShifts,
  addShift,
  updateShift,
  markShiftAsDeleted,
  approveShiftChanges,
  markShiftAsCompleted,
  addShiftReport,
  getShiftsFromMultipleStores,
  getUserAccessibleShifts,
} = ShiftService;
