import { useState, useEffect } from "react";
import { EditShiftState } from "./types";

export const useEditShiftState = (newShiftData: any, visible: boolean) => {
  const [state, setState] = useState<EditShiftState>({
    isAddingClassTime: false,
    isManagingTasks: false,
    isAddingTask: false,
    selectedTaskTemplate: null,
    tempTaskStartTime: newShiftData.startTime,
    tempTaskEndTime: newShiftData.endTime,
    customTaskTitle: "",
    isManualInput: false,
    manualStartTime: newShiftData.startTime,
    manualEndTime: newShiftData.endTime,
  });

  // 手動入力値をnewShiftDataに反映
  useEffect(() => {
    if (state.isManualInput) {
      setState(prev => ({
        ...prev,
        manualStartTime: newShiftData.startTime,
        manualEndTime: newShiftData.endTime,
      }));
    }
  }, [state.isManualInput, newShiftData.startTime, newShiftData.endTime]);

  // モーダルが閉じられたときに状態をリセット
  useEffect(() => {
    if (!visible) {
      setState(prev => ({ ...prev, isManualInput: false }));
    }
  }, [visible]);

  const updateState = (updates: Partial<EditShiftState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return {
    state,
    updateState,
  };
};