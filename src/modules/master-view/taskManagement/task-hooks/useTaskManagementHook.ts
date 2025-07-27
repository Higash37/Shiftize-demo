import { useEffect, useState } from "react";
import { getTasks } from "../../../../services/firebase/firebase-task";
import { TaskService } from "../../../../services/firebase/firebase-task";
import { useAuth } from "../../../../services/auth/useAuth";

interface Task {
  id: string;
  title: string;
  frequency: string;
  timePerTask: string;
  description: string;
  storeId?: string;
}

const useTaskManagementHook = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = (await getTasks(user?.storeId)).map((task) => ({
          id: task.id,
          title: task.title || "",
          frequency: task.frequency || "",
          timePerTask: task.timePerTask || "",
          description: task.description || "",
          storeId: task.storeId || "",
        }));
        setTasks(fetchedTasks);
      } catch (error) {
      }
    };

    fetchTasks();
  }, [user?.storeId]);

  const addTask = async (newTask: Task) => {
    try {
      const taskWithStoreId = {
        ...newTask,
        storeId: user?.storeId || "",
      };
      const taskId = await TaskService.addTask(taskWithStoreId);
      setTasks([...tasks, { ...taskWithStoreId, id: taskId }]);
    } catch (error) {
    }
  };

  const editTask = async (updatedTask: Task) => {
    try {
      await TaskService.updateTask(updatedTask.id, updatedTask);
      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    } catch (error) {
    }
  };

  const completeTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      )
    );
  };

  return { tasks, addTask, editTask, completeTask };
};

export default useTaskManagementHook;
