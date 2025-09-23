/**
 * シフト希望管理サービス
 * 
 * シフト希望登録期間の管理とユーザーのシフト希望提出を処理します。
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
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase-core";

// 型定義
export interface ShiftSubmissionPeriod {
  id: string;
  storeId: string;
  startDate: Date;
  endDate: Date;
  targetMonth: string; // "2025-02"
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface ShiftRequest {
  date: string; // "2025-02-01"
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  priority: 'high' | 'medium' | 'low';
  note?: string;
}

export interface ShiftSubmission {
  id: string;
  periodId: string;
  userId: string;
  storeId: string;
  requests: ShiftRequest[];
  status: 'draft' | 'submitted';
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * シフト希望管理サービス
 */
export const ShiftSubmissionService = {
  /**
   * アクティブなシフト希望登録期間を取得
   */
  getActivePeriods: async (storeId: string): Promise<ShiftSubmissionPeriod[]> => {
    try {
      const periodsRef = collection(db, "shift_submission_periods");
      const q = query(
        periodsRef,
        where("storeId", "==", storeId),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          storeId: data['storeId'],
          startDate: data['startDate']?.toDate() || new Date(),
          endDate: data['endDate']?.toDate() || new Date(),
          targetMonth: data['targetMonth'],
          isActive: data['isActive'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
        };
      });
    } catch (error) {
      // Silent error handling for getting active periods
      throw error;
    }
  },

  /**
   * 全ての期間を取得（有効・無効問わず）
   */
  getAllPeriods: async (storeId: string): Promise<ShiftSubmissionPeriod[]> => {
    try {
      const periodsRef = collection(db, "shift_submission_periods");
      const q = query(
        periodsRef,
        where("storeId", "==", storeId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          storeId: data['storeId'],
          startDate: data['startDate']?.toDate() || new Date(),
          endDate: data['endDate']?.toDate() || new Date(),
          targetMonth: data['targetMonth'],
          isActive: data['isActive'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
        };
      });
    } catch (error) {
      // Silent error handling for getting all periods
      throw error;
    }
  },

  /**
   * 特定の期間のシフト希望登録期間を取得
   */
  getPeriod: async (periodId: string): Promise<ShiftSubmissionPeriod | null> => {
    try {
      const periodRef = doc(db, "shift_submission_periods", periodId);
      const periodSnap = await getDoc(periodRef);
      
      if (!periodSnap.exists()) {
        return null;
      }
      
      const data = periodSnap.data();
      return {
        id: periodSnap.id,
        storeId: data['storeId'],
        startDate: data['startDate']?.toDate() || new Date(),
        endDate: data['endDate']?.toDate() || new Date(),
        targetMonth: data['targetMonth'],
        isActive: data['isActive'],
        createdAt: data['createdAt']?.toDate() || new Date(),
        createdBy: data['createdBy'],
      };
    } catch (error) {
      // Silent error handling for getting period
      throw error;
    }
  },

  /**
   * ユーザーのシフト希望を取得
   */
  getUserSubmission: async (periodId: string, userId: string): Promise<ShiftSubmission | null> => {
    try {
      const submissionsRef = collection(db, "shift_submissions");
      const q = query(
        submissionsRef,
        where("periodId", "==", periodId),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      if (!doc) {
        return null;
      }
      
      const data = doc.data();
      
      return {
        id: doc.id,
        periodId: data['periodId'],
        userId: data['userId'],
        storeId: data['storeId'],
        requests: data['requests'] || [],
        status: data['status'],
        submittedAt: data['submittedAt']?.toDate(),
        createdAt: data['createdAt']?.toDate() || new Date(),
        updatedAt: data['updatedAt']?.toDate() || new Date(),
      };
    } catch (error) {
      // Silent error handling for getting user submission
      throw error;
    }
  },

  /**
   * シフト希望を保存（下書き）
   */
  saveSubmission: async (
    periodId: string,
    userId: string,
    storeId: string,
    requests: ShiftRequest[]
  ): Promise<void> => {
    try {
      // 既存の提出があるかチェック
      const existing = await ShiftSubmissionService.getUserSubmission(periodId, userId);
      
      if (existing) {
        // 更新
        const submissionRef = doc(db, "shift_submissions", existing.id);
        await updateDoc(submissionRef, {
          requests,
          updatedAt: serverTimestamp(),
        });
      } else {
        // 新規作成
        const submissionsRef = collection(db, "shift_submissions");
        await addDoc(submissionsRef, {
          periodId,
          userId,
          storeId,
          requests,
          status: 'draft',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      // Silent error handling for saving submission
      throw error;
    }
  },

  /**
   * シフト希望を提出
   */
  submitShiftRequests: async (periodId: string, userId: string): Promise<void> => {
    try {
      const submission = await ShiftSubmissionService.getUserSubmission(periodId, userId);
      
      if (!submission) {
        throw new Error("提出するシフト希望が見つかりません");
      }
      
      const submissionRef = doc(db, "shift_submissions", submission.id);
      await updateDoc(submissionRef, {
        status: 'submitted',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      // Silent error handling for submitting shift requests
      throw error;
    }
  },

  /**
   * アクティブな期間をリアルタイム監視
   */
  subscribeToActivePeriods: (
    storeId: string,
    callback: (periods: ShiftSubmissionPeriod[]) => void
  ) => {
    const periodsRef = collection(db, "shift_submission_periods");
    const q = query(
      periodsRef,
      where("storeId", "==", storeId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (querySnapshot) => {
      const periods = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          storeId: data['storeId'],
          startDate: data['startDate']?.toDate() || new Date(),
          endDate: data['endDate']?.toDate() || new Date(),
          targetMonth: data['targetMonth'],
          isActive: data['isActive'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
        };
      });
      callback(periods);
    });
  },

  /**
   * 期間内かどうかをチェック
   */
  isWithinPeriod: (period: ShiftSubmissionPeriod): boolean => {
    const now = new Date();
    return now >= period.startDate && now <= period.endDate;
  },

  /**
   * 提出完了までの日数を計算
   */
  getDaysUntilDeadline: (period: ShiftSubmissionPeriod): number => {
    const now = new Date();
    const diffTime = period.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * 期間を削除
   */
  deletePeriod: async (periodId: string): Promise<void> => {
    try {
      const periodRef = doc(db, "shift_submission_periods", periodId);
      await deleteDoc(periodRef);
    } catch (error) {
      // Silent error handling for deleting period
      throw error;
    }
  },
};