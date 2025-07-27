import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase-core";
import { useAuth } from "@/services/auth/useAuth";

export const TaskService = {
  addTask: async (taskData: {
    title: string;
    frequency: string;
    timePerTask: string;
    description: string;
    storeId?: string;
  }) => {
    const taskRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return taskRef.id;
  },

  getTasks: async (storeId?: string) => {
    const querySnapshot = await getDocs(collection(db, "tasks"));

    let tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title || "",
      frequency: doc.data().frequency || "",
      timePerTask: doc.data().timePerTask || "",
      description: doc.data().description || "",
      storeId: doc.data().storeId || "",
    }));

    if (storeId) {
      tasks = tasks.filter((task) => task.storeId === storeId);
    }

    return tasks;
  },

  updateTask: async (
    taskId: string,
    updatedData: {
      title?: string;
      frequency?: string;
      timePerTask?: string;
      description?: string;
    }
  ) => {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...updatedData,
      updatedAt: new Date(),
    });
  },

  deleteTask: async (taskId: string) => {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  },
};
export const { addTask, getTasks, updateTask, deleteTask } = TaskService;
