import { useCallback } from "react";
import { Alert } from "react-native";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { useGanttShiftActions } from "../gantt-chart-common/useGanttShiftActions";
import { useAuth } from "@/services/auth/useAuth";
import { GanttState, BatchModalState, GanttHandlers } from "./types";

interface UseGanttHandlersProps {
  state: GanttState;
  updateState: (updates: Partial<GanttState>) => void;
  batchModal: BatchModalState;
  setBatchModal: (modal: BatchModalState) => void;
  users: Array<{ uid: string; nickname: string; color?: string }>;
  onShiftUpdate?: () => void;
  visibleShifts: ShiftItem[];
}

export const useGanttHandlers = ({
  state,
  updateState,
  batchModal,
  setBatchModal,
  users,
  onShiftUpdate,
  visibleShifts,
}: UseGanttHandlersProps): GanttHandlers => {
  const { user } = useAuth();
  const { saveShift, deleteShift, updateShiftStatus } = useGanttShiftActions({
    user,
    users,
    onShiftUpdate,
  });

  const onShiftPress = useCallback((shift: ShiftItem, action: string) => {
    switch (action) {
      case "edit":
        updateState({
          editingShift: shift,
          showEditModal: true,
          editModalType: "edit",
        });
        break;
      case "copy":
        updateState({
          editingShift: { ...shift, id: "" },
          showEditModal: true,
          editModalType: "copy",
        });
        break;
      case "delete":
        updateState({
          editingShift: shift,
          showEditModal: true,
          editModalType: "delete",
        });
        break;
    }
  }, [updateState]);

  const onAddShift = useCallback((
    date: string,
    userId: string,
    timeSlot?: { start: string; end: string }
  ) => {
    const selectedUser = users.find((u) => u.uid === userId);
    if (!selectedUser) return;

    const newShift: ShiftItem = {
      id: "",
      storeId: user?.storeId || "",
      userId,
      nickname: selectedUser.nickname,
      date,
      startTime: timeSlot?.start || "09:00",
      endTime: timeSlot?.end || "18:00",
      status: "pending",
      classes: [],
      extendedTasks: [],
    };

    updateState({
      editingShift: newShift,
      showAddModal: true,
    });
  }, [users, user?.storeId, updateState]);

  const onEditShift = useCallback((shift: ShiftItem) => {
    onShiftPress(shift, "edit");
  }, [onShiftPress]);

  const onDeleteShift = useCallback((shift: ShiftItem) => {
    onShiftPress(shift, "delete");
  }, [onShiftPress]);

  const onBatchAction = useCallback((type: "approve" | "delete") => {
    const pendingShifts = visibleShifts.filter((shift) => shift.status === "pending");
    
    if (pendingShifts.length === 0) {
      Alert.alert(
        "対象なし", 
        type === "approve" ? "承認待ちのシフトがありません" : "削除対象のシフトがありません"
      );
      return;
    }

    setBatchModal({ visible: true, type });
  }, [visibleShifts, setBatchModal]);

  const onViewModeChange = useCallback((mode: "gantt" | "calendar" | "compact") => {
    updateState({ viewMode: mode });
  }, [updateState]);

  const onColorModeChange = useCallback((mode: "status" | "user") => {
    updateState({ colorMode: mode });
  }, [updateState]);

  return {
    onShiftPress,
    onAddShift,
    onEditShift,
    onDeleteShift,
    onBatchAction,
    onViewModeChange,
    onColorModeChange,
  };
};