import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createTask } from "@/services/firebase/firebase-extended-task";
import { updateShift, getShifts } from "@/services/firebase/firebase-shift";
import {
  TaskType,
  TaskTag,
  TimeRange,
  ShiftTaskSlot,
} from "@/common/common-models/model-shift/shiftTypes";
import { useTaskCreateModalStyles } from "./TaskCreateModal.styles";

// Components
import { BasicInfoSection } from "./task-create/BasicInfoSection";
import { TaskTypeSection } from "./task-create/TaskTypeSection";
import { TimeRangeSection } from "./task-create/TimeRangeSection";
import { TagsSection } from "./task-create/TagsSection";
import { PrioritySection } from "./task-create/PrioritySection";
import { AppearanceSection } from "./task-create/AppearanceSection";

// Types
import { TaskFormData, TaskCreateModalProps } from "./task-create/types";

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  visible,
  storeId,
  onClose,
  onTaskCreated,
  initialShiftId,
  initialShiftData,
}) => {
  const styles = useTaskCreateModalStyles();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [formData, setFormData] = useState<TaskFormData>({
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

  const [saving, setSaving] = useState(false);
  const [addToShift, setAddToShift] = useState(false);

  // 初期シフトデータがある場合のフォーム初期化
  useEffect(() => {
    if (initialShiftData && visible) {
      const startHour = parseInt(initialShiftData.startTime.split(":")[0]);
      const endHour = parseInt(initialShiftData.endTime.split(":")[0]);
      const durationHours = endHour - startHour;

      const suggestedType: TaskType =
        durationHours >= 4 ? "standard" : "time_specific";
      const suggestedBaseTime = Math.min(Math.max(durationHours * 15, 15), 60);

      setFormData((prev) => ({
        ...prev,
        type: suggestedType,
        baseTimeMinutes: suggestedBaseTime,
        restrictedTimeRanges:
          suggestedType === "time_specific"
            ? [
                {
                  startTime: initialShiftData.startTime,
                  endTime: initialShiftData.endTime,
                },
              ]
            : [],
      }));

      if (initialShiftId) {
        setAddToShift(true);
      }
    }
  }, [initialShiftData, initialShiftId, visible]);

  const updateFormData = (field: keyof TaskFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTimeRange = () => {
    if (formData.restrictedStartTime && formData.restrictedEndTime) {
      const newRange: TimeRange = {
        startTime: formData.restrictedStartTime,
        endTime: formData.restrictedEndTime,
      };

      setFormData((prev) => ({
        ...prev,
        restrictedTimeRanges: [...prev.restrictedTimeRanges, newRange],
        restrictedStartTime: "",
        restrictedEndTime: "",
      }));
    }
  };

  const removeTimeRange = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      restrictedTimeRanges: prev.restrictedTimeRanges.filter((_, i) => i !== index),
    }));
  };

  const toggleTag = (tag: TaskTag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const hasValidationErrors = () => {
    if (!formData.title) return true;
    if (formData.shortName && formData.shortName.length !== 2) return true;
    return false;
  };

  const handleSave = async () => {
    if (hasValidationErrors()) {
      Alert.alert("エラー", "必須項目を正しく入力してください");
      return;
    }

    setSaving(true);

    try {
      const taskData = {
        storeId,
        title: formData.title,
        shortName: formData.shortName || formData.title.substring(0, 2),
        description: formData.description || "",
        type: formData.type,
        baseTimeMinutes: formData.baseTimeMinutes,
        baseCountPerShift: formData.baseCountPerShift,
        restrictedTimeRanges:
          formData.type === "time_specific"
            ? formData.restrictedTimeRanges
            : undefined,
        requiredRole: formData.requiredRole,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        priority: formData.priority,
        difficulty: formData.difficulty,
        metadata: {
          color: formData.color,
          icon: formData.icon,
        },
        validFrom: formData.validFrom?.toISOString(),
        validTo: formData.validTo?.toISOString(),
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createdTaskId = await createTask(taskData);

      // シフトに追加する場合
      if (addToShift && initialShiftId && initialShiftData && createdTaskId) {
        const shifts = await getShifts(storeId);
        const targetShift = shifts.find((s) => s.id === initialShiftId);

        if (targetShift) {
          const taskSlot: ShiftTaskSlot = {
            taskId: createdTaskId,
            assignedAt: initialShiftData.startTime,
            actualMinutes: formData.baseTimeMinutes,
            status: "pending",
          };

          await updateShift(
            storeId,
            initialShiftId,
            {
              tasks: [...(targetShift.tasks || []), taskSlot],
            },
            targetShift.userId
          );
        }
      }

      Alert.alert("成功", "タスクを作成しました");
      onTaskCreated();
      handleClose();
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("エラー", "タスクの作成に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
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
    setAddToShift(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>新しいタスク</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.saveButton,
                (saving || hasValidationErrors()) && styles.saveButtonDisabled,
              ]}
              disabled={saving || hasValidationErrors()}
            >
              <Text style={styles.saveButtonText}>
                {saving
                  ? "保存中..."
                  : hasValidationErrors()
                  ? "入力内容を確認してください"
                  : "保存"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <BasicInfoSection
              formData={formData}
              onUpdateFormData={updateFormData}
              styles={styles}
            />

            <TaskTypeSection
              formData={formData}
              onUpdateFormData={updateFormData}
              styles={styles}
            />

            <TimeRangeSection
              formData={formData}
              onUpdateFormData={updateFormData}
              onAddTimeRange={addTimeRange}
              onRemoveTimeRange={removeTimeRange}
              styles={styles}
            />

            <TagsSection
              formData={formData}
              onToggleTag={toggleTag}
              styles={styles}
            />

            <PrioritySection
              formData={formData}
              onUpdateFormData={updateFormData}
              styles={styles}
            />

            <AppearanceSection
              formData={formData}
              onUpdateFormData={updateFormData}
              styles={styles}
            />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};