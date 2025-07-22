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
  orderBy,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";
import { db } from "./firebase-core";

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
          userId: data.userId || "",
          storeId: data.storeId || "",
          nickname: data.nickname || "",
          date: data.date || "",
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          type: data.type || "user",
          subject: data.subject || "",
          isCompleted: data.isCompleted || false,
          status: data.status || "draft",
          duration: data.duration || "",
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          classes: data.classes || [],
          extendedTasks: data.extendedTasks || [],
          requestedChanges: data.requestedChanges || undefined,
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
  addShift: async (shift: Omit<Shift, "id">): Promise<string> => {
    try {
      const shiftsRef = collection(db, "shifts");
      const docRef = await addDoc(shiftsRef, {
        ...shift,
        type: shift.type || "user",
        status: shift.status || "draft", // 渡されたstatusを優先し、なければdraftをデフォルト
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 既存のシフトを更新します
   */
  updateShift: async (id: string, shift: Partial<Shift>): Promise<void> => {
    try {
      const shiftRef = doc(db, "shifts", id);
      await updateDoc(shiftRef, {
        ...shift,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * シフトを削除します
   */
  markShiftAsDeleted: async (id: string): Promise<void> => {
    try {
      const shiftRef = doc(db, "shifts", id);
      await deleteDoc(shiftRef);
    } catch (error) {
      throw error;
    }
  },

  /**
   * シフト変更を承認します
   */
  approveShiftChanges: async (id: string): Promise<void> => {
    try {
      const shiftRef = doc(db, "shifts", id);
      const shiftDoc = await getDoc(shiftRef);
      const shiftData = shiftDoc.data();

      if (shiftData?.requestedChanges) {
        await updateDoc(shiftRef, {
          ...shiftData.requestedChanges,
          status: "approved",
          requestedChanges: null,
          updatedAt: serverTimestamp(),
        });
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
   * シフトデータにタスク回数とコメントを追加します
   */
  updateShiftWithTasks: async (
    id: string,
    tasks: { [key: string]: { count: number; time: number } },
    comments: string
  ): Promise<void> => {
    try {
      const shiftRef = doc(db, "shifts", id);
      await updateDoc(shiftRef, {
        tasks,
        comments,
        status: "completed", // ステータスを完了に更新
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
            userId: data.userId || "",
            storeId: data.storeId || "",
            nickname: data.nickname || "",
            date: data.date || "",
            startTime: data.startTime || "",
            endTime: data.endTime || "",
            type: data.type || "user",
            subject: data.subject || "",
            isCompleted: data.isCompleted || false,
            status: data.status || "draft",
            duration: data.duration || "",
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            classes: data.classes || [],
            extendedTasks: data.extendedTasks || [],
            requestedChanges: data.requestedChanges || undefined,
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
  updateShiftWithTasks,
  addShiftReport,
  getShiftsFromMultipleStores,
  getUserAccessibleShifts,
} = ShiftService;
