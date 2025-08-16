import React from "react";
import {
  View,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";

// Components
import { ShiftModalHeader } from "./shift-modal/ShiftModalHeader";
import { UserSelectSection } from "./shift-modal/UserSelectSection";
import { TimeSelectSection } from "./shift-modal/TimeSelectSection";
import { ShiftModalActions } from "./shift-modal/ShiftModalActions";

// Hooks
import { useShiftModalState } from "./shift-modal/useShiftModalState";
import { useShiftModalHandlers } from "./shift-modal/useShiftModalHandlers";

// Types
export { ShiftData, ShiftModalProps } from "./shift-modal/types";
import { ShiftModalProps } from "./shift-modal/types";

export const ShiftModal: React.FC<ShiftModalProps> = ({
  visible,
  mode,
  shiftData,
  date,
  users,
  onClose,
  onSave,
  onDelete,
}) => {
  const { users: localUsers } = useUsers();
  
  const {
    selectedUserId,
    setSelectedUserId,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    subject,
    setSubject,
    status,
    setStatus,
    classes,
    setClasses,
    extendedTasks,
    loading,
    setLoading,
    connectedStoreUsers,
    showClassForm,
    setShowClassForm,
    classFormData,
    setClassFormData,
    resetForm,
  } = useShiftModalState(mode, shiftData, date);

  const {
    validateForm,
    handleSave,
    handleDelete,
    handleAddClass,
    handleRemoveClass,
    handleClose,
  } = useShiftModalHandlers(
    mode,
    date,
    shiftData,
    selectedUserId,
    startTime,
    endTime,
    subject,
    status,
    classes,
    extendedTasks,
    classFormData,
    setClasses,
    setShowClassForm,
    setClassFormData,
    resetForm,
    onSave,
    onDelete,
    onClose
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ShiftModalHeader mode={mode} onClose={handleClose} />

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            <UserSelectSection
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              users={users}
              connectedStoreUsers={connectedStoreUsers}
              disabled={mode === "delete"}
            />

            <TimeSelectSection
              startTime={startTime}
              endTime={endTime}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
            />
          </ScrollView>

          <ShiftModalActions
            mode={mode}
            loading={loading}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={handleClose}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: layout.spacing.large,
    width: Platform.OS === "web" ? 500 : "90%",
    maxHeight: "80%",
    ...shadows.large,
  },
  formContainer: {
    marginTop: layout.spacing.medium,
    marginBottom: layout.spacing.medium,
  },
});