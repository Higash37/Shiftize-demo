import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { NormalTask, TaskStatus, TaskMemo } from "../types";
import { normalTaskService } from "../normal-task-service";

interface UseTaskActionModalProps {
  task: NormalTask | null;
  visible: boolean;
  onStatusChange: (task: NormalTask, newStatus: TaskStatus) => void;
  onStartAction: (task: NormalTask) => void;
  onDelete: (task: NormalTask) => void;
  onClose: () => void;
  currentUser: { uid: string; nickname: string } | null;
}

export const useTaskActionModal = ({
  task,
  visible,
  onStatusChange,
  onStartAction,
  onDelete,
  onClose,
  currentUser,
}: UseTaskActionModalProps) => {
  const [memoText, setMemoText] = useState("");
  const [memos, setMemos] = useState<TaskMemo[]>([]);
  const [showDetailTextModal, setShowDetailTextModal] = useState(false);

  // メモを監視
  useEffect(() => {
    if (!task?.id) return;

    const unsubscribe = normalTaskService.watchTaskMemos(
      task.id,
      (taskMemos) => {
        setMemos(taskMemos);
      }
    );

    return unsubscribe;
  }, [task?.id]);

  // モーダルが閉じられたときにメモテキストをクリア
  useEffect(() => {
    if (!visible) {
      setMemoText("");
    }
  }, [visible]);

  const handleAddMemo = async () => {
    if (!memoText.trim() || !currentUser || !task) return;

    try {
      await normalTaskService.createTaskMemo(
        task.id,
        memoText.trim(),
        currentUser.uid,
        currentUser.nickname
      );

      setMemoText("");
    } catch (error) {
      Alert.alert("エラー", "メモの追加に失敗しました");
    }
  };

  const handleStatusChangeWrapper = async (
    task: NormalTask,
    newStatus: TaskStatus
  ) => {
    await onStatusChange(task, newStatus);
    onClose();
  };

  const handleStartActionWrapper = async (task: NormalTask) => {
    await onStartAction(task);
    onClose();
  };

  const handleDeleteTaskWrapper = async (task: NormalTask) => {
    Alert.alert("確認", `「${task.title}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await onDelete(task);
          onClose();
        },
      },
    ]);
  };

  const getStatusActions = (currentStatus: TaskStatus) => {
    const actions = [];

    if (currentStatus === "not_started") {
      actions.push({
        label: "開始する",
        icon: "play-circle",
        color: "#007AFF",
        newStatus: "in_progress" as TaskStatus,
      });
    }

    if (currentStatus === "in_progress") {
      actions.push({
        label: "完了する",
        icon: "checkmark-circle",
        color: "#34C759",
        newStatus: "completed" as TaskStatus,
      });
      actions.push({
        label: "未実施に戻す",
        icon: "arrow-back-circle",
        color: "#FF9500",
        newStatus: "not_started" as TaskStatus,
      });
    }

    if (currentStatus === "completed") {
      actions.push({
        label: "実施中に戻す",
        icon: "arrow-back-circle",
        color: "#FF9500",
        newStatus: "in_progress" as TaskStatus,
      });
      actions.push({
        label: "未実施に戻す",
        icon: "arrow-back-circle",
        color: "#FF9500",
        newStatus: "not_started" as TaskStatus,
      });
    }

    return actions;
  };

  return {
    memoText,
    memos,
    showDetailTextModal,
    setMemoText,
    setShowDetailTextModal,
    handleAddMemo,
    handleStatusChangeWrapper,
    handleStartActionWrapper,
    handleDeleteTaskWrapper,
    getStatusActions,
  };
};