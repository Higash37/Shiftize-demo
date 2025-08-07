import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";
import {
  ExtendedTask,
  TaskPerformance,
} from "@/common/common-models/model-shift/shiftTypes";
import { TaskAnalytics } from "@/common/common-utils/util-task/taskAnalytics";
import { colors } from "@/common/common-constants/ColorConstants";
import { typography } from "@/common/common-constants/TypographyConstants";

interface TaskPerformanceViewProps {
  storeId: string;
  tasks: ExtendedTask[];
}

interface PerformanceMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
  unit?: string;
}

interface RankingItem {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  completedTasks: number;
  avgTime: number;
}

/**
 * TaskPerformanceView - タスクパフォーマンス分析ビュー
 *
 * タスクの実行状況、効率性、ランキングなどの
 * パフォーマンス分析データを表示
 */
export const TaskPerformanceView: React.FC<TaskPerformanceViewProps> = ({
  storeId,
  tasks,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("week");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    loadPerformanceData();
  }, [storeId, selectedPeriod]);

  const loadPerformanceData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // 実際のデータ取得（モック）
      const mockMetrics: PerformanceMetric[] = [
        {
          id: "1",
          title: "タスク完了率",
          value: 87.5,
          change: 5.2,
          icon: "check-circle",
          color: "#34C759",
          unit: "%",
        },
        {
          id: "2",
          title: "平均実行時間",
          value: 23.4,
          change: -2.1,
          icon: "schedule",
          color: "#007AFF",
          unit: "分",
        },
        {
          id: "3",
          title: "効率スコア",
          value: 8.3,
          change: 0.7,
          icon: "trending-up",
          color: "#FF9500",
          unit: "/10",
        },
        {
          id: "4",
          title: "総タスク数",
          value: 156,
          change: 12,
          icon: "assignment",
          color: "#AF52DE",
        },
      ];

      const mockRankings: RankingItem[] = [
        {
          userId: "1",
          userName: "田中太郎",
          score: 92.5,
          rank: 1,
          completedTasks: 45,
          avgTime: 18.2,
        },
        {
          userId: "2",
          userName: "佐藤花子",
          score: 89.3,
          rank: 2,
          completedTasks: 42,
          avgTime: 19.8,
        },
        {
          userId: "3",
          userName: "山田一郎",
          score: 85.7,
          rank: 3,
          completedTasks: 38,
          avgTime: 22.1,
        },
      ];

      setMetrics(mockMetrics);
      setRankings(mockRankings);
    } catch (error) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadPerformanceData(true);
  };

  // 期間選択ボタン
  const renderPeriodSelector = () => {
    const periods = [
      { key: "day", label: "今日" },
      { key: "week", label: "今週" },
      { key: "month", label: "今月" },
    ] as const;

    return (
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.activePeriodButtonText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // メトリクスカード
  const renderMetricsCards = () => (
    <View style={styles.metricsContainer}>
      {metrics.map((metric) => (
        <Box key={metric.id} variant="card" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <MaterialIcons
              name={metric.icon as any}
              size={24}
              color={metric.color}
            />
            <View style={styles.changeIndicator}>
              <MaterialIcons
                name={metric.change >= 0 ? "trending-up" : "trending-down"}
                size={16}
                color={metric.change >= 0 ? "#34C759" : "#FF3B30"}
              />
              <Text
                style={[
                  styles.changeText,
                  { color: metric.change >= 0 ? "#34C759" : "#FF3B30" },
                ]}
              >
                {metric.change >= 0 ? "+" : ""}
                {metric.change}
              </Text>
            </View>
          </View>

          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>
              {metric.value}
              {metric.unit || ""}
            </Text>
            <Text style={styles.metricTitle}>{metric.title}</Text>
          </View>
        </Box>
      ))}
    </View>
  );

  // ランキング表示
  const renderRankings = () => (
    <Box variant="card" style={styles.rankingContainer}>
      <View style={styles.rankingHeader}>
        <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
        <Text style={styles.rankingTitle}>パフォーマンスランキング</Text>
      </View>

      <View style={styles.rankingList}>
        {rankings.map((item) => (
          <View key={item.userId} style={styles.rankingItem}>
            <View style={styles.rankPosition}>
              <Text style={styles.rankNumber}>{item.rank}</Text>
              {item.rank <= 3 && (
                <MaterialIcons
                  name="emoji-events"
                  size={16}
                  color={
                    item.rank === 1
                      ? "#FFD700"
                      : item.rank === 2
                      ? "#C0C0C0"
                      : "#CD7F32"
                  }
                />
              )}
            </View>

            <View style={styles.rankInfo}>
              <Text style={styles.rankUserName}>{item.userName}</Text>
              <View style={styles.rankStats}>
                <Text style={styles.rankStat}>
                  {item.completedTasks}タスク完了
                </Text>
                <Text style={styles.rankStat}>平均{item.avgTime}分</Text>
              </View>
            </View>

            <View style={styles.rankScore}>
              <Text style={styles.scoreValue}>{item.score}</Text>
              <Text style={styles.scoreLabel}>スコア</Text>
            </View>
          </View>
        ))}
      </View>
    </Box>
  );

  // タスク分析グラフ（簡略版）
  const renderTaskAnalysis = () => (
    <Box variant="card" style={styles.analysisContainer}>
      <Text style={styles.analysisTitle}>タスク分析</Text>

      <View style={styles.analysisGrid}>
        <View style={styles.analysisItem}>
          <MaterialIcons name="check-circle" size={20} color="#34C759" />
          <Text style={styles.analysisLabel}>完了率</Text>
          <Text style={styles.analysisValue}>87.5%</Text>
        </View>

        <View style={styles.analysisItem}>
          <MaterialIcons name="access-time" size={20} color="#FF9500" />
          <Text style={styles.analysisLabel}>遅延率</Text>
          <Text style={styles.analysisValue}>12.3%</Text>
        </View>

        <View style={styles.analysisItem}>
          <MaterialIcons name="trending-up" size={20} color="#007AFF" />
          <Text style={styles.analysisLabel}>改善率</Text>
          <Text style={styles.analysisValue}>+5.2%</Text>
        </View>

        <View style={styles.analysisItem}>
          <MaterialIcons name="group" size={20} color="#AF52DE" />
          <Text style={styles.analysisLabel}>参加率</Text>
          <Text style={styles.analysisValue}>94.1%</Text>
        </View>
      </View>
    </Box>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="analytics" size={48} color="#C7C7CC" />
        <Text style={styles.loadingText}>分析データを読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {renderPeriodSelector()}
      {renderMetricsCards()}
      {renderRankings()}
      {renderTaskAnalysis()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },

  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    fontWeight: "500",
  },

  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },

  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },

  activePeriodButton: {
    backgroundColor: "#007AFF",
  },

  periodButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },

  activePeriodButtonText: {
    color: "#FFFFFF",
  },

  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },

  metricCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
  },

  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },

  changeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },

  metricContent: {
    alignItems: "center",
  },

  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },

  metricTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },

  rankingContainer: {
    padding: 16,
    marginBottom: 16,
  },

  rankingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  rankingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },

  rankingList: {
    gap: 12,
  },

  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  rankPosition: {
    width: 40,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  rankNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 4,
  },

  rankInfo: {
    flex: 1,
    marginLeft: 12,
  },

  rankUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },

  rankStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },

  rankStat: {
    fontSize: 12,
    color: "#6B7280",
  },

  rankScore: {
    alignItems: "center",
  },

  scoreValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },

  scoreLabel: {
    fontSize: 10,
    color: "#6B7280",
  },

  analysisContainer: {
    padding: 16,
    marginBottom: 16,
  },

  analysisTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },

  analysisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  analysisItem: {
    flex: 1,
    minWidth: 120,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },

  analysisLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  analysisValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 2,
  },
});
