import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NormalTask } from "../../types";
import { styles } from "../../TaskActionModal.styles";

interface TaskDescriptionProps {
  task: NormalTask;
  onEditDescription: () => void;
}

export const TaskDescription: React.FC<TaskDescriptionProps> = ({
  task,
  onEditDescription,
}) => {
  return (
    <View style={styles.rulesSection}>
      <Text style={styles.sectionTitle}>詳細・ルール</Text>
      <TouchableOpacity
        style={styles.descriptionInput}
        onPress={onEditDescription}
      >
        <Text
          style={[
            styles.descriptionText,
            { color: task.description ? "#333" : "#999" },
          ]}
        >
          {task.description || "詳細・ルールを入力してください"}
        </Text>
        <Ionicons name="create" size={16} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};