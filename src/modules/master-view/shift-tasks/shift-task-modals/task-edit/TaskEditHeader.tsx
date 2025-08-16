import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTaskCreateModalStyles } from "../TaskCreateModal.styles";

interface TaskEditHeaderProps {
  onClose: () => void;
}

export const TaskEditHeader: React.FC<TaskEditHeaderProps> = ({ onClose }) => {
  const styles = useTaskCreateModalStyles();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>タスク編集</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
};