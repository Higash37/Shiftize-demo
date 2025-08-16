import React from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ModalActionsProps {
  isLoading: boolean;
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
  styles: any;
}

export const ModalActions: React.FC<ModalActionsProps> = ({
  isLoading,
  onSave,
  onClose,
  onDelete,
  styles,
}) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={onClose}
        disabled={isLoading}
      >
        <Text style={styles.cancelButtonText}>キャンセル</Text>
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={onDelete}
          disabled={isLoading}
        >
          <Text style={styles.deleteButtonText}>削除</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={onSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>保存</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};