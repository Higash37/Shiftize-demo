import {
  TaskExecution,
  TaskPerformance,
  ExtendedTask,
} from "@/common/common-models/model-shift/shiftTypes";

/**
 * タスクパフォーマンス分析ユーティリティ
 */
export class TaskAnalytics {
  /**
   * 効率性を計算（基本時間に対する実際時間の比率）
   * 1.0を超えると効率が良い（予定より早く完了）
   */
  static calculateEfficiency(
    baseTimeMinutes: number,
    actualTimeMinutes: number
  ): number {
    if (actualTimeMinutes === 0) return 0;
    return Math.min(baseTimeMinutes / actualTimeMinutes, 2.0); // 最大2.0に制限
  }

  /**
   * 積極性を計算（基本回数に対する実際実行回数の比率）
   * 1.0を超えると積極的（予定より多く実行）
   */
  static calculateProactivity(
    baseCountPerShift: number,
    actualCount: number
  ): number {
    if (baseCountPerShift === 0) return actualCount > 0 ? 2.0 : 0;
    return Math.min(actualCount / baseCountPerShift, 3.0); // 最大3.0に制限
  }

  /**
   * 一貫性を計算（実行時間のばらつきの少なさ）
   * 標準偏差の逆数ベースで計算
   */
  static calculateConsistency(executionTimes: number[]): number {
    if (executionTimes.length < 2) return 1.0;

    const mean =
      executionTimes.reduce((sum, time) => sum + time, 0) /
      executionTimes.length;
    const variance =
      executionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) /
      executionTimes.length;
    const stdDev = Math.sqrt(variance);

    // 標準偏差が小さいほど一貫性が高い
    return stdDev === 0 ? 1.0 : Math.min(1.0 / (stdDev / mean + 0.1), 1.0);
  }

  /**
   * 頻度率を計算（シフト参加時のタスク実行率）
   */
  static calculateFrequency(
    totalShiftsWorked: number,
    shiftsWithTaskExecution: number
  ): number {
    if (totalShiftsWorked === 0) return 0;
    return shiftsWithTaskExecution / totalShiftsWorked;
  }

  /**
   * 完了率を計算（計画されたタスクの完了割合）
   */
  static calculateCompletionRate(
    plannedTasks: number,
    completedTasks: number
  ): number {
    if (plannedTasks === 0) return completedTasks > 0 ? 1.0 : 0;
    return Math.min(completedTasks / plannedTasks, 1.0);
  }

  /**
   * 総合スコアを計算（各指標の重み付き平均）
   */
  static calculateOverallScore(performance: TaskPerformance): number {
    const weights = {
      efficiency: 0.25,
      proactivity: 0.25,
      consistency: 0.2,
      frequency: 0.15,
      completion: 0.15,
    };

    return (
      performance.efficiencyRate * weights.efficiency +
      performance.proactivityRate * weights.proactivity +
      performance.consistencyRate * weights.consistency +
      performance.frequencyRate * weights.frequency +
      performance.completionRate * weights.completion
    );
  }

  /**
   * パフォーマンスレベルを判定
   */
  static getPerformanceLevel(overallScore: number): {
    level: "excellent" | "good" | "average" | "needs_improvement";
    label: string;
    color: string;
  } {
    if (overallScore >= 1.2) {
      return { level: "excellent", label: "優秀", color: "#4CAF50" };
    } else if (overallScore >= 1.0) {
      return { level: "good", label: "良好", color: "#8BC34A" };
    } else if (overallScore >= 0.8) {
      return { level: "average", label: "平均", color: "#FFC107" };
    } else {
      return { level: "needs_improvement", label: "要改善", color: "#FF5722" };
    }
  }

  /**
   * 改善提案を生成
   */
  static generateImprovementSuggestions(
    performance: TaskPerformance
  ): string[] {
    const suggestions: string[] = [];

    if (performance.efficiencyRate < 0.8) {
      suggestions.push(
        "タスクの手順を見直し、より効率的な方法を検討してください"
      );
    }

    if (performance.proactivityRate < 0.8) {
      suggestions.push("基本的なタスク実行回数の達成を心がけましょう");
    }

    if (performance.consistencyRate < 0.7) {
      suggestions.push(
        "実行時間のばらつきを減らし、一定のペースを保ちましょう"
      );
    }

    if (performance.frequencyRate < 0.8) {
      suggestions.push("シフト時により積極的にタスクに取り組みましょう");
    }

    if (performance.completionRate < 0.9) {
      suggestions.push("計画されたタスクの完了を優先しましょう");
    }

    return suggestions;
  }

  /**
   * 強みを特定
   */
  static identifyStrengths(performance: TaskPerformance): string[] {
    const strengths: string[] = [];

    if (performance.efficiencyRate >= 1.2) {
      strengths.push("効率性に優れている");
    }

    if (performance.proactivityRate >= 1.2) {
      strengths.push("積極的にタスクに取り組んでいる");
    }

    if (performance.consistencyRate >= 0.9) {
      strengths.push("安定したパフォーマンスを維持している");
    }

    if (performance.frequencyRate >= 0.9) {
      strengths.push("継続的にタスクを実行している");
    }

    if (performance.completionRate >= 0.95) {
      strengths.push("計画的にタスクを完了している");
    }

    return strengths;
  }

  /**
   * 期間比較分析
   */
  static comparePerformancePeriods(
    currentPeriod: TaskPerformance,
    previousPeriod: TaskPerformance
  ): {
    metric: string;
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down" | "stable";
  }[] {
    const metrics = [
      { key: "efficiencyRate", label: "効率性" },
      { key: "proactivityRate", label: "積極性" },
      { key: "consistencyRate", label: "一貫性" },
      { key: "frequencyRate", label: "頻度" },
      { key: "completionRate", label: "完了率" },
    ];

    return metrics.map(({ key, label }) => {
      const current = currentPeriod[key as keyof TaskPerformance] as number;
      const previous = previousPeriod[key as keyof TaskPerformance] as number;
      const change = current - previous;

      let trend: "up" | "down" | "stable" = "stable";
      if (Math.abs(change) > 0.05) {
        trend = change > 0 ? "up" : "down";
      }

      return {
        metric: label,
        current,
        previous,
        change,
        trend,
      };
    });
  }

  /**
   * チーム内でのランキング位置を計算
   */
  static calculateRanking(
    userPerformance: TaskPerformance,
    teamPerformances: TaskPerformance[],
    metric: keyof TaskPerformance
  ): {
    rank: number;
    percentile: number;
    total: number;
  } {
    const values = teamPerformances
      .map((p) => p[metric] as number)
      .sort((a, b) => b - a); // 降順ソート

    const userValue = userPerformance[metric] as number;
    const rank = values.findIndex((value) => value <= userValue) + 1;
    const percentile =
      ((teamPerformances.length - rank + 1) / teamPerformances.length) * 100;

    return {
      rank: rank || teamPerformances.length,
      percentile: Math.round(percentile),
      total: teamPerformances.length,
    };
  }
}

