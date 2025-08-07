import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExtendedTaskService } from "@/services/firebase/firebase-extended-task";
import {
  ExtendedTask,
  TaskType,
  TaskTag,
} from "@/common/common-models/model-shift/shiftTypes";
import { TaskCreateModal } from "./components/TaskCreateModal";
import { TaskEditModal } from "./components/TaskEditModal";
import { TaskListItem } from "./components/TaskListItem";
import { TaskFilters } from "./components/TaskFilters";
import { useTaskManagementStyles } from "./styles/TaskManagementView.styles";

interface TaskManagementViewProps {
  storeId: string;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  storeId,
}) => {
  const styles = useTaskManagementStyles();
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ExtendedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null);

  // フィルター状態
  const [filters, setFilters] = useState({
    type: "all" as TaskType | "all",
    tag: "all" as TaskTag | "all",
    active: true,
    searchText: "",
  });

  // タスク一覧を取得
  const loadTasks = async () => {
    try {
      const taskList = await ExtendedTaskService.getTasks(storeId, true);
      setTasks(taskList);
      applyFilters(taskList);
    } catch (error) {
      Alert.alert("エラー", "タスクの取得に失敗しました");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // フィルターを適用
  const applyFilters = (taskList: ExtendedTask[] = tasks) => {
    let filtered = [...taskList];

    // タイプフィルター
    if (filters.type !== "all") {
      filtered = filtered.filter((task) => task.type === filters.type);
    }

    // タグフィルター
    if (filters.tag !== "all") {
      filtered = filtered.filter((task) =>
        task.tags.includes(filters.tag as TaskTag)
      );
    }

    // アクティブ状態フィルター
    filtered = filtered.filter((task) => task.isActive === filters.active);

    // 検索テキストフィルター
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    // 並び順（優先度 > 名前）
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        // 優先度の順序: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.title.localeCompare(b.title);
    });

    setFilteredTasks(filtered);
  };

  // タスクの削除
  const handleDeleteTask = async (taskId: string) => {
    Alert.alert("タスクを削除", "このタスクを削除してもよろしいですか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await ExtendedTaskService.deleteTask(taskId);
            await loadTasks();
            Alert.alert("完了", "タスクを削除しました");
          } catch (error) {
            Alert.alert("エラー", "タスクの削除に失敗しました");
          }
        },
      },
    ]);
  };

  // タスクの状態切り替え
  const handleToggleTaskStatus = async (task: ExtendedTask) => {
    try {
      await ExtendedTaskService.updateTask(task.id, {
        isActive: !task.isActive,
      });
      await loadTasks();
    } catch (error) {
      Alert.alert("エラー", "タスクの状態更新に失敗しました");
    }
  };

  // 初期ロード
  useEffect(() => {
    loadTasks();
  }, [storeId]);

  // フィルター変更時の処理
  useEffect(() => {
    applyFilters();
  }, [filters, tasks]);

  // リフレッシュ処理
  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>タスク管理</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>新規作成</Text>
        </TouchableOpacity>
      </View>

      {/* フィルター */}
      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      {/* タスク一覧 */}
      <ScrollView
        style={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {filters.type !== "all" ||
              filters.tag !== "all" ||
              filters.searchText
                ? "フィルター条件に一致するタスクがありません"
                : "タスクがありません"}
            </Text>
            {filters.type === "all" &&
              filters.tag === "all" &&
              !filters.searchText && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Text style={styles.emptyButtonText}>最初のタスクを作成</Text>
                </TouchableOpacity>
              )}
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={() => handleDeleteTask(task.id)}
              onToggleStatus={() => handleToggleTaskStatus(task)}
            />
          ))
        )}
      </ScrollView>

      {/* タスク作成モーダル */}
      <TaskCreateModal
        visible={showCreateModal}
        storeId={storeId}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={loadTasks}
      />

      {/* タスク編集モーダル */}
      {editingTask && (
        <TaskEditModal
          visible={true}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={loadTasks}
        />
      )}
    </View>
  );
};
