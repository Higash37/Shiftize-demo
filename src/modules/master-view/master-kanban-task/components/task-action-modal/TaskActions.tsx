import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NormalTask, TaskStatus } from "../../types";
import { styles } from "../../TaskActionModal.styles";

interface TaskActionsProps {
  task: NormalTask;
  onStartAction: (task: NormalTask) => void;
  onStatusChange: (task: NormalTask, newStatus: TaskStatus) => void;
  onDelete: (task: NormalTask) => void;
  getStatusActions: (status: TaskStatus) => Array<{
    label: string;
    icon: string;
    color: string;
    newStatus: TaskStatus;
  }>;
}

export const TaskActions: React.FC<TaskActionsProps> = ({
  task,
  onStartAction,
  onStatusChange,
  onDelete,
  getStatusActions,
}) => {
  return (
    <View style={styles.actionSection}>
      <Text style={styles.sectionTitle}>アクション</Text>

      {/* スタートボタン（常に表示） */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: "#007AFF" },
        ]}
        onPress={() => onStartAction(task)}
      >
        <Ionicons name="play" size={20} color="#fff" />
        <Text style={styles.actionButtonText}>スタート</Text>
      </TouchableOpacity>

      {/* ステータス変更ボタン */}
      {getStatusActions(task.status).map((action, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.actionButton,
            { backgroundColor: action.color },
          ]}
          onPress={() =>
            onStatusChange(task, action.newStatus)
          }
        >
          <Ionicons
            name={action.icon as any}
            size={20}
            color="#fff"
          />
          <Text style={styles.actionButtonText}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}

      {/* 削除ボタン */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: "#FF3B30", marginTop: 12 },
        ]}
        onPress={() => onDelete(task)}
      >
        <Ionicons name="trash" size={20} color="#fff" />
        <Text style={styles.actionButtonText}>削除</Text>
      </TouchableOpacity>
    </View>
  );
};