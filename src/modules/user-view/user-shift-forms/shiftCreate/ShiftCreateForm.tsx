import { MAX_CLASSES_PER_SHIFT_INCLUSIVE } from "@/common/common-constants/BoundaryConstants";
import React, { useState, useEffect } from "react";
import {
  View,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { useAuth } from "@/services/auth/useAuth";
import { Header, Footer } from "@/common/common-ui/ui-layout";
import { colors } from "@/common/common-constants/ThemeConstants";
import type { ShiftData, ShiftCreateFormProps } from "./types";
import { shiftCreateFormStyles as styles } from "./styles";
import ShiftCreateFormContent from "./ShiftCreateFormContent";
import type { Shift, ClassTimeSlot } from "@/common/common-models/ModelIndex";
import { calculateDurationHours, timeStringToMinutes } from "@/common/common-utils/util-shift/wageCalculator";
import type { FlexAlignType } from "react-native";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";
import type { StoreInfo } from "@/services/interfaces/IMultiStoreService";
import type { StoreProfile } from "@/services/interfaces/IStoreService";

// 型定義
interface UserData {
  uid: string;
  nickname: string;
  email: string;
  role: string;
  storeId?: string;
  storeName?: string;
  connectedStores?: string[]; // 連携店舗IDの配列を追加
}

export const ShiftCreateForm: React.FC<ShiftCreateFormProps> = ({
  initialMode,
  initialShiftId,
  initialDate,
  initialStartTime,
  initialEndTime,
  initialClasses,
}) => {
  const router = useRouter();
  const { markShiftAsDeleted, createShift } = useShift();
  const isEditMode = initialMode === "edit";
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentStore, setCurrentStore] = useState<StoreProfile | null>(null);
  const [existingShift, setExistingShift] = useState<Shift | null>(null);
  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: initialStartTime || "",
    endTime: initialEndTime || "",
    dates: initialDate ? [initialDate] : [],
    hasClass: initialClasses ? JSON.parse(initialClasses).length > 0 : false,
    classes: initialClasses ? JSON.parse(initialClasses) : [],
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [connectedStores, setConnectedStores] = useState<StoreInfo[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(user?.storeId || "");

  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [selectedStartTime, setSelectedStartTime] = useState(
    initialStartTime || ""
  );
  const [selectedEndTime, setSelectedEndTime] = useState(initialEndTime || "");
  const [selectedClasses, setSelectedClasses] = useState<ClassTimeSlot[]>(() => {
    if (initialClasses) {
      try {
        return JSON.parse(initialClasses);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const { width } = useWindowDimensions();
  const isWideScreen = width >= 1024; // PC判定

  const containerStyle = isWideScreen
    ? {
        ...styles.container,
        width: width * 0.6,
        alignSelf: "center" as FlexAlignType,
      } // PC用スタイル
    : styles.container; // その他のデバイス用スタイル

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // AuthContextの情報から即座にuserDataを初期化
  useEffect(() => {
    if (!user) return;

    // AuthContextのデータで即座にuserData設定（API不要）
    const initialUserData: UserData = {
      uid: user.uid,
      nickname: user.nickname || "",
      email: user.email || "",
      role: user.role || "",
    };
    if (user.storeId) initialUserData.storeId = user.storeId;
    setUserData(initialUserData);

    // 店舗データ取得とプロフィール補完をバックグラウンドで並列実行
    const fetchAdditionalData = async () => {
      try {
        const [profileData, storeData, shiftData] = await Promise.all([
          ServiceProvider.users.getUserFullProfile(user.uid).catch(() => null),
          user.storeId ? ServiceProvider.stores.getStore(user.storeId).catch(() => null) : null,
          isEditMode && initialShiftId ? ServiceProvider.shifts.getShift(initialShiftId).catch(() => null) : null,
        ]);

        // プロフィールからconnectedStoresを補完
        if (profileData) {
          const connectedStores = profileData['connectedStores'] as string[] | undefined;
          if (connectedStores) {
            setUserData(prev => prev ? { ...prev, connectedStores } : prev);
          }
        }

        if (storeData) {
          setCurrentStore(storeData);
        }

        if (shiftData) {
          setExistingShift(shiftData);
        }
      } catch {
        // バックグラウンドエラーは無視
      }
    };

    fetchAdditionalData();
  }, [user, isEditMode, initialShiftId]);

  // 連携店舗を取得
  useEffect(() => {
    const fetchConnectedStores = async () => {
      if (!user?.uid || !userData) {
        return;
      }

      try {
        // 新しいアプローチ: ユーザーのconnectedStoresから直接取得
        const userConnectedStores = userData.connectedStores || [];

        const allStores: StoreInfo[] = [];

        // 現在の店舗を追加
        if (userData.storeId && currentStore) {
          allStores.push({
            storeId: userData.storeId,
            storeName:
              currentStore.storeName || "現在の店舗",
            adminUid: userData.uid,
            adminNickname: userData.nickname || "",
            isActive: true,
            createdAt: new Date(),
          });
        }

        // 連携店舗を追加
        for (const connectedStoreId of userConnectedStores) {
          try {
            const storeData = await ServiceProvider.stores.getStore(connectedStoreId);
            if (storeData) {
              allStores.push({
                storeId: connectedStoreId,
                storeName: storeData.storeName || "連携店舗",
                adminUid: storeData.adminUid || "",
                adminNickname: storeData.adminNickname || "",
                isActive: true,
                createdAt: new Date(),
              });
            }
          } catch (error) {
            console.error("Error processing store:", error);
          }
        }

        setConnectedStores(allStores);

        // 初期選択店舗を設定
        if (allStores.length > 0) {
          setSelectedStoreId(userData.storeId ?? allStores[0]?.storeId ?? "");
        }
      } catch (error) {
        console.error("Error fetching connected stores:", error);
      }
    };

    if (user?.uid && userData) {
      fetchConnectedStores();
    }
  }, [user?.uid, userData, currentStore]);

  // 既存のシフトデータがある場合、それを使用してフォームを初期化
  useEffect(() => {
    if (existingShift) {
      setShiftData({
        startTime: existingShift.startTime,
        endTime: existingShift.endTime,
        dates: [existingShift.date],
        hasClass: Boolean(
          existingShift.classes && existingShift.classes.length > 0
        ),
        classes: existingShift.classes || [],
      });
      setSelectedDate(existingShift.date);
      setSelectedStartTime(existingShift.startTime);
      setSelectedEndTime(existingShift.endTime);
      setSelectedClasses(existingShift.classes || []);

      // 編集モード時に既存シフトの店舗IDを設定
      if (existingShift.storeId) {
        setSelectedStoreId(existingShift.storeId);
      }
    }
  }, [existingShift]);

  const handleTimeChange = (
    type: "start" | "end" | "classStart" | "classEnd",
    value: string,
    index?: number
  ) => {
    if (type === "start") {
      setShiftData((prev) => ({
        ...prev,
        startTime: value,
      }));
      setSelectedStartTime(value);
    } else if (type === "end") {
      setShiftData((prev) => ({
        ...prev,
        endTime: value,
      }));
      setSelectedEndTime(value);
    } else if (type === "classStart" && index !== undefined) {
      const updatedClasses = [...shiftData.classes];
      updatedClasses[index] = {
        ...updatedClasses[index],
        startTime: value,
        endTime: updatedClasses[index]?.endTime || "",
      };
      setShiftData((prev) => ({
        ...prev,
        classes: updatedClasses,
      }));
      setSelectedClasses(updatedClasses);
    } else if (type === "classEnd" && index !== undefined) {
      const updatedClasses = [...shiftData.classes];
      updatedClasses[index] = {
        ...updatedClasses[index],
        startTime: updatedClasses[index]?.startTime || "",
        endTime: value,
      };
      setShiftData((prev) => ({
        ...prev,
        classes: updatedClasses,
      }));
      setSelectedClasses(updatedClasses);
    }
  };

  const handleDateSelect = (dates: string[]) => {
    setShiftData((prev) => ({
      ...prev,
      dates,
    }));
    setSelectedDate(dates[0] ?? ""); // 最初の日付を選択状態に設定
    setShowCalendar(false);
  };

  const addClass = () => {
    if (shiftData.classes.length > MAX_CLASSES_PER_SHIFT_INCLUSIVE) {
      setErrorMessage("13:00~17:00のようにまとめてください");
      return;
    }
    // 授業時間は適切なデフォルト値で初期化（シフト時間とは異なる）
    const defaultStartTime = "14:00"; // シフト時間とは異なるデフォルト値
    const defaultEndTime = "15:00"; // 1時間の授業として設定
    const newClass = {
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    };
    setShiftData((prev) => ({
      ...prev,
      hasClass: true,
      classes: [...prev.classes, newClass],
    }));
    setSelectedClasses((prev) => [...prev, newClass]);
  };

  const removeClass = (index: number) => {
    const updatedClasses = [...shiftData.classes];
    updatedClasses.splice(index, 1);
    setShiftData((prev) => ({
      ...prev,
      hasClass: updatedClasses.length > 0,
      classes: updatedClasses,
    }));
    setSelectedClasses(updatedClasses);
  };

  const validateShift = () => {
    if (!selectedDate) {
      setErrorMessage("日付を選択してください");
      return false;
    }
    if (!shiftData.startTime) {
      setErrorMessage("開始時間を選択してください");
      return false;
    }
    if (!shiftData.endTime) {
      setErrorMessage("終了時間を選択してください");
      return false;
    }

    // 開始時間と終了時間の比較
    if (timeStringToMinutes(shiftData.startTime) >= timeStringToMinutes(shiftData.endTime)) {
      setErrorMessage("終了時間は開始時間より後である必要があります");
      return false;
    }

    // 授業時間の検証
    const shiftStartMin = timeStringToMinutes(shiftData.startTime);
    const shiftEndMin = timeStringToMinutes(shiftData.endTime);

    for (let i = 0; i < shiftData.classes.length; i++) {
      const classItem = shiftData.classes[i];
      if (!classItem) continue;
      const classStartMin = timeStringToMinutes(classItem.startTime ?? "00:00");
      const classEndMin = timeStringToMinutes(classItem.endTime ?? "00:00");

      if (classStartMin >= classEndMin) {
        setErrorMessage(
          `途中時間${i + 1}の終了時間は開始時間より後である必要があります`
        );
        return false;
      }

      if (classStartMin < shiftStartMin || classEndMin > shiftEndMin) {
        setErrorMessage(`途中時間${i + 1}の時間はシフト時間内である必要があります`);
        return false;
      }
    }

    setErrorMessage("");
    return true;
  };

  const handleCreateOrUpdateShift = async () => {
    if (!validateShift() || !user) return;

    setIsLoading(true);

    try {
      for (const date of shiftData.dates) {
        const durationHours = calculateDurationHours(shiftData.startTime, shiftData.endTime);

        const shiftObject = {
          userId: user.uid,
          storeId: selectedStoreId || "",
          nickname: user.nickname || "Unknown",
          date,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          type: "user" as const,
          subject: "",
          isCompleted: false,
          status: isEditMode
            ? existingShift?.status || "pending"
            : ("pending" as const),
          duration: durationHours,
          classes: shiftData.classes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (isEditMode && initialShiftId) {
          await ServiceProvider.shifts.updateShift(initialShiftId, {
            ...shiftObject,
            updatedAt: new Date(),
          } as any);
        } else {
          await createShift(shiftObject);
        }
      }

      // 保存成功 → 即座に遷移
      router.push("/(main)/user/shifts");
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("シフトの保存中にエラーが発生しました");
    }
  };

  const handleDeleteShift = async () => {
    if (!isEditMode || !initialShiftId) return;

    try {
      setIsDeleting(true);

      const existingShiftData = await ServiceProvider.shifts.getShift(initialShiftId);
      if (existingShiftData) {
        if (existingShiftData.status === "pending") {
          // 承認待ちの場合は即時削除
          await ServiceProvider.shifts.updateShift(initialShiftId, {
            status: "deleted",
            updatedAt: new Date(),
          } as any);
        } else {
          // それ以外は削除申請
          await ServiceProvider.shifts.updateShift(initialShiftId, {
            status: "deletion_requested",
            updatedAt: new Date(),
          } as any);
        }
      }

      setIsDeleting(false);
      router.push("/(main)/user/shifts");
    } catch (error) {
      const errorMessage = (error as Error).message;
      setIsDeleting(false);
      setErrorMessage("シフトの削除中にエラーが発生しました: " + errorMessage);
    }
  };
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          title={isEditMode ? "シフト編集" : "シフト作成"}
          showBackButton
          onBack={() => router.back()}
          onPressSettings={() => setShowPasswordModal(true)}
        />
        <View style={styles.loadingContainer} />
        <Modal
          visible={showPasswordModal}
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <ChangePassword onComplete={() => setShowPasswordModal(false)} />
          <Footer />
        </Modal>
      </View>
    );
  }

  return (
    <>
      <View style={{ width: "100%" }}>
        <Header
          title="シフト作成"
          onPressSettings={() => setShowPasswordModal(true)}
        />
      </View>
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
        <Footer />
      </Modal>
      <ShiftCreateFormContent
        containerStyle={containerStyle}
        selectedDate={selectedDate}
        setShowCalendar={setShowCalendar}
        handleDateSelect={handleDateSelect}
        shiftData={shiftData}
        handleTimeChange={handleTimeChange}
        addClass={addClass}
        removeClass={removeClass}
        errorMessage={errorMessage}
        handleCreateOrUpdateShift={handleCreateOrUpdateShift}
        handleDeleteShift={handleDeleteShift}
        isEditMode={isEditMode}
        showCalendar={showCalendar}
        showSuccess={showSuccess}
        fadeAnim={fadeAnim}
        connectedStores={connectedStores}
        selectedStoreId={selectedStoreId}
        onStoreChange={setSelectedStoreId}
        isLoading={isLoading}
        isDeleting={isDeleting}
      />
    </>
  );
};
