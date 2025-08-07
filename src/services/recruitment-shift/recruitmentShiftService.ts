import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { RecruitmentShift, RecruitmentApplication } from "@/common/common-models/model-shift/shiftTypes";

const RECRUITMENT_SHIFTS_COLLECTION = "recruitmentShifts";

export class RecruitmentShiftService {
  /**
   * 募集シフトを作成
   */
  static async createRecruitmentShift(
    shift: Omit<RecruitmentShift, "id" | "createdAt" | "updatedAt" | "applications">
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

      return docRef.id;
    } catch (error) {
      console.error("Firestore setDoc エラー:", error);
      throw error;
    }
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
    await updateDoc(docRef, {
      applications: arrayUnion(newApplication),
      updatedAt: Timestamp.now(),
    });
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
    // 募集シフトの応募ステータスを更新
    const docRef = doc(db, RECRUITMENT_SHIFTS_COLLECTION, recruitmentShiftId);
    const docSnap = await getDocs(query(collection(db, RECRUITMENT_SHIFTS_COLLECTION), where("__name__", "==", recruitmentShiftId)));
    
    if (!docSnap.empty) {
      const recruitmentShift = docSnap.docs[0].data() as RecruitmentShift;
      const updatedApplications = recruitmentShift.applications.map((app) =>
        app.userId === userId ? { ...app, status: "approved" as const } : app
      );

      await updateDoc(docRef, {
        applications: updatedApplications,
        updatedAt: Timestamp.now(),
      });
    }
  }

  /**
   * 応募を却下
   */
  static async rejectApplication(
    recruitmentShiftId: string,
    userId: string
  ): Promise<void> {
    const docRef = doc(db, RECRUITMENT_SHIFTS_COLLECTION, recruitmentShiftId);
    const docSnap = await getDocs(query(collection(db, RECRUITMENT_SHIFTS_COLLECTION), where("__name__", "==", recruitmentShiftId)));
    
    if (!docSnap.empty) {
      const recruitmentShift = docSnap.docs[0].data() as RecruitmentShift;
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
}