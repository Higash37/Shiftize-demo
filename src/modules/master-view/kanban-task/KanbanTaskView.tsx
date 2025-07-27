import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NormalTask, KanbanColumn, TaskStatus } from "./types";
import { useAuth } from "../../../services/auth/useAuth";
import { theme } from "../../../common/common-theme/ThemeDefinition";
import { normalTaskService } from "./normal-task-service";
import { SimpleTaskCreateModal } from "./SimpleTaskCreateModal";
import { TaskActionModal } from "./TaskActionModal";
import { formatTimeAgo } from "../../../common/common-utils/timeUtils";

export const KanbanTaskView: React.FC = () => {
  const { user } = useAuth();
  const colors = theme.colors;
  const [tasks, setTasks] = useState<NormalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<NormalTask | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

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
    let unsubscribe: (() => void) | undefined;

    const setupRealtimeListener = async () => {
      if (!user?.storeId) {
        return;
      }

      try {
        setLoading(true);

        // リアルタイム監視を設定
        unsubscribe = normalTaskService.watchTasks(
          user.storeId,
          (tasksData) => {
            setTasks(tasksData);
            setLoading(false);
          }
        );
      } catch (error) {
        Alert.alert("エラー", "タスクの読み込みに失敗しました");
        setLoading(false);
      }
    };

    setupRealtimeListener();

    // クリーンアップ関数
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.storeId]);

  const loadTasks = async () => {
    // この関数は現在使用されていませんが、必要に応じて手動リロード用に保持
  };

  const handleStatusChange = async (
    task: NormalTask,
    newStatus: TaskStatus
  ) => {
    try {
      await normalTaskService.updateTaskStatus(
        task.id,
        newStatus,
        user?.uid,
        user?.nickname
      );

      Alert.alert("成功", "タスクのステータスが更新されました");
    } catch (error) {
      Alert.alert("エラー", "ステータスの更新に失敗しました");
    }
  };

  const handleStartAction = async (task: NormalTask) => {
    try {
      await normalTaskService.updateTaskStatus(
        task.id,
        "in_progress",
        user?.uid,
        user?.nickname
      );
      Alert.alert("成功", "タスクを開始しました");
    } catch (error) {
      Alert.alert("エラー", "タスクの開始に失敗しました");
    }
  };

  const handleEditTask = (task: NormalTask) => {
    setSelectedTask(task);
    setEditModalVisible(true);
  };

  const handleDeleteTask = async (task: NormalTask) => {
    Alert.alert("確認", `「${task.title}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await normalTaskService.deleteTask(task.id);
            setActionModalVisible(false);
            Alert.alert("成功", "タスクが削除されました");
          } catch (error) {
            Alert.alert("エラー", "タスクの削除に失敗しました");
          }
        },
      },
    ]);
  };

  const renderColumn = (column: KanbanColumn) => (
    <View
      key={column.id}
      style={{
        width: 250,
        marginRight: 12,
        backgroundColor: "#fff",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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

      {/* タスクリスト - 2列グリッド表示 */}
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
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {column.tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 6,
                padding: 10,
                marginBottom: 8,
                width: "48%", // 2列表示のため48%幅
                borderLeftWidth: 4,
                borderLeftColor:
                  task.priority === "high"
                    ? "#d32f2f"
                    : task.priority === "medium"
                    ? "#ef6c00"
                    : "#2e7d32",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
              onPress={() => {
                setSelectedTask(task);
                setActionModalVisible(true);
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: 4,
                }}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#666",
                    lineHeight: 14,
                    marginBottom: 6,
                  }}
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}

              {/* 日程情報 */}
              {(task.startDate || task.dueDate) && (
                <View style={{ marginBottom: 6 }}>
                  {task.startDate && (
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#007AFF",
                        marginBottom: 2,
                      }}
                    >
                      開始:{" "}
                      {new Date(task.startDate).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  )}
                  {task.dueDate && (
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#ff6b6b",
                        marginBottom: 2,
                      }}
                    >
                      期限:{" "}
                      {new Date(task.dueDate).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  )}
                </View>
              )}

              {/* 担当者情報 */}
              {task.currentAssignedToName && (
                <Text
                  style={{ fontSize: 11, color: "#007AFF", marginBottom: 4 }}
                >
                  実施中: {task.currentAssignedToName}
                </Text>
              )}

              {/* 最終更新時間 */}
              <Text style={{ fontSize: 11, color: "#999" }}>
                {formatTimeAgo(task.lastActionAt || task.updatedAt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {column.tasks.length === 0 && (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 14, color: "#999", fontStyle: "italic" }}>
              タスクがありません
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

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
          onPress={() => setCreateModalVisible(true)}
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
        {columns.map(renderColumn)}
      </ScrollView>

      {/* タスク作成モーダル */}
      <SimpleTaskCreateModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onTaskCreated={() => {
          setCreateModalVisible(false);
        }}
        storeId={user?.storeId || ""}
        currentUser={user}
      />

      {/* タスクアクションモーダル */}
      <TaskActionModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        task={selectedTask}
        onEdit={handleEditTask}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        onStartAction={handleStartAction}
        onAddMemo={() => {}} // 空の関数を渡す（TaskActionModal内で直接処理）
        currentUser={user}
      />

      {/* タスク編集モーダル */}
      <SimpleTaskCreateModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedTask(null);
        }}
        onTaskCreated={() => {
          setEditModalVisible(false);
          setSelectedTask(null);
        }}
        storeId={user?.storeId || ""}
        currentUser={user}
        editTask={selectedTask}
      />
    </View>
  );
};
