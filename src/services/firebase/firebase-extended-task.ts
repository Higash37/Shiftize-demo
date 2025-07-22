import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase-core";
import {
  ExtendedTask,
  TaskType,
  TaskTag,
  TaskLevel,
  TaskExecution,
  TaskPerformance,
} from "@/common/common-models/model-shift/shiftTypes";

/**
 * undefined値を除外するヘルパー関数
 */
const removeUndefinedFields = (obj: any): any => {
  const cleaned: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

/**
 * 拡張されたタスク管理サービス
 */
export const ExtendedTaskService = {
  /**
   * 新しいタスクを作成
   */
  createTask: async (
    taskData: Omit<ExtendedTask, "id" | "createdAt" | "updatedAt">
  ): Promise<string> => {
    try {
      // undefinedフィールドを除外
      const cleanedData = removeUndefinedFields({
        ...taskData,
        validFrom: taskData.validFrom
          ? Timestamp.fromDate(taskData.validFrom)
          : null,
        validTo: taskData.validTo ? Timestamp.fromDate(taskData.validTo) : null,
      });

      const taskRef = await addDoc(collection(db, "extendedTasks"), {
        ...cleanedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return taskRef.id;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 店舗のタスク一覧を取得
   */
  getTasks: async (
    storeId: string,
    includeInactive = false
  ): Promise<ExtendedTask[]> => {
    try {
      // 単純なクエリに変更（複合インデックス不要）
      const q = query(
        collection(db, "extendedTasks"),
        where("storeId", "==", storeId)
      );

      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          validFrom: data.validFrom?.toDate() || undefined,
          validTo: data.validTo?.toDate() || undefined,
        } as ExtendedTask;
      });

      // JavaScript側でソート
      let filteredTasks = tasks;

      // 非アクティブなタスクを除外する場合
      if (!includeInactive) {
        filteredTasks = tasks.filter((task) => task.isActive);
      }

      // 優先度と作成日でソート
      filteredTasks.sort((a, b) => {
        // 優先度順（high > medium > low）
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff =
          (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        // 優先度が同じ場合は作成日の新しい順
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      return filteredTasks;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 特定のタイプのタスクを取得
   */
  getTasksByType: async (
    storeId: string,
    type: TaskType
  ): Promise<ExtendedTask[]> => {
    try {
      const q = query(
        collection(db, "extendedTasks"),
        where("storeId", "==", storeId),
        where("type", "==", type),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          validFrom: data.validFrom?.toDate() || undefined,
          validTo: data.validTo?.toDate() || undefined,
        } as ExtendedTask;
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * 時間指定タスクを取得（指定された時間帯で実行可能なもの）
   */
  getTimeSpecificTasks: async (
    storeId: string,
    currentTime: string
  ): Promise<ExtendedTask[]> => {
    try {
      const tasks = await ExtendedTaskService.getTasksByType(
        storeId,
        "time_specific"
      );

      // 現在時刻で実行可能なタスクをフィルタリング
      return tasks.filter((task) => {
        // 新しい複数時間範囲対応
        if (task.restrictedTimeRanges && task.restrictedTimeRanges.length > 0) {
          const current = new Date(`2000-01-01 ${currentTime}`);
          return task.restrictedTimeRanges.some((range) => {
            const start = new Date(`2000-01-01 ${range.startTime}`);
            const end = new Date(`2000-01-01 ${range.endTime}`);
            return current >= start && current <= end;
          });
        }

        // 旧フォーマット（後方互換性）
        if (!task.restrictedStartTime || !task.restrictedEndTime) return true;

        const current = new Date(`2000-01-01 ${currentTime}`);
        const start = new Date(`2000-01-01 ${task.restrictedStartTime}`);
        const end = new Date(`2000-01-01 ${task.restrictedEndTime}`);

        return current >= start && current <= end;
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
    updates: Partial<ExtendedTask>
  ): Promise<void> => {
    try {
      const taskRef = doc(db, "extendedTasks", taskId);

      // undefinedフィールドを除外
      const cleanedUpdates = removeUndefinedFields({
        ...updates,
        validFrom: updates.validFrom
          ? Timestamp.fromDate(updates.validFrom)
          : null,
        validTo: updates.validTo ? Timestamp.fromDate(updates.validTo) : null,
      });

      await updateDoc(taskRef, {
        ...cleanedUpdates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * タスクを削除（論理削除）
   */
  deactivateTask: async (taskId: string): Promise<void> => {
    try {
      await ExtendedTaskService.updateTask(taskId, {
        isActive: false,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * タスクを完全削除
   */
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      const taskRef = doc(db, "extendedTasks", taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザー定義タスクを作成
   */
  createUserDefinedTask: async (
    userId: string,
    storeId: string,
    title: string,
    description: string,
    estimatedMinutes: number
  ): Promise<string> => {
    const taskData: Omit<ExtendedTask, "id" | "createdAt" | "updatedAt"> = {
      title,
      description,
      type: "custom",
      baseTimeMinutes: estimatedMinutes,
      baseCountPerShift: 1,
      tags: [],
      priority: "medium",
      difficulty: "medium",
      storeId,
      createdBy: userId,
      isActive: true,
    };

    return await ExtendedTaskService.createTask(taskData);
  },
};

/**
 * タスクパフォーマンス分析サービス
 */
export const TaskPerformanceService = {
  /**
   * タスク実行記録を保存
   */
  recordTaskExecution: async (
    shiftId: string,
    taskExecution: TaskExecution
  ): Promise<void> => {
    try {
      await addDoc(collection(db, "taskExecutions"), {
        shiftId,
        ...taskExecution,
        recordedAt: Timestamp.now(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザーのタスクパフォーマンスを計算
   */
  calculateUserTaskPerformance: async (
    userId: string,
    taskId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<TaskPerformance | null> => {
    try {
      // 実際の実装では複雑な集計クエリが必要
      // ここでは基本的な構造のみ示す
      const q = query(
        collection(db, "taskExecutions"),
        where("taskId", "==", taskId)
      );

      const querySnapshot = await getDocs(q);
      const executions = querySnapshot.docs.map((doc) => doc.data());

      // パフォーマンス指標を計算
      const totalExecutions = executions.length;
      const totalTime = executions.reduce(
        (sum, exec) => sum + exec.actualTimeMinutes,
        0
      );
      const averageTime = totalTime / totalExecutions || 0;

      // 効率性、積極性、一貫性などを計算
      // （実際の計算ロジックは要件に応じて実装）

      return {
        taskId,
        userId,
        totalExecutions,
        totalTimeMinutes: totalTime,
        averageTimePerExecution: averageTime,
        efficiencyRate: 0.85, // 仮値
        consistencyRate: 0.75, // 仮値
        proactivityRate: 1.2, // 仮値
        frequencyRate: 0.9, // 仮値
        completionRate: 0.95, // 仮値
        accuracyRate: 0.88, // 仮値
        periodStart,
        periodEnd,
        lastUpdated: new Date(),
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * 店舗全体のタスクパフォーマンスランキングを取得
   */
  getStoreTaskRanking: async (
    storeId: string,
    taskId: string,
    metric: keyof TaskPerformance
  ): Promise<Array<{ userId: string; value: number; rank: number }>> => {
    try {
      // 実装は複雑になるため、基本構造のみ
      return [];
    } catch (error) {
      return [];
    }
  },
};

// エクスポート
export const {
  createTask,
  getTasks,
  getTasksByType,
  getTimeSpecificTasks,
  updateTask,
  deactivateTask,
  deleteTask,
  createUserDefinedTask,
} = ExtendedTaskService;

export const {
  recordTaskExecution,
  calculateUserTaskPerformance,
  getStoreTaskRanking,
} = TaskPerformanceService;
