import React from "react";
import { View, Text, TouchableOpacity, Alert, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ExtendedTask,
  TaskPerformance,
  TaskType,
  TaskTag,
  TaskLevel,
} from "@/common/common-models/model-shift/shiftTypes";
import { TaskAnalytics } from "@/common/common-utils/util-task/taskAnalytics";
import { useTaskCardViewStyles } from "./TaskCardView.styles";
import { getOptimizedFlatListProps } from "@/common/common-utils/performance/webOptimization";

interface TaskCardViewProps {
  tasks: ExtendedTask[];
  performances: TaskPerformance[];
  onTaskSelect: (task: ExtendedTask) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskStatusToggle: (task: ExtendedTask) => void;
}

export const TaskCardView: React.FC<TaskCardViewProps> = ({
  tasks,
  performances,
  onTaskSelect,
  onTaskDelete,
  onTaskStatusToggle,
}) => {
  const styles = useTaskCardViewStyles();

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

  const getTypeColor = (type: TaskType): string => {
    switch (type) {
      case "standard":
        return "#4caf50";
      case "time_specific":
        return "#ff9800";
      case "user_defined":
        return "#9c27b0";
      case "class":
        return "#2196f3";
      default:
        return "#9e9e9e";
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

  const getTaskPerformanceScore = (taskId: string): number => {
    const taskPerformances = performances.filter((p) => p.taskId === taskId);
    if (taskPerformances.length === 0) return 0;

    const avgScore =
      taskPerformances.reduce((sum, p) => {
        const score = TaskAnalytics.calculateOverallScore(p);
        return sum + score;
      }, 0) / taskPerformances.length;

    return avgScore;
  };

  const handleMoreOptions = (task: ExtendedTask) => {
    Alert.alert(task.title, "タスクの操作を選択してください", [
      { text: "キャンセル", style: "cancel" },
      { text: "詳細を見る", onPress: () => onTaskSelect(task) },
      {
        text: task.isActive ? "無効にする" : "有効にする",
        onPress: () => onTaskStatusToggle(task),
      },
      {
        text: "削除",
        style: "destructive",
        onPress: () => onTaskDelete(task.id),
      },
    ]);
  };

  const renderTaskCard = ({ item: task }: { item: ExtendedTask }) => {
    const performanceScore = getTaskPerformanceScore(task.id);
    const performanceLevel =
      TaskAnalytics.getPerformanceLevel(performanceScore);

    return (
      <TouchableOpacity
        style={[styles.card, !task.isActive && styles.cardInactive]}
        onPress={() => onTaskSelect(task)}
      >
        {/* カードヘッダー */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.titleWithIcon}>
              {/* タスクアイコン */}
              <View
                style={[
                  styles.taskIconContainer,
                  { backgroundColor: task.color || "#2196F3" },
                ]}
              >
                <Ionicons
                  name={(task.icon as any) || "checkbox-outline"}
                  size={16}
                  color="white"
                />
              </View>
              <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.cardTitle,
                    !task.isActive && styles.inactiveText,
                  ]}
                >
                  {task.title}
                </Text>
                {task.shortName && (
                  <Text
                    style={[
                      styles.shortName,
                      !task.isActive && styles.inactiveText,
                    ]}
                  >
                    {task.shortName}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleMoreOptions(task)}
              style={styles.moreButton}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* タイプとステータスバッジ */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: getTypeColor(task.type) },
              ]}
            >
              <Text style={styles.badgeText}>{getTypeLabel(task.type)}</Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            >
              <Text style={styles.badgeText}>
                {getPriorityLabel(task.priority)}
              </Text>
            </View>
            {!task.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.badgeText}>無効</Text>
              </View>
            )}
          </View>
        </View>

        {/* 説明文 */}
        {task.description && (
          <Text
            style={[
              styles.cardDescription,
              !task.isActive && styles.inactiveText,
            ]}
            numberOfLines={3}
          >
            {task.description}
          </Text>
        )}

        {/* 基本情報 */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {formatTime(task.baseTimeMinutes)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="repeat-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{task.baseCountPerShift}回/日</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="bar-chart-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              難易度{getPriorityLabel(task.difficulty)}
            </Text>
          </View>
        </View>

        {/* 時間制限（時間指定タスクの場合） */}
        {task.type === "time_specific" && task.restrictedStartTime && (
          <View style={styles.timeRestriction}>
            <Ionicons name="alarm-outline" size={16} color="#e65100" />
            <Text style={styles.timeRestrictionText}>
              {task.restrictedStartTime} - {task.restrictedEndTime}
            </Text>
          </View>
        )}

        {/* タグ */}
        {task.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {task.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{getTagLabel(tag)}</Text>
              </View>
            ))}
            {task.tags.length > 3 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>+{task.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* 期間限定情報 */}
        {task.validFrom && task.validTo && (
          <View style={styles.validityRow}>
            <Ionicons name="calendar-outline" size={16} color="#e65100" />
            <Text style={styles.validityText}>
              {task.validFrom.toLocaleDateString()} ～{" "}
              {task.validTo.toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* パフォーマンス情報 */}
        {performanceScore > 0 && (
          <View style={styles.performanceRow}>
            <View style={styles.performanceScore}>
              <Text style={styles.performanceScoreLabel}>パフォーマンス</Text>
              <View
                style={[
                  styles.performanceLevel,
                  { backgroundColor: performanceLevel.color },
                ]}
              >
                <Text style={styles.performanceLevelText}>
                  {performanceLevel.label}
                </Text>
              </View>
            </View>
            <Text style={styles.performanceValue}>
              {(performanceScore * 100).toFixed(0)}点
            </Text>
          </View>
        )}

        {/* カードフッター */}
        <View style={styles.cardFooter}>
          <Text style={styles.updatedText}>
            更新: {task.updatedAt.toLocaleDateString()}
          </Text>
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => onTaskSelect(task)}
            >
              <Ionicons name="eye-outline" size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => onTaskStatusToggle(task)}
            >
              <Ionicons
                name={task.isActive ? "pause-outline" : "play-outline"}
                size={18}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="clipboard-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>タスクがありません</Text>
        <Text style={styles.emptySubtitle}>
          新しいタスクを作成してチームの業務を管理しましょう
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      renderItem={renderTaskCard}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      {...getOptimizedFlatListProps()}
    />
  );
};
