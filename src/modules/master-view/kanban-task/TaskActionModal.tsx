import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NormalTask, TaskStatus, TaskMemo } from "./types";
import {
  formatTimeAgo,
  formatTime,
} from "../../../common/common-utils/timeUtils";
import { normalTaskService } from "./normal-task-service";
import { DetailTextModal } from "./DetailTextModal"; // DetailTextModalをインポート

interface TaskActionModalProps {
  visible: boolean;
  onClose: () => void;
  task: NormalTask | null;
  onEdit: (task: NormalTask) => void;
  onStatusChange: (task: NormalTask, newStatus: TaskStatus) => void;
  onDelete: (task: NormalTask) => void;
  onStartAction: (task: NormalTask) => void;
  onAddMemo: (task: NormalTask, memo: string) => void;
  currentUser: { uid: string; nickname: string } | null;
}

export const TaskActionModal: React.FC<TaskActionModalProps> = ({
  visible,
  onClose,
  task,
  onEdit,
  onStatusChange,
  onDelete,
  onStartAction,
  onAddMemo,
  currentUser,
}) => {
  const [memoText, setMemoText] = useState("");
  const [memos, setMemos] = useState<TaskMemo[]>([]);
  const [showDetailTextModal, setShowDetailTextModal] = useState(false); // DetailTextModalの表示状態

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

  if (!task) return null;

  const handleAddMemo = async () => {
    if (!memoText.trim() || !currentUser) return;

    try {
      await normalTaskService.createTaskMemo(
        task.id,
        memoText.trim(),
        currentUser.uid,
        currentUser.nickname
      );

      setMemoText("");
    } catch (error) {
      console.error("メモ追加エラー:", error);
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

  const statusActions = getStatusActions(task.status);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>タスク詳細</Text>
            <TouchableOpacity onPress={() => onEdit(task)}>
              <Ionicons name="create" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* メインコンテンツ - 左右分割 */}
          <View style={styles.mainContent}>
            {/* 左側: タスク情報とアクション */}
            <View style={styles.leftPanel}>
              <ScrollView style={styles.scrollContent}>
                {/* タスク情報 */}
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

                {/* アクションボタン */}
                <View style={styles.actionSection}>
                  <Text style={styles.sectionTitle}>アクション</Text>

                  {/* スタートボタン（常に表示） */}
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#007AFF" },
                    ]}
                    onPress={() => handleStartActionWrapper(task)}
                  >
                    <Ionicons name="play" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>スタート</Text>
                  </TouchableOpacity>

                  {/* ステータス変更ボタン */}
                  {getStatusActions(task.status).map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.actionButton,
                        { backgroundColor: action.color },
                      ]}
                      onPress={() =>
                        handleStatusChangeWrapper(task, action.newStatus)
                      }
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.actionButtonText}>
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {/* 削除ボタン */}
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#FF3B30", marginTop: 12 },
                    ]}
                    onPress={() => handleDeleteTaskWrapper(task)}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>削除</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            {/* 右側: ルールとメモ */}
            <View style={styles.rightPanel}>
              {/* 上段: 詳細・ルール */}
              <View style={styles.rulesSection}>
                <Text style={styles.sectionTitle}>詳細・ルール</Text>
                <TouchableOpacity
                  style={styles.descriptionInput}
                  onPress={() => setShowDetailTextModal(true)}
                >
                  <Text
                    style={[
                      styles.descriptionText,
                      { color: task.description ? "#333" : "#999" },
                    ]}
                  >
                    {task.description || "詳細・ルールを入力してください"}
                  </Text>
                  <Ionicons name="create" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {/* 下段: メモ欄 */}
              <TouchableOpacity
                style={styles.memoSection}
                activeOpacity={1}
                onPress={() => {}} // タップイベントを停止
              >
                <Text style={styles.sectionTitle}>メモ</Text>

                {/* メモ一覧 */}
                <ScrollView style={styles.memoList}>
                  {(() => {
                    return null;
                  })()}
                  {memos.length === 0 ? (
                    <View style={styles.emptyMemoContainer}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={24}
                        color="#ccc"
                      />
                      <Text style={styles.emptyMemoText}>メモがありません</Text>
                      <Text style={styles.emptyMemoSubText}>
                        このタスクに関するメモを追加しましょう
                      </Text>
                    </View>
                  ) : (
                    memos.map((memo) => (
                      <View key={memo.id} style={styles.memoItem}>
                        <View style={styles.memoAvatar}>
                          <Text style={styles.memoAvatarText}>
                            {memo.createdByName.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.memoContent}>
                          <View style={styles.memoHeader}>
                            <Text style={styles.memoAuthor}>
                              {memo.createdByName}
                            </Text>
                            <Text style={styles.memoTime}>
                              {formatTimeAgo(memo.createdAt)}
                            </Text>
                          </View>
                          <Text style={styles.memoText}>{memo.text}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* メモ投稿欄 */}
                <TouchableOpacity
                  style={styles.memoInput}
                  activeOpacity={1}
                  onPress={() => {}} // タップイベントを停止
                >
                  <View style={styles.memoInputAvatar}>
                    <Text style={styles.memoInputAvatarText}>
                      {currentUser?.nickname.charAt(0) || "U"}
                    </Text>
                  </View>
                  <View style={styles.memoInputContent}>
                    <TextInput
                      style={styles.memoTextInput}
                      value={memoText}
                      onChangeText={setMemoText}
                      placeholder="メモを追加..."
                      multiline
                      maxLength={200}
                    />
                    <View style={styles.memoInputFooter}>
                      <Text style={styles.memoCharCount}>
                        {memoText.length}/200
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.sendButton,
                          {
                            backgroundColor: memoText.trim()
                              ? "#007AFF"
                              : "#e0e0e0",
                          },
                        ]}
                        onPress={handleAddMemo}
                        disabled={!memoText.trim()}
                      >
                        <Ionicons
                          name="send"
                          size={16}
                          color={memoText.trim() ? "#fff" : "#999"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* 詳細テキストモーダル */}
      <DetailTextModal
        visible={showDetailTextModal}
        onClose={() => setShowDetailTextModal(false)}
        onSave={async (text) => {
          if (task) {
            try {
              await normalTaskService.updateTask(task.id, {
                description: text,
              });
              Alert.alert("成功", "詳細が更新されました");
            } catch (error) {
              console.error("詳細更新エラー:", error);
              Alert.alert("エラー", "詳細の更新に失敗しました");
            }
          }
        }}
        initialText={task?.description || ""}
        title="詳細・ルール"
      />
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    height: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  leftPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  rightPanel: {
    flex: 1,
    paddingLeft: 16,
  },
  scrollContent: {
    flex: 1,
  },
  taskInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  assigneeInfo: {
    marginBottom: 8,
  },
  assigneeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  lastUpdateText: {
    fontSize: 12,
    color: "#007AFF",
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#999",
  },
  actionSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginLeft: 8,
  },
  rulesSection: {
    flex: 0.8,
    marginBottom: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8f9fa",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 60,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    lineHeight: 18,
  },
  memoSection: {
    flex: 1.5,
  },
  memoList: {
    flex: 1,
    marginBottom: 12,
    paddingVertical: 8,
  },
  emptyMemoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyMemoText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
    fontWeight: "500",
  },
  emptyMemoSubText: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 4,
    textAlign: "center",
  },
  memoItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memoAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memoAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  memoContent: {
    flex: 1,
  },
  memoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  memoAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  memoTime: {
    fontSize: 12,
    color: "#999",
  },
  memoText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginTop: 2,
  },
  memoInput: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  memoInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memoInputAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  memoInputContent: {
    flex: 1,
  },
  memoTextInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
    backgroundColor: "#f8f9fa",
  },
  memoInputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  memoCharCount: {
    fontSize: 12,
    color: "#999",
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
