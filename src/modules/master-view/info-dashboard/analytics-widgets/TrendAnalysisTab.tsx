import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import Box from "@/common/common-ui/ui-base/BoxComponent";

type PeriodType = "3months" | "6months" | "1year";

interface TrendAnalysisTabProps {
  shifts?: any[];
  users?: any[];
}

export const TrendAnalysisTab: React.FC<TrendAnalysisTabProps> = ({
  shifts = [],
  users = [],
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("3months");
  const [trendData, setTrendData] = useState({
    "3months": {
      labels: [] as string[],
      workHours: [] as number[],
      costs: [] as number[],
      efficiency: [] as number[],
    },
    "6months": {
      labels: [] as string[],
      workHours: [] as number[],
      costs: [] as number[],
      efficiency: [] as number[],
    },
    "1year": {
      labels: [] as string[],
      workHours: [] as number[],
      costs: [] as number[],
      efficiency: [] as number[],
    },
  });

  // 実データからトレンド分析データを計算
  useEffect(() => {
    if (shifts.length === 0 || users.length === 0) return;

    const currentDate = new Date();

    // 各期間のデータを計算
    const calculatePeriodData = (months: number) => {
      const labels: string[] = [];
      const workHours: number[] = [];
      const costs: number[] = [];
      const efficiency: number[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const targetDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const monthLabel = `${targetDate.getMonth() + 1}月`;
        labels.push(monthLabel);

        // その月のシフトデータ
        const monthShifts = shifts.filter((shift) => {
          const shiftDate = new Date(shift.date);
          return (
            shiftDate.getMonth() === targetDate.getMonth() &&
            shiftDate.getFullYear() === targetDate.getFullYear()
          );
        });

        // 稼働時間（正確な実労働時間で計算）
        let monthWorkingMinutes = 0;
        let monthCost = 0;

        monthShifts.forEach((shift) => {
          const user = users.find((u) => u.uid === shift.userId);
          const hourlyWage = user?.hourlyWage || 1100;

          const { totalMinutes, totalWage } = calculateTotalWage(
            {
              startTime: shift.startTime,
              endTime: shift.endTime,
              classes: shift.classes || [],
            },
            hourlyWage
          );

          monthWorkingMinutes += totalMinutes;
          monthCost += totalWage;
        });

        const monthHours = monthWorkingMinutes / 60;
        workHours.push(Math.round(monthHours));
        costs.push(Math.round(monthCost));

        // 効率性（完了率）
        const completedShifts = monthShifts.filter(
          (shift) => shift.status === "completed" || shift.status === "approved"
        ).length;
        const efficiencyRate =
          monthShifts.length > 0
            ? (completedShifts / monthShifts.length) * 100
            : 0;
        efficiency.push(Math.round(efficiencyRate));
      }

      return { labels, workHours, costs, efficiency };
    };

    setTrendData({
      "3months": calculatePeriodData(3),
      "6months": calculatePeriodData(6),
      "1year": calculatePeriodData(12),
    });
  }, [shifts, users]);

  const currentData = trendData[selectedPeriod];

  // トレンド計算
  const workHoursTrend =
    currentData.workHours.length >= 2
      ? Math.round(
          (((currentData.workHours[currentData.workHours.length - 1] ?? 0) -
            (currentData.workHours[currentData.workHours.length - 2] ?? 0)) /
            (currentData.workHours[currentData.workHours.length - 2] ?? 1)) *
            100
        )
      : 0;

  const costsTrend =
    currentData.costs.length >= 2
      ? Math.round(
          (((currentData.costs[currentData.costs.length - 1] ?? 0) -
            (currentData.costs[currentData.costs.length - 2] ?? 0)) /
            (currentData.costs[currentData.costs.length - 2] ?? 1)) *
            100
        )
      : 0;

  const efficiencyTrend =
    currentData.efficiency.length >= 2
      ? (currentData.efficiency[currentData.efficiency.length - 1] ?? 0) -
        (currentData.efficiency[currentData.efficiency.length - 2] ?? 0)
      : 0;

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[
        { key: "3months", label: "3ヶ月" },
        { key: "6months", label: "6ヶ月" },
        { key: "1year", label: "1年" },
      ].map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period.key as PeriodType)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSimpleChart = (data: number[], color: string, label: string) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={styles.chartBars}>
        {data.map((value, index) => {
          const maxValue = Math.max(...data);
          const height = maxValue > 0 ? (value / maxValue) * 80 : 0;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { height, backgroundColor: color }]} />
              <Text style={styles.barLabel}>{currentData.labels[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 期間選択 */}
      <Box variant="card" style={styles.selectorCard}>
        <Text style={styles.sectionTitle}>期間選択</Text>
        {renderPeriodSelector()}
      </Box>

      {/* トレンド概要 */}
      <Box variant="card" style={styles.overviewCard}>
        <Text style={styles.sectionTitle}>トレンド概要</Text>
        <View style={styles.trendGrid}>
          <View style={styles.trendItem}>
            <MaterialIcons name="schedule" size={24} color={colors.primary} />
            <Text style={styles.trendValue}>
              {currentData.workHours.length > 0
                ? currentData.workHours[currentData.workHours.length - 1]
                : 0}
              h
            </Text>
            <Text style={styles.trendLabel}>稼働時間</Text>
            <Text
              style={[
                styles.trendChange,
                {
                  color:
                    workHoursTrend >= 0
                      ? colors.success || "#4CAF50"
                      : colors.error,
                },
              ]}
            >
              {workHoursTrend > 0 ? "+" : ""}
              {workHoursTrend}%
            </Text>
          </View>
          <View style={styles.trendItem}>
            <MaterialIcons
              name="attach-money"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.trendValue}>
              ¥
              {currentData.costs.length > 0
                ? (currentData.costs[
                    currentData.costs.length - 1
                  ] ?? 0).toLocaleString()
                : 0}
            </Text>
            <Text style={styles.trendLabel}>人件費</Text>
            <Text
              style={[
                styles.trendChange,
                {
                  color:
                    costsTrend <= 0
                      ? colors.success || "#4CAF50"
                      : colors.error,
                },
              ]}
            >
              {costsTrend > 0 ? "+" : ""}
              {costsTrend}%
            </Text>
          </View>
          <View style={styles.trendItem}>
            <MaterialIcons
              name="trending-up"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.trendValue}>
              {currentData.efficiency.length > 0
                ? currentData.efficiency[currentData.efficiency.length - 1]
                : 0}
              %
            </Text>
            <Text style={styles.trendLabel}>効率性</Text>
            <Text
              style={[
                styles.trendChange,
                {
                  color:
                    efficiencyTrend >= 0
                      ? colors.success || "#4CAF50"
                      : colors.error,
                },
              ]}
            >
              {efficiencyTrend > 0 ? "+" : ""}
              {efficiencyTrend}pt
            </Text>
          </View>
        </View>
      </Box>

      {/* チャート */}
      <Box variant="card" style={styles.chartCard}>
        <Text style={styles.sectionTitle}>推移グラフ</Text>
        {renderSimpleChart(
          currentData.workHours,
          colors.primary,
          "稼働時間 (h)"
        )}
        {renderSimpleChart(
          currentData.costs.map((c) => Math.round(c / 1000)),
          colors.warning || "#FF9800",
          "人件費 (千円)"
        )}
        {renderSimpleChart(
          currentData.efficiency,
          colors.success || "#4CAF50",
          "効率性 (%)"
        )}
      </Box>

      {/* 予測・提案 */}
      <Box variant="card" style={styles.insightCard}>
        <Text style={styles.sectionTitle}>傾向分析</Text>
        <View style={styles.insightList}>
          <View style={styles.insightItem}>
            <MaterialIcons
              name={workHoursTrend >= 0 ? "trending-up" : "trending-down"}
              size={20}
              color={
                workHoursTrend >= 0 ? colors.success || "#4CAF50" : colors.error
              }
            />
            <Text style={styles.insightText}>
              稼働時間が前月比{workHoursTrend > 0 ? "増加" : "減少"}しています（
              {workHoursTrend}%）
            </Text>
          </View>
          <View style={styles.insightItem}>
            <MaterialIcons
              name={costsTrend <= 0 ? "trending-down" : "trending-up"}
              size={20}
              color={
                costsTrend <= 0 ? colors.success || "#4CAF50" : colors.error
              }
            />
            <Text style={styles.insightText}>
              人件費が前月比{costsTrend > 0 ? "増加" : "減少"}しています（
              {costsTrend}%）
            </Text>
          </View>
          <View style={styles.insightItem}>
            <MaterialIcons
              name="lightbulb"
              size={20}
              color={colors.warning || "#FF9800"}
            />
            <Text style={styles.insightText}>
              効率性スコアが{efficiencyTrend >= 0 ? "改善" : "悪化"}
              傾向にあります
            </Text>
          </View>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  selectorCard: {
    marginBottom: layout.padding.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: layout.padding.small,
    paddingHorizontal: layout.padding.medium,
    borderRadius: layout.borderRadius.small,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  periodButtonTextActive: {
    color: colors.surface,
    fontWeight: "600",
  },
  overviewCard: {
    marginBottom: layout.padding.medium,
  },
  trendGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trendItem: {
    flex: 1,
    alignItems: "center",
    padding: layout.padding.small,
  },
  trendValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginVertical: 4,
  },
  trendLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  trendChange: {
    fontSize: 12,
    fontWeight: "600",
  },
  chartCard: {
    marginBottom: layout.padding.medium,
  },
  chartContainer: {
    marginBottom: layout.padding.large,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 100,
    paddingHorizontal: layout.padding.small,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  bar: {
    width: "80%",
    minHeight: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: colors.text.disabled,
    textAlign: "center",
  },
  insightCard: {
    marginBottom: layout.padding.medium,
  },
  insightList: {
    gap: layout.padding.small,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: layout.padding.small,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.small,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: layout.padding.small,
  },
});
