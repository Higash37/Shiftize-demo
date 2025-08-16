import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import { useAuth } from "@/services/auth/useAuth";

// Components
import { TimeInputSection } from "./edit-shift-modal/TimeInputSection";
import { UserSelectSection } from "./edit-shift-modal/UserSelectSection";
import { StatusSelectSection } from "./edit-shift-modal/StatusSelectSection";
import { ModalActions } from "./edit-shift-modal/ModalActions";

// Hooks
import { useEditShiftState } from "./edit-shift-modal/useEditShiftState";
import { useTimeHandlers } from "./edit-shift-modal/useTimeHandlers";

// Types
import { EditShiftModalViewProps } from "./edit-shift-modal/types";

export const EditShiftModalView: React.FC<EditShiftModalViewProps> = (props) => {
  const { user, role } = useAuth();
  const {
    visible,
    newShiftData,
    users,
    timeOptions,
    statusConfigs,
    isLoading,
    styles,
    onChange,
    onClose,
    onSave,
    onDelete,
    extendedTasks = [],
  } = props;

  const { state, updateState } = useEditShiftState(newShiftData, visible);
  const { handleTimeChange, handleToggleManualInput } = useTimeHandlers(
    onChange,
    updateState
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, Platform.OS === "web" && styles.modalContentDesktop]}>
          <View style={styles.header}>
            <Text style={styles.title}>シフト編集</Text>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <UserSelectSection
              users={users}
              newShiftData={newShiftData}
              onChange={onChange}
            />

            <TimeInputSection
              timeOptions={timeOptions}
              newShiftData={newShiftData}
              onChange={onChange}
              isManualInput={state.isManualInput}
              manualStartTime={state.manualStartTime}
              manualEndTime={state.manualEndTime}
              onTimeChange={handleTimeChange}
              onToggleManualInput={handleToggleManualInput}
            />

            <StatusSelectSection
              statusConfigs={statusConfigs}
              newShiftData={newShiftData}
              onChange={onChange}
              userRole={role}
            />
          </ScrollView>

          <ModalActions
            isLoading={isLoading}
            onSave={onSave}
            onClose={onClose}
            onDelete={() => onDelete(newShiftData)}
            styles={styles}
          />
        </View>
      </View>
    </Modal>
  );
};