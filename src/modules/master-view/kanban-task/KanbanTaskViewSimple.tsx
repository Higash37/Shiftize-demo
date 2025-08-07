import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadows } from "@/common/common-constants/ThemeConstants";
import { KanbanTask, KanbanColumn, TaskStatus } from "./types";
import { useAuth } from "../../../services/auth/useAuth";
import { theme } from "../../../common/common-theme/ThemeDefinition";
import { kanbanTaskService } from "./kanban-task-service";

export const KanbanTaskView: React.FC = () => {
  const { user } = useAuth();
  const colors = theme.colors;
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(true);

  // カンバンカラムの定義
  const columns: KanbanColumn[] = [
    {
      id: "not_started",
      title: "未実施",
      color: colors.text.secondary,
      tasks: tasks.filter((task) => task.status === "not_started"),
    },
    {
      id: "in_progress",
      title: "実施中",
      color: colors.warning,
      tasks: tasks.filter((task) => task.status === "in_progress"),
    },
    {
      id: "completed",
      title: "実施済み",
      color: colors.success,
      tasks: tasks.filter((task) => task.status === "completed"),
    },
  ];

  useEffect(() => {
    loadTasks();
  }, [user?.storeId]);

  const loadTasks = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      const tasksData = await kanbanTaskService.getTasks(user.storeId);
      setTasks(tasksData);
    } catch (error) {
      Alert.alert("エラー", "タスクの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* ヘッダー */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e0e0e0",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
          カンバンタスク管理
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => Alert.alert("実装中", "タスク作成機能は実装中です")}
        >
          <Ionicons name="add" size={24} color={colors.text.white} />
        </TouchableOpacity>
      </View>

      {/* カンバンボード */}
      <ScrollView
        horizontal
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        {columns.map((column) => (
          <View
            key={column.id}
            style={{
              width: 250,
              marginRight: 12,
              backgroundColor: "#fff",
              borderRadius: 8,
              ...shadows.card,
            }}
          >
            {/* カラムヘッダー */}
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                backgroundColor: column.color,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
                {column.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {column.tasks.length}
              </Text>
            </View>

            {/* タスクリスト */}
            <ScrollView
              style={{
                flex: 1,
                maxHeight: 500,
                paddingHorizontal: 8,
                paddingVertical: 8,
              }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {column.tasks.map((task) => (
                <View
                  key={task.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 8,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      task.priority === "high"
                        ? "#d32f2f"
                        : task.priority === "medium"
                        ? "#ef6c00"
                        : "#2e7d32",
                    ...shadows.listItem,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#333",
                      marginBottom: 4,
                    }}
                  >
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#666",
                        lineHeight: 16,
                        marginBottom: 8,
                      }}
                      numberOfLines={3}
                    >
                      {task.description}
                    </Text>
                  )}
                  <Text style={{ fontSize: 12, color: "#999" }}>
                    {task.createdByName}
                  </Text>
                </View>
              ))}

              {column.tasks.length === 0 && (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Text
                    style={{ fontSize: 14, color: "#999", fontStyle: "italic" }}
                  >
                    タスクがありません
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
