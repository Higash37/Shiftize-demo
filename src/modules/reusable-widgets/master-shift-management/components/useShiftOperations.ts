import { useCallback } from "react";
import { Alert } from "react-native";
import {
  query,
  where,
  getDocs,
  setDoc,
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { MultiStoreService } from "@/services/firebase/firebase-multistore";
import { RecruitmentShiftService } from "@/services/recruitment-shift-service/recruitmentShiftService";
import type { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";
import type { UserData } from "@/services/firebase/firebase";
import { ConnectedStoreUser, ShiftData } from "./types";

export const useShiftOperations = () => {
  const { markShiftAsDeleted, createShift } = useShift();

  const fetchConnectedStoreUsers = useCallback(async (storeId: string) => {
    try {
      const users = await MultiStoreService.getConnectedStoreUsers(storeId);
      return users;
    } catch (error) {
      console.error("Error fetching connected store users:", error);
      return [];
    }
  }, []);

  const fetchExistingShift = useCallback(async (shiftId: string) => {
    try {
      const shiftDocRef = doc(db, "shifts", shiftId);
      const shiftDoc = await getDoc(shiftDocRef);
      
      if (shiftDoc.exists()) {
        return { id: shiftDoc.id, ...shiftDoc.data() } as Shift;
      }
      return null;
    } catch (error) {
      console.error("Error fetching existing shift:", error);
      return null;
    }
  }, []);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }, []);

  const saveShift = useCallback(async (
    shiftData: ShiftData,
    selectedUserId: string,
    selectedDate: string,
    selectedStartTime: string,
    selectedEndTime: string,
    selectedStatus: ShiftStatus,
    storeId: string,
    isEditMode: boolean,
    shiftId?: string
  ) => {
    if (!selectedUserId) {
      throw new Error("ユーザーを選択してください");
    }

    if (!selectedDate) {
      throw new Error("日付を選択してください");
    }

    if (!selectedStartTime || !selectedEndTime) {
      throw new Error("開始時間と終了時間を選択してください");
    }

    if (selectedStartTime >= selectedEndTime) {
      throw new Error("終了時間は開始時間より後にしてください");
    }

    const newShift: Partial<Shift> = {
      userId: selectedUserId,
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      status: selectedStatus,
      storeId,
      updatedAt: serverTimestamp(),
    };

    if (isEditMode && shiftId) {
      const shiftDocRef = doc(db, "shifts", shiftId);
      await updateDoc(shiftDocRef, newShift);
      return shiftId;
    } else {
      const result = await createShift(newShift as Shift);
      return result;
    }
  }, [createShift]);

  const deleteShift = useCallback(async (shiftId: string) => {
    try {
      await markShiftAsDeleted(shiftId);
    } catch (error) {
      console.error("Error deleting shift:", error);
      throw new Error("シフトの削除に失敗しました");
    }
  }, [markShiftAsDeleted]);

  const validateShiftData = useCallback((
    selectedUserId: string,
    selectedDate: string,
    selectedStartTime: string,
    selectedEndTime: string
  ) => {
    if (!selectedUserId) {
      return "ユーザーを選択してください";
    }

    if (!selectedDate) {
      return "日付を選択してください";
    }

    if (!selectedStartTime || !selectedEndTime) {
      return "開始時間と終了時間を選択してください";
    }

    if (selectedStartTime >= selectedEndTime) {
      return "終了時間は開始時間より後にしてください";
    }

    return null;
  }, []);

  return {
    fetchConnectedStoreUsers,
    fetchExistingShift,
    fetchUserData,
    saveShift,
    deleteShift,
    validateShiftData,
  };
};