import React from "react";
import { View, Modal, TouchableOpacity, ScrollView } from "react-native";
import { NormalTask, TaskStatus } from "./types";
import { DetailTextModal } from "./DetailTextModal";
import { styles } from "./TaskActionModal.styles";

// Components
import { TaskModalHeader } from "./components/task-action-modal/TaskModalHeader";
import { TaskInfo } from "./components/task-action-modal/TaskInfo";
import { TaskActions } from "./components/task-action-modal/TaskActions";
import { TaskDescription } from "./components/task-action-modal/TaskDescription";
import { TaskMemos } from "./components/task-action-modal/TaskMemos";

// Hooks
import { useTaskActionModal } from "./hooks/useTaskActionModal";

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
  const {
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
  } = useTaskActionModal({
    task,
    visible,
    onStatusChange,
    onStartAction,
    onDelete,
    onClose,
    currentUser,
  });

  if (!task) return null;

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
          <TaskModalHeader
            onClose={onClose}
            onEdit={onEdit}
            task={task}
          />

          {/* メインコンテンツ - 左右分割 */}
          <View style={styles.mainContent}>
            {/* 左側: タスク情報とアクション */}
            <View style={styles.leftPanel}>
              <ScrollView style={styles.scrollContent}>
                <TaskInfo task={task} />
                
                <TaskActions
                  task={task}
                  onStartAction={handleStartActionWrapper}
                  onStatusChange={handleStatusChangeWrapper}
                  onDelete={handleDeleteTaskWrapper}
                  getStatusActions={getStatusActions}
                />
              </ScrollView>
            </View>

            {/* 右側: ルールとメモ */}
            <View style={styles.rightPanel}>
              <TaskDescription
                task={task}
                onEditDescription={() => setShowDetailTextModal(true)}
              />
              
              <TaskMemos
                memos={memos}
                memoText={memoText}
                currentUser={currentUser}
                onMemoTextChange={setMemoText}
                onAddMemo={handleAddMemo}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* 詳細テキストモーダル */}
      <DetailTextModal
        visible={showDetailTextModal}
        onClose={() => setShowDetailTextModal(false)}
        initialText={task.description || ""}
        title="詳細・ルール"
        onSave={(text) => {
          // 詳細テキスト保存処理
          setShowDetailTextModal(false);
        }}
      />
    </Modal>
  );
};