import type {
  IShiftSubmissionService,
  ShiftSubmissionPeriod,
  ShiftRequest,
  ShiftSubmission,
} from "../interfaces/IShiftSubmissionService";
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
import { db } from "@/services/firebase/firebase-core";

function mapPeriodDoc(d: any): ShiftSubmissionPeriod {
  const data = typeof d.data === "function" ? d.data() : d;
  const id = d.id || data.id;
  return {
    id,
    storeId: data['storeId'],
    startDate: data['startDate']?.toDate?.() || new Date(),
    endDate: data['endDate']?.toDate?.() || new Date(),
    targetMonth: data['targetMonth'],
    isActive: data['isActive'],
    createdAt: data['createdAt']?.toDate?.() || new Date(),
    createdBy: data['createdBy'],
  };
}

export class FirebaseShiftSubmissionAdapter implements IShiftSubmissionService {
  async getActivePeriods(storeId: string): Promise<ShiftSubmissionPeriod[]> {
    const q = query(
      collection(db, "shift_submission_periods"),
      where("storeId", "==", storeId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapPeriodDoc);
  }

  async getAllPeriods(storeId: string): Promise<ShiftSubmissionPeriod[]> {
    const q = query(
      collection(db, "shift_submission_periods"),
      where("storeId", "==", storeId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapPeriodDoc);
  }

  async getPeriod(periodId: string): Promise<ShiftSubmissionPeriod | null> {
    const periodRef = doc(db, "shift_submission_periods", periodId);
    const periodSnap = await getDoc(periodRef);
    if (!periodSnap.exists()) return null;
    return mapPeriodDoc(periodSnap);
  }

  async getUserSubmission(periodId: string, userId: string): Promise<ShiftSubmission | null> {
    const q = query(
      collection(db, "shift_submissions"),
      where("periodId", "==", periodId),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const d = snapshot.docs[0];
    if (!d) return null;
    const data = d.data();

    return {
      id: d.id,
      periodId: data['periodId'],
      userId: data['userId'],
      storeId: data['storeId'],
      requests: data['requests'] || [],
      status: data['status'],
      submittedAt: data['submittedAt']?.toDate?.(),
      createdAt: data['createdAt']?.toDate?.() || new Date(),
      updatedAt: data['updatedAt']?.toDate?.() || new Date(),
    };
  }

  async saveSubmission(
    periodId: string,
    userId: string,
    storeId: string,
    requests: ShiftRequest[]
  ): Promise<void> {
    const existing = await this.getUserSubmission(periodId, userId);

    if (existing) {
      const submissionRef = doc(db, "shift_submissions", existing.id);
      await updateDoc(submissionRef, {
        requests,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "shift_submissions"), {
        periodId,
        userId,
        storeId,
        requests,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  async submitShiftRequests(periodId: string, userId: string): Promise<void> {
    const submission = await this.getUserSubmission(periodId, userId);
    if (!submission) throw new Error("提出するシフト希望が見つかりません");

    const submissionRef = doc(db, "shift_submissions", submission.id);
    await updateDoc(submissionRef, {
      status: 'submitted',
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  subscribeToActivePeriods(
    storeId: string,
    callback: (periods: ShiftSubmissionPeriod[]) => void
  ): () => void {
    const q = query(
      collection(db, "shift_submission_periods"),
      where("storeId", "==", storeId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(mapPeriodDoc));
    });
  }

  isWithinPeriod(period: ShiftSubmissionPeriod): boolean {
    const now = new Date();
    return now >= period.startDate && now <= period.endDate;
  }

  getDaysUntilDeadline(period: ShiftSubmissionPeriod): number {
    const now = new Date();
    const diffTime = period.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async deletePeriod(periodId: string): Promise<void> {
    await deleteDoc(doc(db, "shift_submission_periods", periodId));
  }
}
