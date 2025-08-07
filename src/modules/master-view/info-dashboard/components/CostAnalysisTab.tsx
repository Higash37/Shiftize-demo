import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

interface CostAnalysisTabProps {
  budget: number;
  shifts?: any[];
  users?: any[];
  totalCost?: number;
  totalHours?: number;
}

export const CostAnalysisTab: React.FC<CostAnalysisTabProps> = ({
  budget,
  shifts = [],
  users = [],
  totalCost = 0,
  totalHours = 0,
}) => {
  const [costData, setCostData] = useState({
    totalCost: 0,
    lastMonthCost: 0,
    fixedCosts: 0,
    variableCosts: 0,
    overtimeCosts: 0,
  });

  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  // 実データからコスト分析データを計算
  useEffect(() => {
    if (shifts.length === 0) return;

    const currentDate = new Date();
    const currentMonthShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shiftDate.getMonth() === currentDate.getMonth() &&
        shiftDate.getFullYear() === currentDate.getFullYear() &&
        (shift.status === "approved" ||
          shift.status === "pending" ||
          shift.status === "completed")
      );
    });

    // 前月のシフトも取得
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const lastMonthShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shiftDate.getMonth() === lastMonth.getMonth() &&
        shiftDate.getFullYear() === lastMonth.getFullYear() &&
        (shift.status === "approved" ||
          shift.status === "pending" ||
          shift.status === "completed")
      );
    });

    // 現在月のコスト計算（正確な計算）
    let currentMonthCost = 0;
    let currentMonthMinutes = 0;

    currentMonthShifts.forEach((shift) => {
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

      currentMonthCost += totalWage;
      currentMonthMinutes += totalMinutes;
    });

    // 前月のコスト計算（正確な計算）
    let lastMonthCostCalc = 0;

    lastMonthShifts.forEach((shift) => {
      const user = users.find((u) => u.uid === shift.userId);
      const hourlyWage = user?.hourlyWage || 1100;

      const { totalWage } = calculateTotalWage(
        {
          startTime: shift.startTime,
          endTime: shift.endTime,
          classes: shift.classes || [],
        },
        hourlyWage
      );

      lastMonthCostCalc += totalWage;
    });

    // 固定費と変動費の分類（簡易版）
    const avgHourlyWage =
      users.length > 0
        ? users.reduce((sum, user) => sum + (user.hourlyWage || 1100), 0) /
          users.length
        : 1100;
    const currentMonthHours = currentMonthMinutes / 60;
    const regularHours = Math.min(currentMonthHours, users.length * 160); // 1人月160時間を標準とする
    const overtimeHours = Math.max(0, currentMonthHours - regularHours);

    const fixedCosts = regularHours * avgHourlyWage;
    const variableCosts =
      currentMonthCost - fixedCosts - overtimeHours * avgHourlyWage * 1.25;
    const overtimeCosts = overtimeHours * avgHourlyWage * 1.25; // 残業代25%増し

    setCostData({
      totalCost: Math.round(currentMonthCost),
      lastMonthCost: Math.round(lastMonthCostCalc),
      fixedCosts: Math.max(0, Math.round(fixedCosts)),
      variableCosts: Math.max(0, Math.round(variableCosts)),
      overtimeCosts: Math.max(0, Math.round(overtimeCosts)),
    });
  }, [shifts, users]);

  // 実際の労働時間を計算（propsのtotalHoursではなく）
  const actualTotalHours = React.useMemo(() => {
    const currentDate = new Date();
    const currentMonthShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shiftDate.getMonth() === currentDate.getMonth() &&
        shiftDate.getFullYear() === currentDate.getFullYear() &&
        (shift.status === "approved" ||
          shift.status === "pending" ||
          shift.status === "completed")
      );
    });

    let totalMinutes = 0;
    currentMonthShifts.forEach((shift) => {
      const { totalMinutes: workMinutes } = calculateTotalWage(
        {
          startTime: shift.startTime,
          endTime: shift.endTime,
          classes: shift.classes || [],
        },
        1100 // 時給は計算に影響しないので固定値
      );
      totalMinutes += workMinutes;
    });

    return totalMinutes / 60;
  }, [shifts]);

  const budgetUsage = (costData.totalCost / budget) * 100;
  const costChange =
    ((costData.totalCost - costData.lastMonthCost) / costData.lastMonthCost) *
    100;
  const remainingBudget = budget - costData.totalCost;

  const renderCostBar = (
    amount: number,
    total: number,
    color: string,
    label: string
  ) => {
    const percentage = (amount / total) * 100;
    return (
      <View style={styles.costBarContainer}>
        <View style={styles.costBarHeader}>
          <Text style={styles.costBarLabel}>{label}</Text>
          <Text style={styles.costBarAmount}>¥{amount.toLocaleString()}</Text>
        </View>
        <View style={styles.costBarBg}>
          <View
            style={[
              styles.costBarFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.costBarPercentage}>{percentage.toFixed(1)}%</Text>
      </View>
    );
  };

  const getCostChangeColor = (change: number) => {
    if (change > 0) return colors.error;
    if (change < -5) return colors.success || "#4CAF50";
    return colors.warning || "#FF9800";
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 予算vs実績 */}
      <Box variant="card" style={styles.budgetCard}>
        <Text style={styles.sectionTitle}>予算 vs 実績</Text>

        <View style={styles.budgetComparison}>
          <View style={styles.budgetItem}>
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.budgetValue}>¥{budget.toLocaleString()}</Text>
            <Text style={styles.budgetLabel}>月間予算</Text>
          </View>

          <View style={styles.budgetItem}>
            <MaterialIcons
              name="trending-down"
              size={24}
              color={
                costData.totalCost > budget
                  ? colors.error
                  : colors.success || "#4CAF50"
              }
            />
            <Text
              style={[
                styles.budgetValue,
                {
                  color:
                    costData.totalCost > budget
                      ? colors.error
                      : colors.text.primary,
                },
              ]}
            >
              ¥{costData.totalCost.toLocaleString()}
            </Text>
            <Text style={styles.budgetLabel}>実績</Text>
          </View>

          <View style={styles.budgetItem}>
            <MaterialIcons
              name="savings"
              size={24}
              color={
                remainingBudget >= 0
                  ? colors.success || "#4CAF50"
                  : colors.error
              }
            />
            <Text
              style={[
                styles.budgetValue,
                {
                  color:
                    remainingBudget >= 0
                      ? colors.success || "#4CAF50"
                      : colors.error,
                },
              ]}
            >
              ¥{Math.abs(remainingBudget).toLocaleString()}
            </Text>
            <Text style={styles.budgetLabel}>
              {remainingBudget >= 0 ? "残予算" : "予算超過"}
            </Text>
          </View>
        </View>

        <View style={styles.budgetProgress}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(budgetUsage, 100)}%`,
                  backgroundColor:
                    budgetUsage > 100
                      ? colors.error
                      : budgetUsage > 80
                      ? colors.warning || "#FF9800"
                      : colors.success || "#4CAF50",
                },
              ]}
            />
          </View>
          <Text style={styles.budgetUsageText}>
            予算使用率: {budgetUsage.toFixed(1)}%
          </Text>
        </View>
      </Box>

      {/* コスト内訳 */}
      <Box variant="card" style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>コスト内訳</Text>

        {renderCostBar(
          costData.fixedCosts,
          costData.totalCost,
          colors.primary,
          "固定費"
        )}
        {renderCostBar(
          costData.variableCosts,
          costData.totalCost,
          colors.secondary,
          "変動費"
        )}
        {renderCostBar(
          costData.overtimeCosts,
          costData.totalCost,
          colors.warning || "#FF9800",
          "残業代"
        )}
      </Box>

      {/* 前月比較 */}
      <Box variant="card" style={styles.comparisonCard}>
        <Text style={styles.sectionTitle}>前月比較</Text>

        <View style={styles.comparisonGrid}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonValue}>
              ¥{costData.lastMonthCost.toLocaleString()}
            </Text>
            <Text style={styles.comparisonLabel}>前月実績</Text>
          </View>

          <View style={styles.comparisonItem}>
            <Text
              style={[
                styles.comparisonValue,
                { color: getCostChangeColor(costChange) },
              ]}
            >
              {costChange > 0 ? "+" : ""}
              {costChange.toFixed(1)}%
            </Text>
            <Text style={styles.comparisonLabel}>増減率</Text>
          </View>

          <View style={styles.comparisonItem}>
            <Text
              style={[
                styles.comparisonValue,
                { color: getCostChangeColor(costChange) },
              ]}
            >
              ¥
              {Math.abs(
                costData.totalCost - costData.lastMonthCost
              ).toLocaleString()}
            </Text>
            <Text style={styles.comparisonLabel}>
              {costChange > 0 ? "増加" : "削減"}
            </Text>
          </View>
        </View>
      </Box>

      {/* コスト効率指標 */}
      <Box variant="card" style={styles.efficiencyCard}>
        <Text style={styles.sectionTitle}>コスト効率指標</Text>

        <View style={styles.efficiencyGrid}>
          <View style={styles.efficiencyItem}>
            <MaterialIcons name="timeline" size={20} color={colors.primary} />
            <Text style={styles.efficiencyValue}>
              ¥
              {Math.round(
                costData.totalCost / Math.max(1, actualTotalHours) || 0
              ).toLocaleString()}
            </Text>
            <Text style={styles.efficiencyLabel}>時間あたりコスト</Text>
          </View>

          <View style={styles.efficiencyItem}>
            <MaterialIcons name="person" size={20} color={colors.primary} />
            <Text style={styles.efficiencyValue}>
              ¥
              {Math.round(
                costData.totalCost / Math.max(1, users.length) || 0
              ).toLocaleString()}
            </Text>
            <Text style={styles.efficiencyLabel}>スタッフあたり</Text>
          </View>

          <View style={styles.efficiencyItem}>
            <MaterialIcons
              name="trending-up"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.efficiencyValue}>
              {(((budget - costData.totalCost) / budget) * 100).toFixed(1)}%
            </Text>
            <Text style={styles.efficiencyLabel}>予算効率</Text>
          </View>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  budgetCard: {
    marginBottom: layout.padding.medium,
  },
  breakdownCard: {
    marginBottom: layout.padding.medium,
  },
  comparisonCard: {
    marginBottom: layout.padding.medium,
  },
  efficiencyCard: {
    marginBottom: layout.padding.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  budgetComparison: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: layout.padding.medium,
  },
  budgetItem: {
    alignItems: "center",
    flex: 1,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: 4,
  },
  budgetLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: "center",
  },
  budgetProgress: {
    marginTop: layout.padding.small,
  },
  progressBg: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    marginBottom: layout.padding.small,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  budgetUsageText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  costBarContainer: {
    marginBottom: layout.padding.medium,
  },
  costBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  costBarLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  costBarAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  costBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 4,
  },
  costBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  costBarPercentage: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "right",
  },
  comparisonGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  comparisonItem: {
    alignItems: "center",
    flex: 1,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  comparisonLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
  efficiencyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  efficiencyItem: {
    alignItems: "center",
    flex: 1,
  },
  efficiencyValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  efficiencyLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
});
