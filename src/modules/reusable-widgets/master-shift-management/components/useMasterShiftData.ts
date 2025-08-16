import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { useAuth } from "@/services/auth/useAuth";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { MultiStoreService } from "@/services/firebase/firebase-multistore";
import type { Shift } from "@/common/common-models/ModelIndex";
import type { UserData } from "@/services/firebase/firebase";
import { ConnectedStoreUser, ShiftData } from "./types";

export const useMasterShiftData = (
  isEditMode: boolean,
  shiftId?: string,
  setUserData?: (data: UserData | null) => void,
  setExistingShift?: (shift: Shift | null) => void,
  setConnectedStoreUsers?: (users: ConnectedStoreUser[]) => void,
  setSelectedUserId?: (id: string) => void,
  setSelectedUserNickname?: (nickname: string) => void,
  setSelectedStatus?: (status: any) => void,
  setShiftData?: (data: ShiftData) => void,
  setIsLoading?: (loading: boolean) => void
) => {
  const { user } = useAuth();
  const { users } = useUsers();

  // ユーザーデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !setUserData || !setIsLoading) {
        setIsLoading?.(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, setUserData, setIsLoading]);

  // 連携校舎のユーザーを取得
  useEffect(() => {
    const fetchConnectedStoreUsers = async () => {
      if (!user?.uid || !setConnectedStoreUsers) return;

      const currentUser = users.find((u) => u.uid === user.uid);
      if (!currentUser?.storeId) return;

      try {
        const connectedUsers = await MultiStoreService.getConnectedStoreUsers(
          currentUser.storeId
        );
        setConnectedStoreUsers(connectedUsers);
      } catch (error) {
        console.error("Error fetching connected store users:", error);
      }
    };

    fetchConnectedStoreUsers();
  }, [user?.uid, users, setConnectedStoreUsers]);

  // 編集モードの場合、既存のシフト情報を取得
  useEffect(() => {
    const fetchExistingShift = async () => {
      if (!isEditMode || !shiftId || !setExistingShift || !setIsLoading) return;

      try {
        setIsLoading(true);
        const shiftDoc = await getDoc(doc(db, "shifts", shiftId));
        if (shiftDoc.exists()) {
          const shiftData = shiftDoc.data() as Shift;
          const existingShift = {
            ...shiftData,
            id: shiftDoc.id,
          };
          setExistingShift(existingShift);

          // 既存のシフトのユーザーを選択
          setSelectedUserId?.(shiftData.userId || "");
          setSelectedUserNickname?.(shiftData.nickname || "");
          setSelectedStatus?.(shiftData.status);

          setShiftData?.({
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            dates: [shiftData.date],
            hasClass: shiftData.type === "class",
            classes: shiftData.classes || [],
          });
        }
      } catch (error) {
        console.error("Error fetching existing shift:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingShift();
  }, [isEditMode, shiftId, setExistingShift, setSelectedUserId, setSelectedUserNickname, setSelectedStatus, setShiftData, setIsLoading]);

  return { users };
};