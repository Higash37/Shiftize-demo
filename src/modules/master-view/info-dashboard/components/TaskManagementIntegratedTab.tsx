import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/services/firebase/firebase-extended-task";
import { TaskAnalytics } from "@/common/common-utils/util-task/taskAnalytics";
import {
  ExtendedTask,
  TaskPerformance,
  TaskType,
  TaskTag,
  TaskLevel,
} from "@/common/common-models/model-shift/shiftTypes";
import { TaskCardView } from "./TaskCardView";
import { TaskCreateModal } from "../../task-management/components/TaskCreateModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskPerformanceView } from "./TaskPerformanceView";
import { useTaskManagementIntegratedStyles } from "./styles/TaskManagementIntegratedTab.styles";

interface TaskManagementIntegratedTabProps {
  storeId: string;
}

export const TaskManagementIntegratedTab: React.FC<
  TaskManagementIntegratedTabProps
> = ({ storeId }) => {
  const styles = useTaskManagementIntegratedStyles();
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ExtendedTask[]>([]);
  const [performances, setPerformances] = useState<TaskPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // モーダル状態
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // フィルター・検索状態
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<TaskType | "all">("all");
  const [selectedTag, setSelectedTag] = useState<TaskTag | "all">("all");
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // ビュー状態
  const [currentView, setCurrentView] = useState<
    "cards" | "performance" | "analytics"
  >("cards");

  useEffect(() => {
    loadTaskData();
  }, [storeId]);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchText, selectedType, selectedTag, showActiveOnly]);

  const loadTaskData = async () => {
    try {
      setLoading(true);

      // タスク一覧を取得
      const taskList = await getTasks(storeId);
      setTasks(taskList);

      // モックパフォーマンスデータを生成
      const mockPerformances: TaskPerformance[] = taskList.map(
        (task: ExtendedTask, index: number) => ({
          taskId: task.id,
          userId: `user-${(index % 3) + 1}`,
          totalExecutions: Math.floor(Math.random() * 20) + 5,
          totalTimeMinutes: Math.floor(Math.random() * 300) + 100,
          averageTimePerExecution:
            (task.baseTimeMinutes || 30) + Math.floor(Math.random() * 20) - 10,
          efficiencyRate: 0.8 + Math.random() * 0.4,
          consistencyRate: 0.7 + Math.random() * 0.3,
          proactivityRate: 0.8 + Math.random() * 0.4,
          frequencyRate: 0.8 + Math.random() * 0.2,
          completionRate: 0.9 + Math.random() * 0.1,
          accuracyRate: 0.85 + Math.random() * 0.15,
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(),
          lastUpdated: new Date(),
        })
      );

      setPerformances(mockPerformances);
    } catch (error) {
      console.error("タスクデータの取得に失敗しました:", error);
      Alert.alert("エラー", "タスクデータの取得に失敗しました");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // アクティブ状態フィルター
    if (showActiveOnly) {
      filtered = filtered.filter((task) => task.isActive);
    }

    // タイプフィルター
    if (selectedType !== "all") {
      filtered = filtered.filter((task) => task.type === selectedType);
    }

    // タグフィルター
    if (selectedTag !== "all") {
      filtered = filtered.filter((task) => task.tags.includes(selectedTag));
    }

    // 検索テキストフィルター
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    // 優先度順でソート
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityA = priorityOrder[a.priority] || 0;
      const priorityB = priorityOrder[b.priority] || 0;

      if (priorityA !== priorityB) {
        return priorityB - priorityA; // 高優先度を上に
      }
      return a.title.localeCompare(b.title);
    });

    setFilteredTasks(filtered);
  };

  const handleTaskCreated = () => {
    loadTaskData();
    setShowCreateModal(false);
  };

  const handleTaskUpdated = () => {
    loadTaskData();
    setShowDetailModal(false);
  };

  const handleTaskDeleted = async (taskId: string) => {
    Alert.alert(
      "タスクを削除",
      "このタスクを削除してもよろしいですか？\n関連するパフォーマンスデータも削除されます。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTask(taskId);
              await loadTaskData();
              Alert.alert("完了", "タスクを削除しました");
            } catch (error) {
              console.error("タスクの削除に失敗しました:", error);
              Alert.alert("エラー", "タスクの削除に失敗しました");
            }
          },
        },
      ]
    );
  };

  const handleTaskStatusToggle = async (task: ExtendedTask) => {
    try {
      await updateTask(task.id, {
        isActive: !task.isActive,
      });
      await loadTaskData();
    } catch (error) {
      console.error("タスクの状態更新に失敗しました:", error);
      Alert.alert("エラー", "タスクの状態更新に失敗しました");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTaskData();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>タスク管理</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>新規作成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderViewSelector = () => (
    <View style={styles.viewSelector}>
      {[
        { key: "cards", label: "カード表示", icon: "grid-outline" },
        {
          key: "performance",
          label: "パフォーマンス",
          icon: "analytics-outline",
        },
        { key: "analytics", label: "詳細分析", icon: "trending-up-outline" },
      ].map((view) => (
        <TouchableOpacity
          key={view.key}
          style={[
            styles.viewButton,
            currentView === view.key && styles.viewButtonActive,
          ]}
          onPress={() => setCurrentView(view.key as any)}
        >
          <Ionicons
            name={view.icon as any}
            size={16}
            color={currentView === view.key ? "white" : colors.text.secondary}
          />
          <Text
            style={[
              styles.viewButtonText,
              currentView === view.key && styles.viewButtonTextActive,
            ]}
          >
            {view.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="タスクを検索..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* フィルターボタン */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {/* タイプフィルター */}
          {[
            { value: "all", label: "すべて" },
            { value: "standard", label: "通常" },
            { value: "time_specific", label: "時間指定" },
            { value: "custom", label: "独自設定" },
          ].map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.filterChip,
                selectedType === type.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType(type.value as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === type.value && styles.filterChipTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* アクティブフィルター */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              showActiveOnly && styles.filterChipActive,
            ]}
            onPress={() => setShowActiveOnly(!showActiveOnly)}
          >
            <Text
              style={[
                styles.filterChipText,
                showActiveOnly && styles.filterChipTextActive,
              ]}
            >
              有効のみ
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    if (currentView === "cards") {
      return (
        <TaskCardView
          tasks={filteredTasks}
          performances={performances}
          onTaskSelect={(task) => {
            setSelectedTask(task);
            setShowDetailModal(true);
          }}
          onTaskDelete={handleTaskDeleted}
          onTaskStatusToggle={handleTaskStatusToggle}
        />
      );
    } else if (currentView === "performance") {
      return <TaskPerformanceView tasks={filteredTasks} storeId={storeId} />;
    } else {
      // 詳細分析ビューは将来の拡張用
      return (
        <View style={styles.comingSoonContainer}>
          <Ionicons name="construct-outline" size={64} color="#ccc" />
          <Text style={styles.comingSoonText}>詳細分析機能は準備中です</Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderViewSelector()}
      {currentView === "cards" && renderFilters()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

      {/* タスク作成モーダル */}
      <TaskCreateModal
        visible={showCreateModal}
        storeId={storeId}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* タスク詳細モーダル */}
      {selectedTask && (
        <TaskDetailModal
          visible={showDetailModal}
          task={selectedTask}
          performances={performances.filter(
            (p) => p.taskId === selectedTask.id
          )}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={() => handleTaskDeleted(selectedTask.id)}
        />
      )}
    </View>
  );
};
