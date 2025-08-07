import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ExtendedTask,
  TaskType,
  TaskTag,
  TaskLevel,
} from "@/common/common-models/model-shift/shiftTypes";
import { useTaskListItemStyles } from "./styles/TaskListItem.styles";

interface TaskListItemProps {
  task: ExtendedTask;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const styles = useTaskListItemStyles();

  const getTypeLabel = (type: TaskType): string => {
    switch (type) {
      case "standard":
        return "通常";
      case "time_specific":
        return "時間指定";
      case "user_defined":
        return "ユーザー定義";
      case "class":
        return "授業";
      default:
        return type;
    }
  };

  const getTagLabel = (tag: TaskTag): string => {
    switch (tag) {
      case "limited_time":
        return "期間限定";
      case "staff_only":
        return "スタッフ限定";
      case "high_priority":
        return "高優先度";
      case "training":
        return "研修";
      case "event":
        return "イベント";
      default:
        return tag;
    }
  };

  const getPriorityColor = (priority: TaskLevel): string => {
    switch (priority) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  const getPriorityLabel = (priority: TaskLevel): string => {
    switch (priority) {
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return priority;
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}時間${remainingMinutes}分`
      : `${hours}時間`;
  };

  const handleMoreOptions = () => {
    Alert.alert("タスクの操作", `${task.title}の操作を選択してください`, [
      { text: "キャンセル", style: "cancel" },
      { text: "編集", onPress: onEdit },
      {
        text: task.isActive ? "無効にする" : "有効にする",
        onPress: onToggleStatus,
      },
      { text: "削除", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View
      style={[styles.container, !task.isActive && styles.inactiveContainer]}
    >
      {/* ヘッダー部分 */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !task.isActive && styles.inactiveText]}>
            {task.title}
          </Text>
          <View style={styles.headerActions}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            >
              <Text style={styles.priorityText}>
                {getPriorityLabel(task.priority)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleMoreOptions}
              style={styles.moreButton}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {task.description ? (
          <Text
            style={[styles.description, !task.isActive && styles.inactiveText]}
          >
            {task.description}
          </Text>
        ) : null}
      </View>

      {/* タイプとタグ */}
      <View style={styles.tagsRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{getTypeLabel(task.type)}</Text>
        </View>
        {task.tags.map((tag) => (
          <View key={tag} style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>{getTagLabel(tag)}</Text>
          </View>
        ))}
      </View>

      {/* 詳細情報 */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatTime(task.baseTimeMinutes)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="repeat-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{task.baseCountPerShift}回/日</Text>
        </View>
        {task.type === "time_specific" && task.restrictedStartTime && (
          <View style={styles.detailItem}>
            <Ionicons name="alarm-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {task.restrictedStartTime}-{task.restrictedEndTime}
            </Text>
          </View>
        )}
      </View>

      {/* 期間限定情報 */}
      {task.validFrom && task.validTo && (
        <View style={styles.validityRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.validityText}>
            {task.validFrom.toLocaleDateString()} ～{" "}
            {task.validTo.toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* 状態表示 */}
      {!task.isActive && (
        <View style={styles.statusRow}>
          <Ionicons name="pause-circle-outline" size={16} color="#f44336" />
          <Text style={styles.inactiveStatusText}>無効</Text>
        </View>
      )}
    </View>
  );
};
