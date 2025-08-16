import { Alert } from "react-native";
import { updateTask } from "@/services/firebase/firebase-extended-task";
import { ExtendedTask, TaskTag } from "@/common/common-models/model-shift/shiftTypes";
import { TaskEditFormData, DatePickerState } from "./types";

export const useTaskEditHandlers = (
  task: ExtendedTask,
  formData: TaskEditFormData,
  setFormData: React.Dispatch<React.SetStateAction<TaskEditFormData>>,
  setShowDatePicker: React.Dispatch<React.SetStateAction<DatePickerState>>,
  setSaving: (saving: boolean) => void,
  onTaskUpdated: () => void,
  onClose: () => void
) => {
  const handleToggleTag = (tag: TaskTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleAddTimeRange = () => {
    if (formData.restrictedStartTime && formData.restrictedEndTime) {
      setFormData(prev => ({
        ...prev,
        restrictedTimeRanges: [
          ...prev.restrictedTimeRanges,
          {
            startTime: prev.restrictedStartTime,
            endTime: prev.restrictedEndTime,
          },
        ],
        restrictedStartTime: "",
        restrictedEndTime: "",
      }));
    }
  };

  const handleRemoveTimeRange = (index: number) => {
    setFormData(prev => ({
      ...prev,
      restrictedTimeRanges: prev.restrictedTimeRanges.filter((_, i) => i !== index),
    }));
  };

  const handleDateChange = (
    event: any,
    selectedDate: Date | undefined,
    field: "validFrom" | "validTo"
  ) => {
    setShowDatePicker({ field: null, show: false });
    
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [field]: selectedDate,
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("エラー", "タスク名を入力してください");
      return;
    }

    setSaving(true);
    try {
      const updatedTask: Partial<ExtendedTask> = {
        ...formData,
        validFrom: formData.validFrom?.toISOString(),
        validTo: formData.validTo?.toISOString(),
      };

      await updateTask(task.id, updatedTask);
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("エラー", "タスクの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return {
    handleToggleTag,
    handleAddTimeRange,
    handleRemoveTimeRange,
    handleDateChange,
    handleSave,
  };
};