import { useCallback } from "react";
import { Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
// RecruitmentShiftService has been removed during cleanup
import type { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";
import type { ExtendedUser } from "@/modules/reusable-widgets/user-management/user-types/components";
import { ShiftData } from "./types";

export const useMasterShiftHandlers = (
  setIsLoading: (loading: boolean) => void,
  setErrorMessage: (message: string) => void,
  setShowSuccess: (show: boolean) => void,
  fadeAnim: Animated.Value,
  resetForm: () => void
) => {
  const router = useRouter();
  const { user } = useAuth();
  const { markShiftAsDeleted, createShift } = useShift();

  const handleDatesConfirm = useCallback((dates: string[], updateShiftData: (updates: Partial<ShiftData>) => void) => {
    updateShiftData({ dates });
  }, []);

  const handleCreateShift = useCallback(async (
    shiftData: ShiftData,
    selectedUserId: string,
    selectedUserNickname: string,
    selectedStatus: ShiftStatus,
    users: ExtendedUser[],
    setSelectedUserNickname: (nickname: string) => void
  ) => {
    if (!selectedUserId) {
      setErrorMessage("ユーザーを選択してください");
      return;
    }

    if (shiftData.dates.length === 0) {
      setErrorMessage("日付を選択してください");
      return;
    }

    if (!shiftData.startTime || !shiftData.endTime) {
      setErrorMessage("時間を入力してください");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      let nickname = selectedUserNickname;
      if (!nickname) {
        const selectedUser = users.find((u) => u.uid === selectedUserId);
        if (selectedUser) {
          nickname = selectedUser.nickname;
          setSelectedUserNickname(nickname);
        }
      }

      if (selectedUserId === "recruitment") {
        const createPromises = shiftData.dates.map(async (date) => {
          const recruitmentShift = {
            storeId: user?.storeId || "",
            date,
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            subject: "",
            notes: "",
            createdBy: user?.uid || "",
            status: "open" as const,
            maxApplicants: undefined,
          };

          await RecruitmentShiftService.createRecruitmentShift(recruitmentShift);
        });

        await Promise.all(createPromises);
      } else {
        const createPromises = shiftData.dates.map(async (date) => {
          const startTimeDate = new Date(`2000-01-01T${shiftData.startTime}`);
          const endTimeDate = new Date(`2000-01-01T${shiftData.endTime}`);
          const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
          const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

          const newShift = {
            userId: selectedUserId,
            storeId: user?.storeId || "",
            nickname: nickname,
            date,
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            type: shiftData.hasClass ? ("class" as const) : ("user" as const),
            subject: "",
            isCompleted: false,
            duration: durationHours,
            classes: shiftData.classes,
            status: selectedStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await createShift(newShift);
        });

        await Promise.all(createPromises);
      }

      setIsLoading(false);
      setShowSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccess(false);
        });
      }, 1500);

      resetForm();
    } catch (error) {
      setErrorMessage("シフトの作成に失敗しました");
      setIsLoading(false);
    }
  }, [user, createShift, fadeAnim, resetForm, setIsLoading, setErrorMessage, setShowSuccess]);

  const handleUpdateShift = useCallback(async (
    existingShift: Shift,
    shiftData: ShiftData,
    selectedUserId: string,
    selectedUserNickname: string,
    selectedStatus: ShiftStatus
  ) => {
    if (!existingShift) return;

    if (shiftData.dates.length === 0) {
      setErrorMessage("日付を選択してください");
      return;
    }

    if (!shiftData.startTime || !shiftData.endTime) {
      setErrorMessage("時間を入力してください");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const startTimeDate = new Date(`2000-01-01T${shiftData.startTime}`);
      const endTimeDate = new Date(`2000-01-01T${shiftData.endTime}`);
      const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
      const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

      const updatedShift = {
        userId: selectedUserId || existingShift.userId,
        storeId: user?.storeId || existingShift.storeId || "",
        nickname: selectedUserNickname || existingShift.nickname,
        date: shiftData.dates[0],
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        type: shiftData.hasClass ? ("class" as const) : ("user" as const),
        subject: existingShift.subject || "",
        isCompleted: existingShift.isCompleted || false,
        duration: durationHours,
        classes: shiftData.classes,
        status: selectedStatus,
        updatedAt: new Date(),
      };

      const { updateDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/services/firebase/firebase");
      
      const shiftRef = doc(db, "shifts", existingShift.id);
      await updateDoc(shiftRef, updatedShift);

      Alert.alert("更新完了", "シフトを更新しました", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      setErrorMessage("シフトの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [user, router, setIsLoading, setErrorMessage]);

  const handleDelete = useCallback(async (existingShift: Shift) => {
    if (!existingShift) return;

    Alert.alert("シフトを削除", "このシフトを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            await markShiftAsDeleted(existingShift.id);
            Alert.alert("削除完了", "シフトを削除しました", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (error) {
            setErrorMessage("シフトの削除に失敗しました");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }, [markShiftAsDeleted, router, setIsLoading, setErrorMessage]);

  return {
    handleDatesConfirm,
    handleCreateShift,
    handleUpdateShift,
    handleDelete,
  };
};