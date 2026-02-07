import React, { useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { Alert } from "react-native";
import {
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
} from "@/common/common-models/ModelIndex";
import { ShiftStatusConfig } from "../GanttChartTypes";
import { EditShiftModalView } from "../view-modals/EditShiftModalView";
import { AddShiftModalView } from "../view-modals/AddShiftModalView";
import { RecruitmentShiftService } from "@/services/recruitment-shift-service/recruitmentShiftService";

export interface NewShiftData {
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
  nickname: string;
  status: ShiftStatus;
  classes: ClassTimeSlot[];
  extendedTasks?: any[];
}

export interface ShiftModalRendererHandle {
  openEdit: (shift: ShiftItem) => void;
  openAdd: (data: NewShiftData) => void;
}

interface ShiftModalRendererProps {
  users: Array<{ uid: string; nickname: string; color?: string; hourlyWage?: number }>;
  timeOptions: string[];
  statusConfigs: ShiftStatusConfig[];
  styles: any;
  saveShift: (editingShift: ShiftItem | null, newShiftData: any) => Promise<void>;
  deleteShift: (shift: { id: string; status: string }) => Promise<void>;
  updateShiftStatus: (shiftId: string, status: ShiftStatus) => Promise<void>;
  user: { uid: string; storeId?: string; nickname?: string; role?: string } | null;
  shifts: ShiftItem[];
  onRecruitmentRefresh: () => void;
}

const DEFAULT_SHIFT_DATA: NewShiftData = {
  date: "",
  startTime: "09:00",
  endTime: "11:00",
  userId: "",
  nickname: "",
  status: "approved",
  classes: [],
  extendedTasks: [],
};

const ShiftModalRendererInner: React.ForwardRefRenderFunction<
  ShiftModalRendererHandle,
  ShiftModalRendererProps
> = (
  {
    users,
    timeOptions,
    statusConfigs,
    styles,
    saveShift,
    deleteShift,
    updateShiftStatus,
    user,
    shifts,
    onRecruitmentRefresh,
  },
  ref
) => {
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShiftData, setNewShiftData] = useState<NewShiftData>(DEFAULT_SHIFT_DATA);
  const [isLoading] = useState(false);

  // refs で最新のpropsを参照（コールバックを安定化するため）
  const usersRef = React.useRef(users);
  usersRef.current = users;

  useImperativeHandle(
    ref,
    () => ({
      openEdit: (shift: ShiftItem) => {
        const userObj = usersRef.current.find((u) => u.uid === shift.userId);
        setEditingShift(shift);
        setNewShiftData({
          date: shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
          userId: shift.userId,
          nickname: userObj ? userObj.nickname : "",
          status: shift.status,
          classes: shift.classes || [],
          extendedTasks: shift.extendedTasks || [],
        });
        setShowEditModal(true);
      },
      openAdd: (data: NewShiftData) => {
        setEditingShift(null);
        setNewShiftData(data);
        setShowAddModal(true);
      },
    }),
    []
  );

  const handleSaveShift = useCallback(async () => {
    if (!newShiftData.date || !newShiftData.startTime || !newShiftData.endTime) {
      Alert.alert("エラー", "日付と時間を正しく入力してください。");
      return;
    }

    if (!newShiftData.userId) {
      Alert.alert("エラー", "ユーザーまたは募集を選択してください。");
      return;
    }

    try {
      if (newShiftData.userId === "recruitment") {
        const recruitmentShiftData = {
          storeId: user?.storeId || "",
          date: newShiftData.date,
          startTime: newShiftData.startTime,
          endTime: newShiftData.endTime,
          subject: "",
          notes: "",
          createdBy: user?.uid || "",
          status: "open" as const,
        };

        try {
          await RecruitmentShiftService.createRecruitmentShift(recruitmentShiftData);
          Alert.alert("成功", "募集シフトを作成しました。");
        } catch (recruitmentError: any) {
          if (recruitmentError?.code) {
            Alert.alert(
              "エラー",
              `募集シフトの作成に失敗しました。\nエラーコード: ${recruitmentError.code}\nメッセージ: ${recruitmentError.message}`
            );
          } else {
            Alert.alert(
              "エラー",
              `募集シフトの作成に失敗しました。\n${recruitmentError?.message || "不明なエラーが発生しました。"}`
            );
          }
          throw recruitmentError;
        }
      } else {
        const shiftToUpdate = showEditModal ? editingShift : null;
        await saveShift(shiftToUpdate, newShiftData);
      }

      setShowEditModal(false);
      setShowAddModal(false);
      setEditingShift(null);
      setNewShiftData(DEFAULT_SHIFT_DATA);
    } catch (error) {
      Alert.alert("エラー", "シフトの保存に失敗しました。");
    }
  }, [editingShift, newShiftData, saveShift, showEditModal, user]);

  const handleDeleteShift = useCallback(async () => {
    if (!editingShift) return;

    const shiftId = editingShift.id;

    if (shiftId.startsWith("recruitment-")) {
      const recruitmentShiftId = shiftId.replace("recruitment-", "");
      try {
        await RecruitmentShiftService.deleteRecruitmentShift(recruitmentShiftId);
        onRecruitmentRefresh();
      } catch (error) {
        Alert.alert("エラー", "募集シフトの削除に失敗しました");
      }
      setShowEditModal(false);
      return;
    }

    const targetShift = editingShift || shifts.find((s) => s.id === shiftId);
    if (targetShift) {
      await deleteShift(targetShift);
    } else {
      await updateShiftStatus(shiftId, "deleted");
    }

    setShowEditModal(false);
  }, [editingShift, deleteShift, updateShiftStatus, shifts, onRecruitmentRefresh]);

  const handleEditChange = useCallback(
    (field: string, value: any) => {
      setNewShiftData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleAddChange = useCallback(
    (field: string, value: any) => {
      if (field === "userData") {
        setNewShiftData((prev) => ({
          ...prev,
          userId: value.userId,
          nickname: value.nickname,
        }));
      } else {
        setNewShiftData((prev) => ({ ...prev, [field]: value }));
      }
    },
    []
  );

  const closeEditModal = useCallback(() => setShowEditModal(false), []);
  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  return (
    <>
      {showEditModal && (
        <EditShiftModalView
          visible={showEditModal}
          newShiftData={newShiftData}
          users={users}
          timeOptions={timeOptions}
          statusConfigs={statusConfigs}
          isLoading={isLoading}
          styles={styles}
          extendedTasks={[]}
          onChange={handleEditChange}
          onClose={closeEditModal}
          onSave={handleSaveShift}
          onDelete={handleDeleteShift}
        />
      )}
      {showAddModal && (
        <AddShiftModalView
          visible={showAddModal}
          newShiftData={newShiftData}
          users={users}
          timeOptions={timeOptions}
          statusConfigs={statusConfigs}
          isLoading={isLoading}
          styles={styles}
          extendedTasks={[]}
          onChange={handleAddChange}
          onClose={closeAddModal}
          onSave={handleSaveShift}
        />
      )}
    </>
  );
};

export const ShiftModalRenderer = forwardRef(ShiftModalRendererInner);
