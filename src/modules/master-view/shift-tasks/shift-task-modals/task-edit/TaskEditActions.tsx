import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useTaskCreateModalStyles } from "../TaskCreateModal.styles";

interface TaskEditActionsProps {
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}

export const TaskEditActions: React.FC<TaskEditActionsProps> = ({
  saving,
  onSave,
  onClose,
}) => {
  const styles = useTaskCreateModalStyles();

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={onClose}
        disabled={saving}
      >
        <Text style={styles.cancelButtonText}>キャンセル</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "更新中..." : "更新"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};