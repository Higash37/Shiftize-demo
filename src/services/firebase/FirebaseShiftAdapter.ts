import type { IShiftService } from "../interfaces/IShiftService";
import type { Shift, ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";
import { ShiftService } from "./firebase-shift";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase-core";

const mapDocToShiftItem = (doc: {
  id: string;
  data: () => DocumentData;
}): ShiftItem => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data["userId"] || "",
    storeId: data["storeId"] || "",
    nickname: data["nickname"],
    date: data["date"],
    startTime: data["startTime"],
    endTime: data["endTime"],
    type: data["type"] || "user",
    subject: data["subject"],
    isCompleted: data["isCompleted"] || false,
    status: data["status"] as ShiftStatus,
    duration: data["duration"]?.toString() || "0",
    createdAt: data["createdAt"]?.toDate() || new Date(),
    updatedAt: data["updatedAt"]?.toDate() || new Date(),
    requestedChanges: data["requestedChanges"]?.map((change: unknown) => {
      const c = change as { startTime?: string; endTime?: string };
      return {
        startTime: c.startTime || "",
        endTime: c.endTime || "",
        date: data["date"],
        subject: data["subject"],
      };
    }),
    classes: Array.isArray(data["classes"]) ? data["classes"] : [],
  } as ShiftItem;
};

const sortShifts = (shifts: ShiftItem[]): ShiftItem[] =>
  shifts.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare === 0) {
      return a.startTime.localeCompare(b.startTime);
    }
    return dateCompare;
  });

export class FirebaseShiftAdapter implements IShiftService {
  async getShift(id: string): Promise<Shift | null> {
    const docRef = doc(db, "shifts", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data["userId"] || "",
      storeId: data["storeId"] || "",
      nickname: data["nickname"] || "",
      date: data["date"] || "",
      startTime: data["startTime"] || "",
      endTime: data["endTime"] || "",
      type: data["type"] || "user",
      subject: data["subject"] || "",
      notes: data["notes"],
      isCompleted: data["isCompleted"] || false,
      status: data["status"] || "draft",
      duration: typeof data["duration"] === "number" ? data["duration"] : (parseInt(data["duration"]) || 0),
      createdAt: data["createdAt"]?.toDate() || new Date(),
      updatedAt: data["updatedAt"]?.toDate() || new Date(),
      classes: data["classes"] || [],
      requestedChanges: data["requestedChanges"] || undefined,
    } as Shift;
  }

  getShifts = ShiftService.getShifts;
  addShift = ShiftService.addShift;
  updateShift = ShiftService.updateShift;
  markShiftAsDeleted = ShiftService.markShiftAsDeleted;
  approveShiftChanges = ShiftService.approveShiftChanges;
  markShiftAsCompleted = ShiftService.markShiftAsCompleted;
  addShiftReport = ShiftService.addShiftReport;
  getShiftsFromMultipleStores = ShiftService.getShiftsFromMultipleStores;
  getUserAccessibleShifts = ShiftService.getUserAccessibleShifts;

  onShiftsChanged(
    storeId: string,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const shiftsRef = collection(db, "shifts");
    const q = query(shiftsRef, where("storeId", "==", storeId));

    return onSnapshot(
      q,
      (querySnapshot) => {
        const shifts = querySnapshot.docs
          .map((doc) => mapDocToShiftItem(doc))
          .filter((shift) => shift.storeId === storeId);
        callback(sortShifts(shifts));
      },
      (err) => {
        if (err.code === "permission-denied") {
          callback([]);
          return;
        }
        onError?.(err as Error);
      }
    );
  }

  onShiftsByMonth(
    storeId: string,
    year: number,
    month: number,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-31`;

    const shiftsRef = collection(db, "shifts");
    const q = query(
      shiftsRef,
      where("storeId", "==", storeId),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const shifts = querySnapshot.docs
          .map((doc) => mapDocToShiftItem(doc))
          .filter((shift) => shift.storeId === storeId);
        callback(sortShifts(shifts));
      },
      (err) => {
        if (err.code === "permission-denied") {
          callback([]);
          return;
        }
        onError?.(err as Error);
      }
    );
  }
}
