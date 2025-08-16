import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { styles } from "../../MasterShiftCreate.styles";

interface MasterShiftActionsProps {
  isEditMode: boolean;
  isLoading: boolean;
  onSave: () => void;
  onDelete?: () => void;
}

export const MasterShiftActions: React.FC<MasterShiftActionsProps> = ({
  isEditMode,
  isLoading,
  onSave,
  onDelete,
}) => {
  return (
    <>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={onSave}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>
          {isEditMode ? "更新する" : "保存する"}
        </Text>
      </TouchableOpacity>

      {isEditMode && onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Text style={styles.deleteButtonText}>シフトを削除</Text>
        </TouchableOpacity>
      )}
    </>
  );
};