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
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../services/firebase/firebase-core";
import { NormalTask, TaskFormData, TaskStatus, TaskMemo } from "./types";

export const normalTaskService = {
  /**
   * 店舗のタスク一覧を取得
   */ getTasks: async (storeId: string): Promise<NormalTask[]> => {
    try {
      const tasksRef = collection(db, "NormalTasks");
      const q = query(
        tasksRef,
        where("storeId", "==", storeId)
        // orderBy("createdAt", "desc") // 一時的に削除
      );

      const querySnapshot = await getDocs(q);
      const tasks: NormalTask[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          title: data["title"],
          description: data["description"],
          status: data["status"],
          priority: data["priority"],
          createdBy: data["createdBy"],
          createdByName: data["createdByName"],
          assignedTo: data["assignedTo"],
          assignedToName: data["assignedToName"],
          storeId: data["storeId"],
          dueDate: data["dueDate"]?.toDate(),
          startDate: data["startDate"]?.toDate(),
          completedDate: data["completedDate"]?.toDate(),
          completedBy: data["completedBy"],
          completedByName: data["completedByName"],
          createdAt: data["createdAt"].toDate(),
          updatedAt: data["updatedAt"].toDate(),
          currentAssignedTo: data["currentAssignedTo"],
          currentAssignedToName: data["currentAssignedToName"],
          lastActionAt: data["lastActionAt"]?.toDate() || data["updatedAt"].toDate(),
          tags: data["tags"] || [],
          isPublic: data["isPublic"] || false,
        });
      });

      // クライアント側でソート（lastActionAt優先、次にcreatedAt）
      tasks.sort((a, b) => {
        const aTime = a.lastActionAt || a.createdAt;
        const bTime = b.lastActionAt || b.createdAt;
        return bTime.getTime() - aTime.getTime();
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
    taskData: TaskFormData,
    storeId: string,
    createdBy: string,
    createdByName: string
  ): Promise<string> => {
    try {
      const tasksRef = collection(db, "NormalTasks");
      const now = Timestamp.now();

      const newTask = {
        title: taskData.title,
        description: taskData.description,
        status: "not_started" as TaskStatus,
        priority: taskData.priority,
        createdBy,
        createdByName,
        assignedTo: null, // 現在は未実装のため常にnull
        assignedToName: null, // 現在は未実装のため常にnull
        storeId,
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
        startDate: taskData.startDate
          ? Timestamp.fromDate(taskData.startDate)
          : null,
        completedDate: null,
        completedBy: null,
        completedByName: null,
        currentAssignedTo: null,
        currentAssignedToName: null,
        lastActionAt: now,
        createdAt: now,
        updatedAt: now,
        tags: taskData.tags || [],
        isPublic: taskData.isPublic || false,
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
    status: TaskStatus,
    userId?: string,
    userName?: string
  ): Promise<void> => {
    try {
      const taskRef = doc(db, "NormalTasks", taskId);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
        lastActionAt: Timestamp.now(),
      };

      // 実施中にする場合は担当者を設定
      if (status === "in_progress" && userId && userName) {
        updateData.currentAssignedTo = userId;
        updateData.currentAssignedToName = userName;
      }
      // 完了や未実施にする場合は担当者をクリア
      else if (status === "completed" || status === "not_started") {
        updateData.currentAssignedTo = null;
        updateData.currentAssignedToName = null;
      }

      // 完了状態にする場合は完了情報を記録
      if (status === "completed" && userId && userName) {
        updateData.completedDate = Timestamp.now();
        updateData.completedBy = userId;
        updateData.completedByName = userName;
      }
      // 完了状態から戻す場合は完了情報をクリア
      else if (status !== "completed") {
        updateData.completedDate = null;
        updateData.completedBy = null;
        updateData.completedByName = null;
      }

      await updateDoc(taskRef, updateData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * タスクを更新
   */
  updateTask: async (
    taskId: string,
    updates: Partial<NormalTask>
  ): Promise<void> => {
    try {
      const taskRef = doc(db, "NormalTasks", taskId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
        lastActionAt: Timestamp.now(),
      };

      // Dateオブジェクトがある場合はTimestampに変換
      if (updateData.dueDate && updateData.dueDate instanceof Date) {
        (updateData as any).dueDate = Timestamp.fromDate(updateData.dueDate);
      }
      if (updateData.startDate && updateData.startDate instanceof Date) {
        (updateData as any).startDate = Timestamp.fromDate(
          updateData.startDate
        );
      }
      if (
        updateData.completedDate &&
        updateData.completedDate instanceof Date
      ) {
        (updateData as any).completedDate = Timestamp.fromDate(
          updateData.completedDate
        );
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
      const taskRef = doc(db, "NormalTasks", taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      throw error;
    }
  },

  /**
   * タスクのメモを監視
   */ watchTaskMemos: (
    taskId: string,
    callback: (memos: TaskMemo[]) => void
  ) => {
    try {
      const memosRef = collection(db, "TaskMemos");
      const basicQuery = query(memosRef);

      const q = query(
        memosRef,
        where("taskId", "==", taskId)
        // orderBy("createdAt", "desc") // 一時的に削除してテスト
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const memos: TaskMemo[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();

            memos.push({
              id: doc.id,
              text: data["content"],
              createdBy: data["authorId"],
              createdByName: data["authorName"],
              createdAt: data["createdAt"].toDate(),
            });
          });

          callback(memos);
        },
        (error) => {
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      callback([]);
      return () => {};
    }
  },

  /**
   * デバッグ用：TaskMemosコレクションの内容を手動確認
   */
  debugTaskMemos: async (taskId?: string) => {
    try {
      const memosRef = collection(db, "TaskMemos");

      // 全てのメモを取得してデバッグ
      const allMemosSnapshot = await getDocs(memosRef);

      allMemosSnapshot.forEach((doc) => {
        const data = doc.data();
      });

      // 特定のtaskIdのメモを取得
      if (taskId) {
        const taskMemosQuery = query(memosRef, where("taskId", "==", taskId));
        const taskMemosSnapshot = await getDocs(taskMemosQuery);

        taskMemosSnapshot.forEach((doc) => {
          const data = doc.data();
        });
      }
    } catch (error) {
    }
  },

  /**
   * タスクメモを作成
   */
  createTaskMemo: async (
    taskId: string,
    content: string,
    authorId: string,
    authorName: string
  ): Promise<void> => {
    try {
      const memosRef = collection(db, "TaskMemos");
      const now = Timestamp.now();

      const newMemo = {
        taskId,
        content,
        authorId,
        authorName,
        createdAt: now,
      };

      const docRef = await addDoc(memosRef, newMemo);

      // タスクのlastActionAtを更新
      const taskRef = doc(db, "NormalTasks", taskId);
      await updateDoc(taskRef, {
        lastActionAt: now,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * タスクリストを監視（リアルタイム）
   */
  watchTasks: (storeId: string, callback: (tasks: NormalTask[]) => void) => {
    try {
      const tasksRef = collection(db, "NormalTasks");
      const q = query(tasksRef, where("storeId", "==", storeId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasks: NormalTask[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({
            id: doc.id,
            title: data["title"],
            description: data["description"],
            status: data["status"],
            priority: data["priority"],
            createdBy: data["createdBy"],
            createdByName: data["createdByName"],
            assignedTo: data["assignedTo"],
            assignedToName: data["assignedToName"],
            storeId: data["storeId"],
            dueDate: data["dueDate"]?.toDate(),
            startDate: data["startDate"]?.toDate(),
            completedDate: data["completedDate"]?.toDate(),
            completedBy: data["completedBy"],
            completedByName: data["completedByName"],
            createdAt: data["createdAt"].toDate(),
            updatedAt: data["updatedAt"].toDate(),
            currentAssignedTo: data["currentAssignedTo"],
            currentAssignedToName: data["currentAssignedToName"],
            lastActionAt:
              data["lastActionAt"]?.toDate() || data["updatedAt"].toDate(),
            tags: data["tags"] || [],
            isPublic: data["isPublic"] || false,
          });
        });

        // クライアント側でソート（lastActionAt優先、次にcreatedAt）
        tasks.sort((a, b) => {
          const aTime = a.lastActionAt || a.createdAt;
          const bTime = b.lastActionAt || b.createdAt;
          return bTime.getTime() - aTime.getTime();
        });

        callback(tasks);
      });

      return unsubscribe;
    } catch (error) {
      callback([]);
      return () => {};
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
      return userData["nickname"] || "Unknown User";
    }

    return "Unknown User";
  } catch (error) {
    return "Unknown User";
  }
};
