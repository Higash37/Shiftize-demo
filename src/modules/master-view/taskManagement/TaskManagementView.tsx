import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import TaskList from "./TaskList";
import useTaskManagementHook from "./task-hooks/useTaskManagementHook";
import TaskManagementStyles from "./task-styles/TaskManagementStyles";
import { generateTaskId, formatTaskDescription } from "./task-utils/TaskUtils";
import { getTasks, deleteTask } from "../../../services/firebase/firebase-task";
import { useAuth } from "../../../services/auth/useAuth";

interface Task {
  id: string;
  title: string;
  frequency: string;
  timePerTask: string;
  description: string;
  storeId?: string;
}

const TaskManagementView: React.FC = () => {
  const {
    tasks: initialTasks,
    addTask,
    editTask,
    completeTask,
  } = useTaskManagementHook();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskFrequency, setNewTaskFrequency] = useState("");
  const [newTaskTimePerTask, setNewTaskTimePerTask] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadTasks = async () => {
    const updatedTasks = await getTasks(user?.storeId);
    setTasks(updatedTasks);
  };

  useEffect(() => {
    reloadTasks();
  }, [user?.storeId]);

  const handleAddTask = async () => {
    if (!newTaskTitle || !newTaskFrequency || !newTaskTimePerTask) {
      return;
    }

    const newTask: Task = {
      id: generateTaskId(),
      title: newTaskTitle,
      frequency: newTaskFrequency,
      timePerTask: newTaskTimePerTask,
      description: "",
      storeId: user?.storeId || "",
    };

    setIsSubmitting(true);

    try {
      await addTask(newTask);
      setNewTaskTitle("");
      setNewTaskFrequency("");
      setNewTaskTimePerTask("");
      await reloadTasks();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    await editTask(updatedTask);
    reloadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    reloadTasks();
  };

  return (
    <View style={TaskManagementStyles.container}>
      <Text style={TaskManagementStyles.title}>タスク管理</Text>
      <TaskList
        tasks={tasks}
        onAddTask={addTask}
        onEditTask={handleEditTask}
        handleDeleteTask={handleDeleteTask}
        reloadTasks={reloadTasks}
      />
    </View>
  );
};

export default TaskManagementView;
