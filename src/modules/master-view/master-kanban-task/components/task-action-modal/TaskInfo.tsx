import React from "react";
import { View, Text } from "react-native";
import { NormalTask } from "../../types";
import { formatTimeAgo } from "@/common/common-utils/timeUtils";
import { styles } from "../../TaskActionModal.styles";

interface TaskInfoProps {
  task: NormalTask;
}

export const TaskInfo: React.FC<TaskInfoProps> = ({ task }) => {
  return (
    <View style={styles.taskInfo}>
      <Text style={styles.taskTitle}>{task.title}</Text>

      {/* 担当者情報 */}
      <View style={styles.assigneeInfo}>
        <Text style={styles.assigneeText}>
          作成者: {task.createdByName}
        </Text>
        {task.currentAssignedToName && (
          <Text style={styles.assigneeText}>
            実施中: {task.currentAssignedToName}
          </Text>
        )}
      </View>

      {/* 最終更新時間 */}
      <Text style={styles.lastUpdateText}>
        最終更新:{" "}
        {formatTimeAgo(task.lastActionAt || task.updatedAt)}
      </Text>

      {/* 優先度と日程情報 */}
      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>
          優先度:{" "}
          {task.priority === "high"
            ? "高"
            : task.priority === "medium"
            ? "中"
            : "低"}
        </Text>
        {task.startDate && (
          <Text style={styles.metaText}>
            開始予定:{" "}
            {new Date(task.startDate).toLocaleDateString("ja-JP", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        )}
        {task.dueDate && (
          <Text style={styles.metaText}>
            期限:{" "}
            {new Date(task.dueDate).toLocaleDateString("ja-JP", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        )}
      </View>
    </View>
  );
};