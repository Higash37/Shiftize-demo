import { useState, useEffect } from "react";
import { ExtendedTask } from "@/common/common-models/model-shift/shiftTypes";
import { TaskEditFormData, DatePickerState } from "./types";

export const useTaskEditState = (task: ExtendedTask) => {
  const [formData, setFormData] = useState<TaskEditFormData>({
    title: "",
    shortName: "",
    description: "",
    type: "standard",
    baseTimeMinutes: 30,
    baseCountPerShift: 1,
    restrictedTimeRanges: [],
    restrictedStartTime: "",
    restrictedEndTime: "",
    requiredRole: undefined,
    tags: [],
    priority: "medium",
    difficulty: "medium",
    color: "#2196F3",
    icon: "checkbox-outline",
    validFrom: undefined,
    validTo: undefined,
    isActive: true,
  });

  const [showDatePicker, setShowDatePicker] = useState<DatePickerState>({
    field: null,
    show: false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        shortName: task.shortName || "",
        description: task.description || "",
        type: task.type || "standard",
        baseTimeMinutes: task.baseTimeMinutes || 30,
        baseCountPerShift: task.baseCountPerShift || 1,
        restrictedTimeRanges: task.restrictedTimeRanges || [],
        restrictedStartTime: task.restrictedStartTime || "",
        restrictedEndTime: task.restrictedEndTime || "",
        requiredRole: task.requiredRole,
        tags: task.tags || [],
        priority: task.priority || "medium",
        difficulty: task.difficulty || "medium",
        color: task.color || "#2196F3",
        icon: task.icon || "checkbox-outline",
        validFrom: task.validFrom ? new Date(task.validFrom) : undefined,
        validTo: task.validTo ? new Date(task.validTo) : undefined,
        isActive: task.isActive !== false,
      });
    }
  }, [task]);

  const updateFormData = <K extends keyof TaskEditFormData>(
    field: K,
    value: TaskEditFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    setFormData,
    updateFormData,
    showDatePicker,
    setShowDatePicker,
    saving,
    setSaving,
  };
};