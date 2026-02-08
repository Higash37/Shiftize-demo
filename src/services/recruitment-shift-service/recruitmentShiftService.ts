import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db } from "@/services/firebase/firebase";
import { functions } from "@/services/firebase/firebase-core";
import {
  RecruitmentShift,
  RecruitmentApplication,
} from "@/common/common-models/model-shift/shiftTypes";
import { ShiftAPIService } from "@/services/api/ShiftAPIService";

const RECRUITMENT_SHIFTS_COLLECTION = "recruitmentShifts";

export class RecruitmentShiftService {
  /**
   * 募集シフトを作成（LINE通知付き）
   */
  static async createRecruitmentShift(
    shift: Omit<
      RecruitmentShift,
      "id" | "createdAt" | "updatedAt" | "applications"
    >,
    options?: {
      sendLineNotification?: boolean;
      masterName?: string;
    }
  ): Promise<string> {
    const newShift = {
      ...shift,
      applications: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: "open" as const, // statusフィールドを明示的に追加
    };

    try {
      const docRef = doc(collection(db, RECRUITMENT_SHIFTS_COLLECTION));

      await setDoc(docRef, newShift);

      // LINE通知の送信（オプション）
      if (options?.sendLineNotification && options?.masterName) {
        try {
          const notificationData: {
            id: string;
            storeId: string;
            date: string;
            startTime: string;
            endTime: string;
            notes?: string;
            masterName: string;
            createdAt: string;
          } = {
            id: docRef.id,
            storeId: shift.storeId,
            date: shift.date,
            startTime: shift.startTime,
            endTime: shift.endTime,
            masterName: options.masterName,
            createdAt: newShift.createdAt.toDate().toISOString(),
          };

          if (shift.notes) {
            notificationData.notes = shift.notes;
          }

          await this.sendRecruitmentLineNotification(
            docRef.id,
            notificationData
          );
        } catch (lineError) {
          // LINE通知の失敗はログに記録するが、シフト作成は継続
        }
      }

      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  /**
   * LINE通知を送信（プライベートメソッド）
   */
  private static async sendRecruitmentLineNotification(
    shiftId: string,
    shiftData: {
      id: string;
      storeId: string;
      date: string;
      startTime: string;
      endTime: string;
      notes?: string;
      masterName: string;
      createdAt: string;
    }
  ): Promise<void> {
    const sendNotification = httpsCallable(
      functions,
      "sendRecruitmentNotification"
    );

    await sendNotification({
      storeId: shiftData.storeId,
      recruitmentShift: shiftData,
    });
  }

  /**
   * 募集シフトを更新
   */
  static async updateRecruitmentShift(
    shiftId: string,
    updates: Partial<RecruitmentShift>
  ): Promise<void> {
    const docRef = doc(db, RECRUITMENT_SHIFTS_COLLECTION, shiftId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * 募集シフトに応募
   */
  static async applyToRecruitmentShift(
    shiftId: string,
    application: Omit<RecruitmentApplication, "appliedAt" | "status">
  ): Promise<void> {
    const newApplication: RecruitmentApplication = {
      ...application,
      appliedAt: new Date(),
      status: "pending",
    };

    const docRef = doc(db, RECRUITMENT_SHIFTS_COLLECTION, shiftId);
    try {
      // 1. 募集シフトに応募を追加
      await updateDoc(docRef, {
        applications: arrayUnion(newApplication),
        updatedAt: Timestamp.now(),
      });

      // 2. 募集シフトの詳細を取得
      const recruitmentDoc = await getDoc(docRef);
      if (recruitmentDoc.exists()) {
        const recruitmentData = recruitmentDoc.data();

        // 3. 応募者の仮シフトを作成（承認待ち状態）
        const pendingShift = {
          storeId: recruitmentData['storeId'],
          userId: application.userId,
          nickname: application.nickname,
          date: recruitmentData['date'],
          startTime: application.requestedStartTime,
          endTime: application.requestedEndTime,
          notes: (application.notes || "") + " (募集シフト応募・承認待ち)",
          status: "pending" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await ShiftAPIService.createShift(pendingShift as any);
      }
    } catch (error) {
      throw new Error(`応募の保存に失敗しました: ${error}`);
    }
  }

  /**
   * 応募を承認してシフトを作成
   */
  static async approveApplication(
    recruitmentShiftId: string,
    userId: string,
    shiftData: {
      startTime: string;
      endTime: string;
    }
  ): Promise<void> {
    // 募集シフトデータを取得
    const docRef = doc(db, RECRUITMENT_SHIFTS_COLLECTION, recruitmentShiftId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("募集シフトが見つかりません");
    }

    const recruitmentShift = docSnap.data() as RecruitmentShift;

    // 対象の応募を見つける
    const application = recruitmentShift.applications.find(
      (app) => app.userId === userId
    );
    if (!application) {
      throw new Error("応募が見つかりません");
    }

    // 新しい通常シフトを作成
    const newShift = {
      storeId: recruitmentShift.storeId,
      userId: userId,
      nickname: application.nickname,
      date: recruitmentShift.date,
      startTime: shiftData.startTime,
      endTime: shiftData.endTime,
      notes: application.notes || "",
      createdBy: recruitmentShift.createdBy,
      status: "approved" as const, // 承認済みステータス
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 既存の仮シフト（pending）を削除
    try {
      const existingShifts = await ShiftAPIService.getShifts({
        storeId: recruitmentShift.storeId,
        userId: userId,
      });

      const pendingShift = existingShifts.find(
        (shift) =>
          shift.notes?.includes("募集シフト応募・承認待ち") &&
          shift.status === "pending"
      );

      if (pendingShift) {
        await ShiftAPIService.deleteShift(pendingShift.id);
      }
    } catch (error) {
    }

    // ShiftAPIServiceを使用して新しいシフトを作成
    await ShiftAPIService.createShift(newShift as any);

    // 募集シフトの応募ステータスを更新
    const updatedApplications = recruitmentShift.applications.map((app) =>
      app.userId === userId ? { ...app, status: "approved" as const } : app
    );

    await updateDoc(docRef, {
      applications: updatedApplications,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * 応募を却下
   */
  static async rejectApplication(
    recruitmentShiftId: string,
    userId: string
  ): Promise<void> {
    const docRef = doc(db, RECRUITMENT_SHIFTS_COLLECTION, recruitmentShiftId);
    const docSnap = await getDocs(
      query(
        collection(db, RECRUITMENT_SHIFTS_COLLECTION),
        where("__name__", "==", recruitmentShiftId)
      )
    );

    if (!docSnap.empty) {
      const recruitmentShiftData = docSnap.docs[0]?.data();
      if (!recruitmentShiftData) {
        throw new Error("募集シフトデータが見つかりません");
      }
      const recruitmentShift = recruitmentShiftData as RecruitmentShift;
      const updatedApplications = recruitmentShift.applications.map((app) =>
        app.userId === userId ? { ...app, status: "rejected" as const } : app
      );

      await updateDoc(docRef, {
        applications: updatedApplications,
        updatedAt: Timestamp.now(),
      });
    }
  }

  /**
   * 募集シフトを削除
   */
  static async deleteRecruitmentShift(shiftId: string): Promise<void> {
    const docRef = doc(db, RECRUITMENT_SHIFTS_COLLECTION, shiftId);
    await deleteDoc(docRef);
  }

  /**
   * 募集シフトのステータスを変更
   */
  static async updateRecruitmentStatus(
    shiftId: string,
    status: "open" | "closed" | "cancelled"
  ): Promise<void> {
    const docRef = doc(db, RECRUITMENT_SHIFTS_COLLECTION, shiftId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * IDで募集シフトを取得
   */
  static async getRecruitmentShift(shiftId: string): Promise<RecruitmentShift | null> {
    const docRef = doc(db, RECRUITMENT_SHIFTS_COLLECTION, shiftId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : data['createdAt'],
      updatedAt: data['updatedAt']?.toDate ? data['updatedAt'].toDate() : data['updatedAt'],
    } as RecruitmentShift;
  }

  /**
   * 店舗の募集中シフト一覧を取得
   */
  static async getOpenRecruitmentShifts(storeId: string): Promise<RecruitmentShift[]> {
    const q = query(
      collection(db, RECRUITMENT_SHIFTS_COLLECTION),
      where("storeId", "==", storeId),
      where("status", "==", "open")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as RecruitmentShift[];
  }

  /**
   * 募集中シフトのリアルタイム購読
   */
  static onOpenRecruitmentShifts(
    storeId: string,
    callback: (shifts: RecruitmentShift[]) => void,
    onError?: (error: any) => void
  ): () => void {
    const q = query(
      collection(db, RECRUITMENT_SHIFTS_COLLECTION),
      where("storeId", "==", storeId),
      where("status", "==", "open")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const shifts: RecruitmentShift[] = [];
        snapshot.forEach((doc) => {
          shifts.push({ id: doc.id, ...doc.data() } as RecruitmentShift);
        });
        callback(shifts);
      },
      (error) => {
        if (error.code === "permission-denied") {
          callback([]);
          return;
        }
        onError?.(error);
      }
    );

    return unsubscribe;
  }

  /**
   * 店舗の募集シフト一覧を取得
   */
  static async getRecruitmentShifts(
    storeId: string
  ): Promise<RecruitmentShift[]> {
    try {
      const q = query(
        collection(db, RECRUITMENT_SHIFTS_COLLECTION),
        where("storeId", "==", storeId)
      );

      const querySnapshot = await getDocs(q);
      const recruitmentShifts: RecruitmentShift[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        recruitmentShifts.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate
            ? data['createdAt'].toDate()
            : data['createdAt'],
          updatedAt: data['updatedAt']?.toDate
            ? data['updatedAt'].toDate()
            : data['updatedAt'],
        } as RecruitmentShift);
      });

      return recruitmentShifts;
    } catch (error) {
      throw error;
    }
  }
}
