import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import TaskCardComponent from "./task-components/TaskCardComponent";
import ModalComponent from "./task-components/ModalComponent";
import TaskListStyles from "./task-styles/TaskListStyles";

interface Task {
  id: string;
  title: string;
  frequency: string;
  timePerTask: string;
  description: string;
}

interface TaskListProps {
  tasks: Task[];
  onEditTask: (updatedTask: Task) => void;
  onAddTask: (task: Task) => void; // onAddTaskを追加
  handleDeleteTask: (id: string) => Promise<void>; // 削除ハンドラ
  reloadTasks: () => Promise<void>; // タスク再読み込み関数
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onEditTask,
  handleDeleteTask,
  reloadTasks,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    id: "", // IDプロパティを追加
    title: "",
    frequency: "",
    timePerTask: "",
    description: "",
  });
  const [customTime, setCustomTime] = useState("");
  const [customInterval, setCustomInterval] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中フラグ

  const frequencyOptions = [
    "1分に1回",
    "5分に1回",
    "10分に1回",
    "20分に1回",
    "30分に1回",
    "60分に1回",
    "その他",
  ];

  const timeOptions = [
    "1分以内",
    "5分以内",
    "10分",
    "20分",
    "30分",
    "60分",
    "その他",
  ];

  const addTask = async () => {
    const timePerTask =
      newTask.timePerTask === "その他" ? customTime : newTask.timePerTask;
    const frequency =
      newTask.frequency === "その他" ? customInterval : newTask.frequency;

    const taskToAdd: Task = {
      ...newTask,
      timePerTask,
      frequency,
    };

    setIsSubmitting(true); // ボタンを無効化

    try {
      if (newTask.id) {
        await onEditTask(taskToAdd); // 既存タスクの編集
      } else {
        await onAddTask(taskToAdd); // 新規タスクの追加
        await reloadTasks(); // Firebaseから即座に読み込む
      }

      setNewTask({
        id: "", // IDをリセット
        title: "",
        frequency: "",
        timePerTask: "",
        description: "",
      });
      setCustomTime("");
      setCustomInterval("");
      setModalVisible(false); // モーダルを閉じる
    } catch (error) {
    } finally {
      setIsSubmitting(false); // ボタンを再度有効化
    }
  };

  const styles = StyleSheet.create({
    ...TaskListStyles,
    buttonText: {
      color: "#fff",
      fontSize: 16,
      textAlign: "center",
    },
    deleteButton: {
      backgroundColor: "#ff4d4d",
      padding: 10,
      borderRadius: 5,
      marginLeft: 10,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    cancelButton: {
      backgroundColor: "#007bff",
      padding: 10,
      borderRadius: 5,
    },
  });

  return (
    <>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCardComponent
            title={item.title}
            frequency={item.frequency}
            timePerTask={item.timePerTask}
            onPress={() => {
              setNewTask(item); // カードを押したときにモーダルにデータを設定
              setModalVisible(true); // モーダルを表示
            }}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setNewTask({
            id: "", // IDプロパティを追加
            title: "",
            frequency: "",
            timePerTask: "",
            description: "",
          }); // 新規タスク用にリセット
          setModalVisible(true); // モーダルを表示
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <ModalComponent
        isVisible={isModalVisible}
        title={newTask.id ? "タスクを編集" : "タスクを追加"} // モーダルタイトルを動的に変更
        onClose={() => setModalVisible(false)}
        onSave={addTask}
      >
        <TextInput
          style={styles.input}
          placeholder="タスク名"
          placeholderTextColor="#999"
          value={newTask.title}
          onChangeText={(text) => setNewTask({ ...newTask, title: text })}
        />
        <View>
          <Text>時間</Text>
          <Picker
            selectedValue={newTask.timePerTask}
            onValueChange={(value) =>
              setNewTask({ ...newTask, timePerTask: value })
            }
            style={styles.picker}
          >
            {timeOptions.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
          {newTask.timePerTask === "その他" && (
            <TextInput
              style={styles.customInput}
              placeholder="カスタム時間を入力"
              placeholderTextColor="#999"
              value={customTime}
              onChangeText={setCustomTime}
            />
          )}
        </View>
        <View>
          <Text>頻度</Text>
          <Picker
            selectedValue={newTask.frequency}
            onValueChange={(value) =>
              setNewTask({ ...newTask, frequency: value })
            }
            style={styles.picker}
          >
            {frequencyOptions.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
          {newTask.frequency === "その他" && (
            <TextInput
              style={styles.customInput}
              placeholder="カスタム頻度を入力"
              placeholderTextColor="#999"
              value={customInterval}
              onChangeText={setCustomInterval}
            />
          )}
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="記述"
          placeholderTextColor="#999"
          value={newTask.description}
          onChangeText={(text) => setNewTask({ ...newTask, description: text })}
          multiline
        />
        <View style={styles.buttonContainer}>
          {newTask.id && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={async () => {
                await handleDeleteTask(newTask.id); // 削除処理
                setModalVisible(false); // モーダルを閉じる
                await reloadTasks(); // 画面全体をリロード
              }}
            >
              <Text style={styles.buttonText}>削除</Text>
            </TouchableOpacity>
          )}
        </View>
      </ModalComponent>
    </>
  );
};

const styles = StyleSheet.create({
  ...TaskListStyles,
  disabledButton: {
    backgroundColor: "#d3d3d3", // 無効化時の色
    opacity: 0.6, // 無効化時の透明度
  },
});

export default TaskList;
