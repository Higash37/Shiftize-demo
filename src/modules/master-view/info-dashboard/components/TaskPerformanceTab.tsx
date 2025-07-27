import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { ExtendedTaskService } from "@/services/firebase/firebase-extended-task";
import { TaskAnalytics } from "@/common/common-utils/util-task/taskAnalytics";
import {
  ExtendedTask,
  TaskPerformance,
  TaskExecution,
} from "@/common/common-models/model-shift/shiftTypes";

interface TaskPerformanceTabProps {
  storeId: string;
}

export const TaskPerformanceTab: React.FC<TaskPerformanceTabProps> = ({
  storeId,
}) => {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [performances, setPerformances] = useState<TaskPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter"
  >("month");
  const [selectedView, setSelectedView] = useState<
    "overview" | "ranking" | "trends"
  >("overview");

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    loadTaskData();
  }, [storeId, selectedPeriod]);

  const loadTaskData = async () => {
    try {
      setLoading(true);

      // タスク一覧を取得
      const taskList = await ExtendedTaskService.getTasks(storeId);
      setTasks(taskList);

      // TODO: 実際のパフォーマンスデータ取得APIが必要
      // 現在はモックデータを使用
      const mockPerformances: TaskPerformance[] = taskList.map(
        (task, index) => ({
          taskId: task.id,
          userId: `user-${(index % 3) + 1}`,
          totalExecutions: Math.floor(Math.random() * 20) + 5,
          totalTimeMinutes: Math.floor(Math.random() * 300) + 100,
          averageTimePerExecution:
            task.baseTimeMinutes + Math.floor(Math.random() * 20) - 10,
          efficiencyRate: 0.8 + Math.random() * 0.4,
          consistencyRate: 0.7 + Math.random() * 0.3,
          proactivityRate: 0.8 + Math.random() * 0.4,
          frequencyRate: 0.8 + Math.random() * 0.2,
          completionRate: 0.9 + Math.random() * 0.1,
          accuracyRate: 0.85 + Math.random() * 0.15,
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          periodEnd: new Date(),
          lastUpdated: new Date(),
        })
      );

      setPerformances(mockPerformances);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // 概要統計の計算
  const calculateOverviewStats = () => {
    if (performances.length === 0) {
      return {
        totalTasks: 0,
        averageEfficiency: 0,
        averageProactivity: 0,
        topPerformer: "",
      };
    }

    const totalTasks = tasks.length;
    const avgEfficiency =
      performances.reduce((sum, p) => sum + p.efficiencyRate, 0) /
      performances.length;
    const avgProactivity =
      performances.reduce((sum, p) => sum + p.proactivityRate, 0) /
      performances.length;

    // トップパフォーマーを計算（総合スコア）
    const userScores = performances.reduce((acc, p) => {
      const score =
        (p.efficiencyRate + p.proactivityRate + p.frequencyRate) / 3;
      acc[p.userId] = (acc[p.userId] || 0) + score;
      return acc;
    }, {} as Record<string, number>);

    const topPerformer = Object.entries(userScores).reduce(
      (top, [userId, score]) => (score > top.score ? { userId, score } : top),
      { userId: "", score: 0 }
    );

    return {
      totalTasks,
      averageEfficiency: avgEfficiency * 100,
      averageProactivity: avgProactivity * 100,
      topPerformer: topPerformer.userId,
    };
  };

  // 効率性チャート用データ
  const getEfficiencyChartData = () => {
    const taskEfficiency = tasks
      .map((task) => {
        const taskPerfs = performances.filter((p) => p.taskId === task.id);
        const avgEfficiency =
          taskPerfs.length > 0
            ? taskPerfs.reduce((sum, p) => sum + p.efficiencyRate, 0) /
              taskPerfs.length
            : 0;
        return {
          name:
            task.title.length > 10
              ? task.title.substring(0, 10) + "..."
              : task.title,
          efficiency: avgEfficiency * 100,
          color:
            task.priority === "high"
              ? "#f44336"
              : task.priority === "medium"
              ? "#ff9800"
              : "#4caf50",
        };
      })
      .sort((a, b) => b.efficiency - a.efficiency);

    return {
      labels: taskEfficiency.slice(0, 6).map((t) => t.name),
      datasets: [
        {
          data: taskEfficiency.slice(0, 6).map((t) => t.efficiency),
          colors: taskEfficiency.slice(0, 6).map((t) => () => t.color),
        },
      ],
    };
  };

  // ランキングデータ
  const getRankingData = () => {
    const userStats = performances.reduce((acc, p) => {
      if (!acc[p.userId]) {
        acc[p.userId] = {
          userId: p.userId,
          totalExecutions: 0,
          totalEfficiency: 0,
          totalProactivity: 0,
          taskCount: 0,
        };
      }

      acc[p.userId].totalExecutions += p.totalExecutions;
      acc[p.userId].totalEfficiency += p.efficiencyRate;
      acc[p.userId].totalProactivity += p.proactivityRate;
      acc[p.userId].taskCount += 1;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(userStats)
      .map((stat: any) => ({
        ...stat,
        avgEfficiency:
          stat.taskCount > 0 ? stat.totalEfficiency / stat.taskCount : 0,
        avgProactivity:
          stat.taskCount > 0 ? stat.totalProactivity / stat.taskCount : 0,
        totalScore:
          stat.taskCount > 0
            ? (stat.totalEfficiency + stat.totalProactivity) /
              (stat.taskCount * 2)
            : 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  const overviewStats = calculateOverviewStats();
  const efficiencyData = getEfficiencyChartData();
  const rankingData = getRankingData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 期間選択 */}
      <View style={styles.periodSelector}>
        {(["week", "month", "quarter"] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {period === "week"
                ? "週間"
                : period === "month"
                ? "月間"
                : "四半期"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ビュー選択 */}
      <View style={styles.viewSelector}>
        {(["overview", "ranking", "trends"] as const).map((view) => (
          <TouchableOpacity
            key={view}
            style={[
              styles.viewButton,
              selectedView === view && styles.viewButtonActive,
            ]}
            onPress={() => setSelectedView(view)}
          >
            <Ionicons
              name={
                view === "overview"
                  ? "analytics-outline"
                  : view === "ranking"
                  ? "trophy-outline"
                  : "trending-up-outline"
              }
              size={20}
              color={selectedView === view ? "white" : colors.text.secondary}
            />
            <Text
              style={[
                styles.viewButtonText,
                selectedView === view && styles.viewButtonTextActive,
              ]}
            >
              {view === "overview"
                ? "概要"
                : view === "ranking"
                ? "ランキング"
                : "トレンド"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* コンテンツ表示 */}
      {selectedView === "overview" && (
        <View>
          {/* 概要統計 */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.statValue}>{overviewStats.totalTasks}</Text>
              <Text style={styles.statLabel}>アクティブタスク</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="speedometer-outline" size={24} color="#4caf50" />
              <Text style={styles.statValue}>
                {overviewStats.averageEfficiency.toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>平均効率性</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up-outline" size={24} color="#ff9800" />
              <Text style={styles.statValue}>
                {overviewStats.averageProactivity.toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>平均積極性</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy-outline" size={24} color="#f44336" />
              <Text style={styles.statValue}>
                #{overviewStats.topPerformer}
              </Text>
              <Text style={styles.statLabel}>トップ</Text>
            </View>
          </View>

          {/* 効率性チャート */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>タスク別効率性</Text>
            {efficiencyData.labels.length > 0 ? (
              <View style={styles.efficiencyList}>
                {efficiencyData.labels.map((label, index) => {
                  const efficiency = efficiencyData.datasets[0].data[index];
                  const color =
                    efficiencyData.datasets[0].colors?.[index]?.() ||
                    colors.primary;
                  return (
                    <View key={label} style={styles.efficiencyItem}>
                      <Text style={styles.efficiencyLabel}>{label}</Text>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${Math.min(efficiency, 100)}%`,
                              backgroundColor: color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.efficiencyValue}>
                        {efficiency.toFixed(1)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>データがありません</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {selectedView === "ranking" && (
        <View style={styles.rankingContainer}>
          <Text style={styles.sectionTitle}>パフォーマンスランキング</Text>
          {rankingData.map((user, index) => (
            <View key={user.userId} style={styles.rankingItem}>
              <View style={styles.rankingPosition}>
                <Text style={styles.rankingNumber}>#{index + 1}</Text>
                {index === 0 && (
                  <Ionicons name="trophy" size={20} color="#ffd700" />
                )}
                {index === 1 && (
                  <Ionicons name="medal" size={20} color="#c0c0c0" />
                )}
                {index === 2 && (
                  <Ionicons name="medal" size={20} color="#cd7f32" />
                )}
              </View>
              <View style={styles.rankingDetails}>
                <Text style={styles.rankingUserId}>ユーザー {user.userId}</Text>
                <View style={styles.rankingStats}>
                  <Text style={styles.rankingStat}>
                    効率性: {(user.avgEfficiency * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.rankingStat}>
                    積極性: {(user.avgProactivity * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.rankingStat}>
                    実行回数: {user.totalExecutions}回
                  </Text>
                </View>
              </View>
              <View style={styles.rankingScore}>
                <Text style={styles.scoreValue}>
                  {(user.totalScore * 100).toFixed(1)}
                </Text>
                <Text style={styles.scoreLabel}>総合</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {selectedView === "trends" && (
        <View style={styles.trendsContainer}>
          <Text style={styles.sectionTitle}>パフォーマンストレンド</Text>
          <Text style={styles.comingSoon}>トレンド分析機能は準備中です</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "white",
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  periodButtonTextActive: {
    color: "white",
    fontWeight: "600",
  },
  viewSelector: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  viewButtonActive: {
    backgroundColor: colors.primary,
  },
  viewButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  viewButtonTextActive: {
    color: "white",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flex: 1,
    minWidth: "48%",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  efficiencyList: {
    gap: 12,
  },
  efficiencyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  efficiencyLabel: {
    fontSize: 14,
    color: colors.text.primary,
    width: 80,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  efficiencyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    width: 50,
    textAlign: "right",
  },
  noDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  rankingContainer: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rankingPosition: {
    flexDirection: "row",
    alignItems: "center",
    width: 60,
    gap: 4,
  },
  rankingNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  rankingDetails: {
    flex: 1,
    marginLeft: 12,
  },
  rankingUserId: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  rankingStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rankingStat: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  rankingScore: {
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  trendsContainer: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  comingSoon: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 32,
  },
});
