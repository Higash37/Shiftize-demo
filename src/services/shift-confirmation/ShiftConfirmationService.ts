import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp 
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

export interface ShiftConfirmation {
  id?: string;
  userId: string;
  storeId: string;
  periodId: string;
  confirmedAt: Timestamp;
  status: "confirmed" | "cancelled";
}

export class ShiftConfirmationService {
  private static COLLECTION_NAME = "shiftConfirmations";

  /**
   * シフト確定を保存
   */
  static async confirmShift(
    userId: string,
    storeId: string,
    periodId: string
  ): Promise<void> {
    try {
      const confirmationId = `${userId}_${periodId}`;
      const confirmationData: Omit<ShiftConfirmation, "id"> = {
        userId,
        storeId,
        periodId,
        confirmedAt: Timestamp.now(),
        status: "confirmed"
      };

      await setDoc(
        doc(db, this.COLLECTION_NAME, confirmationId),
        confirmationData
      );
    } catch (error) {
      console.error("シフト確定の保存エラー:", error);
      throw error;
    }
  }

  /**
   * シフト確定を取り消し
   */
  static async cancelConfirmation(
    userId: string,
    periodId: string
  ): Promise<void> {
    try {
      const confirmationId = `${userId}_${periodId}`;
      await deleteDoc(doc(db, this.COLLECTION_NAME, confirmationId));
    } catch (error) {
      console.error("シフト確定取り消しエラー:", error);
      throw error;
    }
  }

  /**
   * ユーザーのシフト確定状況を取得
   */
  static async getUserConfirmationStatus(
    userId: string,
    periodId: string
  ): Promise<boolean> {
    try {
      const confirmationId = `${userId}_${periodId}`;
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("__name__", "==", confirmationId),
        where("status", "==", "confirmed")
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("確定状況取得エラー:", error);
      return false;
    }
  }

  /**
   * 店舗の全ユーザーの確定状況を取得
   */
  static async getStoreConfirmationStatus(
    storeId: string,
    periodId: string
  ): Promise<ShiftConfirmation[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("storeId", "==", storeId),
        where("periodId", "==", periodId),
        where("status", "==", "confirmed")
      );
      
      const querySnapshot = await getDocs(q);
      const confirmations: ShiftConfirmation[] = [];
      
      querySnapshot.forEach((doc) => {
        confirmations.push({
          id: doc.id,
          ...doc.data()
        } as ShiftConfirmation);
      });
      
      return confirmations;
    } catch (error) {
      console.error("店舗確定状況取得エラー:", error);
      return [];
    }
  }
}