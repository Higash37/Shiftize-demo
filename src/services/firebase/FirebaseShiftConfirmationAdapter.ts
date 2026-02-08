import type { IShiftConfirmationService, ShiftConfirmation } from "../interfaces/IShiftConfirmationService";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

const COLLECTION_NAME = "shiftConfirmations";

export class FirebaseShiftConfirmationAdapter implements IShiftConfirmationService {
  async confirmShift(userId: string, storeId: string, periodId: string): Promise<void> {
    const confirmationId = `${userId}_${periodId}`;
    const confirmationData = {
      userId,
      storeId,
      periodId,
      confirmedAt: Timestamp.now(),
      status: "confirmed" as const,
    };
    await setDoc(doc(db, COLLECTION_NAME, confirmationId), confirmationData);
  }

  async cancelConfirmation(userId: string, periodId: string): Promise<void> {
    const confirmationId = `${userId}_${periodId}`;
    await deleteDoc(doc(db, COLLECTION_NAME, confirmationId));
  }

  async getUserConfirmationStatus(userId: string, periodId: string): Promise<boolean> {
    try {
      const confirmationId = `${userId}_${periodId}`;
      const q = query(
        collection(db, COLLECTION_NAME),
        where("__name__", "==", confirmationId),
        where("status", "==", "confirmed")
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch {
      return false;
    }
  }

  async getStoreConfirmationStatus(storeId: string, periodId: string): Promise<ShiftConfirmation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("storeId", "==", storeId),
        where("periodId", "==", periodId),
        where("status", "==", "confirmed")
      );
      const querySnapshot = await getDocs(q);
      const confirmations: ShiftConfirmation[] = [];
      querySnapshot.forEach((d) => {
        confirmations.push({ id: d.id, ...d.data() } as ShiftConfirmation);
      });
      return confirmations;
    } catch {
      return [];
    }
  }
}
