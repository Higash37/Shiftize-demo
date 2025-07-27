import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExtendedTaskService } from "@/services/firebase/firebase-extended-task";
import { ShiftService } from "@/services/firebase/firebase-shift";
import {
  ExtendedTask,
  TaskExecution,
} from "@/common/common-models/model-shift/shiftTypes";
import { useExtendedShiftReportStyles } from "./styles/ExtendedShiftReportModal.styles";

interface ExtendedShiftReportModalProps {
  visible: boolean;
  shift: any;
  storeId: string;
  onClose: () => void;
  onReported: () => void;
}

export const ExtendedShiftReportModal: React.FC<
  ExtendedShiftReportModalProps
> = ({ visible, shift, storeId, onClose, onReported }) => {
  const styles = useExtendedShiftReportStyles();

  const [availableTasks, setAvailableTasks] = useState<ExtendedTask[]>([]);
  const [taskExecutions, setTaskExecutions] = useState<TaskExecution[]>([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible && shift) {
      loadAvailableTasks();
      initializeTaskExecutions();
    }
  }, [visible, shift]);

  const loadAvailableTasks = async () => {
    try {
      const tasks = await ExtendedTaskService.getTasks(storeId);

      // 現在時刻で利用可能なタスクをフィルタリング
      const currentTime = new Date().toTimeString().slice(0, 5);
      const availableNow = tasks.filter((task) => {
        if (task.type === "time_specific") {
          return isTimeInRange(
            currentTime,
            task.restrictedStartTime,
            task.restrictedEndTime
          );
        }
        return task.isActive;
      });

      setAvailableTasks(availableNow);
    } catch (error) {
      Alert.alert("エラー", "タスクの読み込みに失敗しました");
    }
  };

  const initializeTaskExecutions = () => {
    // 既存のタスク実行データがあれば復元
    if (shift.tasks) {
      const executions = Object.entries(shift.tasks).map(
        ([taskId, data]: [string, any]) => ({
          taskId,
          actualCount: data.count || 0,
          actualTimeMinutes: data.time || 0,
          notes: data.notes || "",
        })
      );
      setTaskExecutions(executions);
      setSelectedTasks(new Set(executions.map((e) => e.taskId)));
    } else {
      setTaskExecutions([]);
      setSelectedTasks(new Set());
    }
  };

  const isTimeInRange = (
    currentTime: string,
    startTime?: string,
    endTime?: string
  ): boolean => {
    if (!startTime || !endTime) return true;

    const current = new Date(`2000-01-01 ${currentTime}`);
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    return current >= start && current <= end;
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
      setTaskExecutions((prev) => prev.filter((e) => e.taskId !== taskId));
    } else {
      newSelected.add(taskId);
      const task = availableTasks.find((t) => t.id === taskId);
      if (task) {
        setTaskExecutions((prev) => [
          ...prev,
          {
            taskId,
            actualCount: task.baseCountPerShift,
            actualTimeMinutes: task.baseTimeMinutes,
            notes: "",
          },
        ]);
      }
    }
    setSelectedTasks(newSelected);
  };

  const updateTaskExecution = (
    taskId: string,
    field: keyof TaskExecution,
    value: any
  ) => {
    setTaskExecutions((prev) =>
      prev.map((execution) =>
        execution.taskId === taskId
          ? { ...execution, [field]: value }
          : execution
      )
    );
  };

  const handleSubmit = async () => {
    if (selectedTasks.size === 0) {
      Alert.alert(
        "確認",
        "タスクが選択されていませんが、報告を送信しますか？",
        [
          { text: "キャンセル", style: "cancel" },
          { text: "送信", onPress: submitReport },
        ]
      );
      return;
    }

    await submitReport();
  };

  const submitReport = async () => {
    setLoading(true);
    try {
      // タスク実行データを整形
      const formattedTasks = taskExecutions.reduce((acc, execution) => {
        acc[execution.taskId] = {
          count: execution.actualCount,
          time: execution.actualTimeMinutes,
          notes: execution.notes,
        };
        return acc;
      }, {} as Record<string, any>);

      // シフトを完了状態に更新し、タスクデータを保存
      await ShiftService.updateShiftWithTasks(
        shift.id,
        formattedTasks,
        comments
      );

      Alert.alert("完了", "シフト報告を送信しました");
      onReported();
      onClose();
    } catch (error) {
      Alert.alert("エラー", "シフト報告の送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const renderTaskItem = (task: ExtendedTask) => {
    const isSelected = selectedTasks.has(task.id);
    const execution = taskExecutions.find((e) => e.taskId === task.id);

    const getTypeColor = () => {
      switch (task.type) {
        case "time_specific":
          return "#ff9800";
        case "user_defined":
          return "#9c27b0";
        case "class":
          return "#2196f3";
        default:
          return "#4caf50";
      }
    };

    const getPriorityColor = () => {
      switch (task.priority) {
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

    return (
      <TouchableOpacity
        key={task.id}
        style={[styles.taskItem, isSelected && styles.taskItemSelected]}
        onPress={() => toggleTaskSelection(task.id)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>
          <View style={styles.taskBadges}>
            <View
              style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}
            >
              <Text style={styles.badgeText}>
                {task.type === "standard"
                  ? "通常"
                  : task.type === "time_specific"
                  ? "時間指定"
                  : task.type === "user_defined"
                  ? "ユーザー定義"
                  : "授業"}
              </Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor() },
              ]}
            >
              <Text style={styles.badgeText}>
                {task.priority === "high"
                  ? "高"
                  : task.priority === "medium"
                  ? "中"
                  : "低"}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={isSelected ? "#4caf50" : "#ccc"}
          />
        </View>

        {task.type === "time_specific" && (
          <View style={styles.timeRestriction}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.timeRestrictionText}>
              {task.restrictedStartTime} - {task.restrictedEndTime}
            </Text>
          </View>
        )}

        <View style={styles.baseInfo}>
          <Text style={styles.baseInfoText}>
            基本時間: {task.baseTimeMinutes}分 | 基本回数:{" "}
            {task.baseCountPerShift}回
          </Text>
        </View>

        {isSelected && execution && (
          <View style={styles.executionInputs}>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>実行回数</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      updateTaskExecution(
                        task.id,
                        "actualCount",
                        Math.max(0, execution.actualCount - 1)
                      )
                    }
                  >
                    <Ionicons name="remove" size={20} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {execution.actualCount}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      updateTaskExecution(
                        task.id,
                        "actualCount",
                        execution.actualCount + 1
                      )
                    }
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>実行時間（分）</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      updateTaskExecution(
                        task.id,
                        "actualTimeMinutes",
                        Math.max(0, execution.actualTimeMinutes - 5)
                      )
                    }
                  >
                    <Ionicons name="remove" size={20} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {execution.actualTimeMinutes}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      updateTaskExecution(
                        task.id,
                        "actualTimeMinutes",
                        execution.actualTimeMinutes + 5
                      )
                    }
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="メモ（任意）"
              placeholderTextColor="#999"
              value={execution.notes}
              onChangeText={(text) =>
                updateTaskExecution(task.id, "notes", text)
              }
              multiline
              numberOfLines={2}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>シフト報告</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "送信中..." : "報告"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* シフト情報 */}
        <View style={styles.shiftInfo}>
          <Text style={styles.shiftInfoText}>
            {shift?.date} {shift?.startTime} - {shift?.endTime}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* タスクリスト */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              実行したタスクを選択してください ({selectedTasks.size}個選択中)
            </Text>
            {availableTasks.length === 0 ? (
              <View style={styles.noTasksContainer}>
                <Ionicons name="clipboard-outline" size={48} color="#ccc" />
                <Text style={styles.noTasksText}>
                  利用可能なタスクがありません
                </Text>
              </View>
            ) : (
              availableTasks.map(renderTaskItem)
            )}
          </View>

          {/* 全体コメント */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>全体コメント</Text>
            <TextInput
              style={styles.commentsInput}
              placeholder="シフト全体のコメントを入力..."
              placeholderTextColor="#999"
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
