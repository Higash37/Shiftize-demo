import React from "react";
import {
  View,
  Modal,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTaskCreateModalStyles } from "./TaskCreateModal.styles";

// Components
import { TaskEditHeader } from "./task-edit/TaskEditHeader";
import { BasicInfoSection } from "./task-edit/BasicInfoSection";
import { TaskTypeSection } from "./task-edit/TaskTypeSection";
import { TaskEditActions } from "./task-edit/TaskEditActions";

// Hooks
import { useTaskEditState } from "./task-edit/useTaskEditState";
import { useTaskEditHandlers } from "./task-edit/useTaskEditHandlers";

// Types
import { TaskEditModalProps } from "./task-edit/types";

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  visible,
  task,
  onClose,
  onTaskUpdated,
}) => {
  const styles = useTaskCreateModalStyles();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    formData,
    setFormData,
    updateFormData,
    showDatePicker,
    setShowDatePicker,
    saving,
    setSaving,
  } = useTaskEditState(task);

  const {
    handleToggleTag,
    handleAddTimeRange,
    handleRemoveTimeRange,
    handleDateChange,
    handleSave,
  } = useTaskEditHandlers(
    task,
    formData,
    setFormData,
    setShowDatePicker,
    setSaving,
    onTaskUpdated,
    onClose
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}>
          <TaskEditHeader onClose={onClose} />

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <BasicInfoSection
              formData={formData}
              onUpdateFormData={updateFormData}
            />

            <TaskTypeSection
              formData={formData}
              onUpdateFormData={updateFormData}
            />
          </ScrollView>

          <TaskEditActions
            saving={saving}
            onSave={handleSave}
            onClose={onClose}
          />

          {showDatePicker.show && (
            <DateTimePicker
              value={
                showDatePicker.field === "validFrom"
                  ? formData.validFrom || new Date()
                  : formData.validTo || new Date()
              }
              mode="date"
              display="default"
              onChange={(event, selectedDate) =>
                handleDateChange(event, selectedDate, showDatePicker.field!)
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};