/**
 * タスク推奨システム
 */
export class TaskRecommendationSystem {
  /**
   * ユーザーに適したタスクを推奨
   */
  static recommendTasks(
    availableTasks: ExtendedTask[],
    userPerformances: TaskPerformance[],
    currentTime: string,
    shiftDuration: number
  ): ExtendedTask[] {
    // 時間制約でフィルタリング
    const timeFilteredTasks = availableTasks.filter((task) => {
      if (task.type === "time_specific") {
        return this.isTimeInRange(
          currentTime,
          task.restrictedStartTime,
          task.restrictedEndTime
        );
      }
      return true;
    });

    // ユーザーのパフォーマンスに基づいてスコアリング
    const scoredTasks = timeFilteredTasks.map((task) => {
      const userPerformance = userPerformances.find(
        (p) => p.taskId === task.id
      );
      let score = 0;

      // 基本スコア（優先度ベース）
      score +=
        task.priority === "high" ? 3 : task.priority === "medium" ? 2 : 1;

      // パフォーマンス履歴があるタスクを優遇
      if (userPerformance) {
        score += userPerformance.efficiencyRate * 2;
        score += userPerformance.proactivityRate * 1.5;
      }

      // 時間制約を考慮
      if (task.baseTimeMinutes <= shiftDuration * 0.8) {
        score += 1;
      }

      return { task, score };
    });

    // スコア順にソートして上位を返す
    return scoredTasks
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.task);
  }

  /**
   * 時間が範囲内かチェック
   */
  private static isTimeInRange(
    currentTime: string,
    startTime?: string,
    endTime?: string
  ): boolean {
    if (!startTime || !endTime) return true;

    const current = new Date(`2000-01-01 ${currentTime}`);
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    return current >= start && current <= end;
  }
}
