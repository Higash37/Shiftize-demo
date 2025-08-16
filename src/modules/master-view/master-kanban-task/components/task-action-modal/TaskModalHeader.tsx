import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../TaskActionModal.styles";
import { NormalTask } from "../../types";

interface TaskModalHeaderProps {
  onClose: () => void;
  onEdit: (task: NormalTask) => void;
  task: NormalTask;
}

export const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({
  onClose,
  onEdit,
  task,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={24} color="#666" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>タスク詳細</Text>
      <TouchableOpacity onPress={() => onEdit(task)}>
        <Ionicons name="create" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};