import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { KanbanTask, TaskStatus } from "./types";

interface KanbanTaskCardProps {
  task: KanbanTask;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onPress: () => void;
}

export const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
  onPress,
}) => {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return styles.priorityHigh;
      case "medium":
        return styles.priorityMedium;
      case "low":
        return styles.priorityLow;
      default:
        return styles.priorityLow;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#d32f2f";
      case "medium":
        return "#ef6c00";
      case "low":
        return "#2e7d32";
      default:
        return "#2e7d32";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return "低";
    }
  };

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    switch (currentStatus) {
      case "not_started":
        return "in_progress";
      case "in_progress":
        return "completed";
      case "completed":
        return null; // 完了済みからは進められない
      default:
        return null;
    }
  };

  const getPrevStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    switch (currentStatus) {
      case "completed":
        return "in_progress";
      case "in_progress":
        return "not_started";
      case "not_started":
        return null; // 未実施からは戻れない
      default:
        return null;
    }
  };

  const isOverdue =
    task.dueDate && task.dueDate < new Date() && task.status !== "completed";

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.taskCard,
          { borderLeftColor: getPriorityColor(task.priority) },
        ]}
      >
        {/* 公開タスクバッジ */}
        {task.isPublic && (
          <View style={styles.publicBadge}>
            <Text style={styles.publicBadgeText}>公開</Text>
          </View>
        )}

        {/* タスクタイトル */}
        <Text style={styles.taskTitle} numberOfLines={2}>
          {task.title}
        </Text>

        {/* タスクの説明 */}
        {task.description ? (
          <Text style={styles.taskDescription} numberOfLines={3}>
            {task.description}
          </Text>
        ) : null}

        {/* 期限 */}
        {task.dueDate && (
          <View style={styles.dueDateContainer}>
            <Ionicons
              name="calendar-outline"
              size={12}
              color={isOverdue ? "#d32f2f" : "#666"}
            />
            <Text style={[styles.dueDate, isOverdue && styles.overdue]}>
              {task.dueDate.toLocaleDateString("ja-JP")}
            </Text>
          </View>
        )}

        {/* タスクメタ情報 */}
        <View style={styles.taskMeta}>
          <Text style={styles.taskCreator}>{task.createdByName}</Text>
          <Text style={[styles.taskPriority, getPriorityStyle(task.priority)]}>
            {getPriorityLabel(task.priority)}
          </Text>
        </View>

        {/* アクションボタン */}
        <View style={styles.taskActions}>
          {/* 前のステータスに戻すボタン */}
          {getPrevStatus(task.status) && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                onStatusChange(task.id, getPrevStatus(task.status)!)
              }
            >
              <Ionicons name="chevron-back" size={16} color="#666" />
            </TouchableOpacity>
          )}

          {/* 次のステータスに進めるボタン */}
          {getNextStatus(task.status) && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                onStatusChange(task.id, getNextStatus(task.status)!)
              }
            >
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          )}

          {/* 削除ボタン */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(task.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};
