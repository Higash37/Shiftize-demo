import React from "react";
import { FlatList, StyleSheet } from "react-native";
import TaskCardComponent from "./TaskCardComponent";

export interface Task {
  id: string;
  name: string;
  frequency: string;
  timePerTask: string;
  description: string;
}

interface TaskListComponentProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const TaskListComponent: React.FC<TaskListComponentProps> = ({
  tasks,
  onEditTask,
}) => {
  const renderItem = ({ item }: { item: Task }) => (
    <TaskCardComponent
      frequency={item.frequency}
      timePerTask={item.timePerTask}
      onPress={() => onEditTask(item)}
      title={item.name}
    />
  );

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 80,
  },
});

export default TaskListComponent;
