import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../services/firebase/firebase-core";
import { KanbanTask, KanbanTaskFormData, TaskStatus } from "./types";

export const kanbanTaskService = {
  /**
   * 店舗のタスク一覧を取得
   */
  getTasks: async (storeId: string): Promise<KanbanTask[]> => {
    try {
      const tasksRef = collection(db, "kanbanTasks");
      const q = query(
        tasksRef,
        where("storeId", "==", storeId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const tasks: KanbanTask[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          assignedTo: data.assignedTo,
          assignedToName: data.assignedToName,
          storeId: data.storeId,
          dueDate: data.dueDate?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          lastActionAt: data.lastActionAt?.toDate() || data.updatedAt.toDate(),
          tags: data.tags || [],
          isPublic: data.isPublic || false,
        });
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 新しいタスクを作成
   */
  createTask: async (
    taskData: KanbanTaskFormData,
    storeId: string,
    createdBy: string,
    createdByName: string
  ): Promise<string> => {
    try {
      const tasksRef = collection(db, "kanbanTasks");
      const now = Timestamp.now();

      const newTask = {
        title: taskData.title,
        description: taskData.description,
        status: "not_started" as TaskStatus,
        priority: taskData.priority,
        createdBy,
        createdByName,
        assignedTo: taskData.assignedTo,
        assignedToName: taskData.assignedTo
          ? await getUserName(taskData.assignedTo)
          : undefined,
        storeId,
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
        createdAt: now,
        updatedAt: now,
        lastActionAt: now,
        tags: taskData.tags,
        isPublic: taskData.isPublic,
      };

      const docRef = await addDoc(tasksRef, newTask);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  /**
   * タスクのステータスを更新
   */
  updateTaskStatus: async (
    taskId: string,
    status: TaskStatus
  ): Promise<void> => {
    try {
      const taskRef = doc(db, "kanbanTasks", taskId);
      await updateDoc(taskRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * タスクを更新
   */
  updateTask: async (
    taskId: string,
    updates: Partial<KanbanTask>
  ): Promise<void> => {
    try {
      const taskRef = doc(db, "kanbanTasks", taskId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Dateオブジェクトがある場合はTimestampに変換
      if (updateData.dueDate && updateData.dueDate instanceof Date) {
        (updateData as any).dueDate = Timestamp.fromDate(updateData.dueDate);
      }

      await updateDoc(taskRef, updateData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * タスクを削除
   */
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      const taskRef = doc(db, "kanbanTasks", taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      throw error;
    }
  },
};

/**
 * ユーザー名を取得するヘルパー関数
 */
const getUserName = async (userId: string): Promise<string> => {
  try {
    // usersコレクションからユーザー名を取得
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return userData.nickname || "Unknown User";
    }

    return "Unknown User";
  } catch (error) {
    return "Unknown User";
  }
};
