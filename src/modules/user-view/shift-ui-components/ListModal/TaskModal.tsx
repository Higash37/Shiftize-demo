import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { modalStyles } from "./ModalStyles";

const TaskModal = ({
  isTaskModalVisible,
  handleTaskModalClose,
  selectedTask,
  taskCounts,
  handleTaskUpdate,
  timeOptions,
}: {
  isTaskModalVisible: boolean;
  handleTaskModalClose: () => void;
  selectedTask: string | null;
  taskCounts: { [key: string]: { count: number; time: number } };
  handleTaskUpdate: (
    task: string,
    field: "count" | "time",
    value: number
  ) => void;
  timeOptions: number[];
}) => {
  return (
    <Modal
      visible={isTaskModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleTaskModalClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <Text style={modalStyles.modalTitle}>タスク設定: {selectedTask}</Text>
          <View style={modalStyles.taskRow}>
            <Text style={modalStyles.taskText}>回数:</Text>
            <TouchableOpacity
              onPress={() => handleTaskUpdate(selectedTask!, "count", -1)}
              style={modalStyles.countButton}
            >
              <Text style={modalStyles.taskText}>-</Text>
            </TouchableOpacity>
            <Text style={modalStyles.countText}>
              {taskCounts[selectedTask!]?.count || 0} 回
            </Text>
            <TouchableOpacity
              onPress={() => handleTaskUpdate(selectedTask!, "count", 1)}
              style={modalStyles.countButton}
            >
              <Text style={modalStyles.taskText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={modalStyles.taskRow}>
            <Text style={modalStyles.taskText}>時間:</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {timeOptions.map((option: number) => (
                <TouchableOpacity
                  key={option}
                  onPress={() =>
                    handleTaskUpdate(selectedTask!, "time", option)
                  }
                  style={modalStyles.valueTouchable}
                >
                  <Text style={modalStyles.valueText}>{option} 分</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity
            onPress={handleTaskModalClose}
            style={modalStyles.modalButton}
          >
            <Text style={modalStyles.modalButtonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TaskModal;
