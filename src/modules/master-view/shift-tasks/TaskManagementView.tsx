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
import { TaskCreateModal } from "./shift-task-modals/TaskCreateModal";
import { TaskEditModal } from "./shift-task-modals/TaskEditModal";
import { TaskListItem } from "./shift-task-modals/TaskListItem";
import { TaskFilters } from "./shift-task-modals/TaskFilters";
import { useTaskManagementStyles } from "./shift-tasks-styles/TaskManagementView.styles";

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
          onPress={() => setState(prev => ({ ...prev, showCreateModal: true }))}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="新しいタスクを作成"
          testID={`${testID}-add-button`}
          activeOpacity={0.8}
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
          <RefreshControl 
            refreshing={state.refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="タスクを更新中..."
          />
        }
      >
        {hasError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={48} color={colors.error} />
            <Text style={styles.errorText}>{state.error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setState(prev => ({ ...prev, error: null }));
                loadTasks();
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="再試行"
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.retryButtonText}>再試行</Text>
            </TouchableOpacity>
          </View>
        ) : state.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>読み込み中...</Text>
            {state.lastUpdated && (
              <Text style={styles.lastUpdatedText}>
                最終更新: {state.lastUpdated.toLocaleTimeString()}
              </Text>
            )}
          </View>
        ) : state.filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {filters.type !== "all" ||
              filters.tag !== "all" ||
              filters.searchText
                ? `フィルター条件に一致するタスクがありません\n（全${taskCounts.total}件中）`
                : "タスクがありません"}
            </Text>
            {filters.type === "all" &&
              filters.tag === "all" &&
              !filters.searchText && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setState(prev => ({ ...prev, showCreateModal: true }))}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="最初のタスクを作成"
                >
                  <Text style={styles.emptyButtonText}>最初のタスクを作成</Text>
                </TouchableOpacity>
              )}
          </View>
        ) : (
          state.filteredTasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              onEdit={() => setState(prev => ({ ...prev, editingTask: task }))}
              onDelete={() => handleDeleteTask(task.id)}
              onToggleStatus={() => handleToggleTaskStatus(task)}
              testID={`${testID}-task-${task.id}`}
            />
          ))
        )}
      </ScrollView>

      {/* タスク作成モーダル */}
      <TaskCreateModal
        visible={state.showCreateModal}
        storeId={storeId}
        onClose={() => setState(prev => ({ ...prev, showCreateModal: false }))}
        onTaskCreated={handleTaskCreated}
        testID={`${testID}-create-modal`}
      />

      {/* タスク編集モーダル */}
      {state.editingTask && (
        <TaskEditModal
          visible={true}
          task={state.editingTask}
          onClose={() => setState(prev => ({ ...prev, editingTask: null }))}
          onTaskUpdated={handleTaskUpdated}
          testID={`${testID}-edit-modal`}
        />
      )}
    </View>
  );
};
