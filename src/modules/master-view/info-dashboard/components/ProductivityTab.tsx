import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

interface ProductivityTabProps {
  shifts?: any[];
  users?: any[];
  totalHours?: number;
  totalCost?: number;
}

export const ProductivityTab: React.FC<ProductivityTabProps> = ({
  shifts = [],
  users = [],
  totalHours = 0,
  totalCost = 0,
}) => {
  const [productivityData, setProductivityData] = useState({
    tasksCompleted: 0,
    averageTaskTime: 0,
    productivityScore: 0,
    peakHours: "データなし",
    efficiency: 0,
    qualityScore: 0,
  });

  // 実データから生産性指標を計算
  useEffect(() => {
    if (shifts.length === 0 || users.length === 0) return;

    const currentDate = new Date();
    const currentMonthShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shiftDate.getMonth() === currentDate.getMonth() &&
        shiftDate.getFullYear() === currentDate.getFullYear()
      );
    });

    // タスク完了数（完了したシフト数として計算）
    const tasksCompleted = currentMonthShifts.filter(
      (shift) => shift.status === "completed" || shift.status === "approved"
    ).length;

    // 平均タスク時間（正確な実労働時間で計算）
    let totalWorkingMinutes = 0;
    currentMonthShifts.forEach((shift) => {
      const { totalMinutes } = calculateTotalWage(
        {
          startTime: shift.startTime,
          endTime: shift.endTime,
          classes: shift.classes || [],
        },
        1100 // 時給は計算に影響しないので固定値
      );
      totalWorkingMinutes += totalMinutes;
    });

    const averageTaskTime =
      currentMonthShifts.length > 0
        ? totalWorkingMinutes / 60 / currentMonthShifts.length
        : 0;

    // 生産性スコア（完了率 × 効率率）
    const completionRate =
      currentMonthShifts.length > 0
        ? (tasksCompleted / currentMonthShifts.length) * 100
        : 0;
    const targetHours = users.length * 160; // 1人月160時間が目標
    const actualHours = totalWorkingMinutes / 60;
    const efficiencyRate =
      targetHours > 0 ? Math.min((actualHours / targetHours) * 100, 120) : 0; // 最大120%
    const productivityScore = completionRate * 0.6 + efficiencyRate * 0.4;

    // ピーク時間帯の分析（シフトの開始時間から推測）
    const hourCounts: { [key: number]: number } = {};
    currentMonthShifts.forEach((shift) => {
      const startHour = parseInt(shift.startTime?.split(":")[0] || "9");
      hourCounts[startHour] = (hourCounts[startHour] || 0) + 1;
    });

    const peakHour = Object.keys(hourCounts).reduce((a, b) =>
      hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
    );
    const peakHours = peakHour
      ? `${peakHour}:00-${parseInt(peakHour) + 3}:00`
      : "データなし";

    // 効率性（時間あたりのコスト効率）
    const efficiency =
      totalHours > 0 ? Math.min((tasksCompleted / totalHours) * 100, 100) : 0;

    // 品質スコア（キャンセル率の逆数として計算）
    const canceledShifts = currentMonthShifts.filter(
      (shift) => shift.status === "cancelled"
    ).length;
    const qualityScore =
      currentMonthShifts.length > 0
        ? ((currentMonthShifts.length - canceledShifts) /
            currentMonthShifts.length) *
          100
        : 0;

    setProductivityData({
      tasksCompleted,
      averageTaskTime: Math.round(averageTaskTime * 10) / 10,
      productivityScore: Math.round(productivityScore * 10) / 10,
      peakHours,
      efficiency: Math.round(efficiency * 10) / 10,
      qualityScore: Math.round(qualityScore * 10) / 10,
    });
  }, [shifts, users, totalHours, totalCost]);

  const renderProductivityCard = (
    icon: string,
    value: string,
    label: string,
    description: string,
    color: string = colors.primary,
    trend?: number
  ) => (
    <View style={styles.productivityCard}>
      <View style={styles.cardHeader}>
        <MaterialIcons name={icon as any} size={28} color={color} />
        {trend !== undefined && (
          <View style={styles.trendBadge}>
            <MaterialIcons
              name={trend >= 0 ? "trending-up" : "trending-down"}
              size={16}
              color={trend >= 0 ? colors.success || "#4CAF50" : colors.error}
            />
            <Text
              style={[
                styles.trendValue,
                {
                  color:
                    trend >= 0 ? colors.success || "#4CAF50" : colors.error,
                },
              ]}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 生産性概要 */}
      <Box variant="card" style={styles.overviewCard}>
        <Text style={styles.sectionTitle}>生産性概要</Text>
        <View style={styles.productivityGrid}>
          {renderProductivityCard(
            "check-circle",
            productivityData.tasksCompleted.toString(),
            "完了タスク",
            "月間で完了したシフト数",
            colors.success || "#4CAF50",
            5
          )}
          {renderProductivityCard(
            "schedule",
            `${productivityData.averageTaskTime}h`,
            "平均シフト時間",
            "1シフトあたりの平均時間",
            colors.primary,
            -2
          )}
          {renderProductivityCard(
            "trending-up",
            `${productivityData.productivityScore}%`,
            "生産性スコア",
            "総合的な生産性指標",
            colors.warning || "#FF9800",
            8
          )}
        </View>
      </Box>

      {/* 効率性分析 */}
      <Box variant="card" style={styles.efficiencyCard}>
        <Text style={styles.sectionTitle}>効率性分析</Text>
        <View style={styles.efficiencyGrid}>
          <View style={styles.efficiencyItem}>
            <MaterialIcons
              name="access-time"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.efficiencyValue}>
              {productivityData.peakHours}
            </Text>
            <Text style={styles.efficiencyLabel}>ピーク時間帯</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <MaterialIcons name="speed" size={24} color={colors.primary} />
            <Text style={styles.efficiencyValue}>
              {productivityData.efficiency}%
            </Text>
            <Text style={styles.efficiencyLabel}>効率性</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <MaterialIcons name="star" size={24} color={colors.primary} />
            <Text style={styles.efficiencyValue}>
              {productivityData.qualityScore}%
            </Text>
            <Text style={styles.efficiencyLabel}>品質スコア</Text>
          </View>
        </View>
      </Box>

      {/* パフォーマンス改善提案 */}
      <Box variant="card" style={styles.suggestionCard}>
        <Text style={styles.sectionTitle}>改善提案</Text>
        <View style={styles.suggestionList}>
          <View style={styles.suggestionItem}>
            <MaterialIcons
              name="lightbulb"
              size={20}
              color={colors.warning || "#FF9800"}
            />
            <Text style={styles.suggestionText}>
              ピーク時間帯（{productivityData.peakHours}
              ）の人員配置を最適化しましょう
            </Text>
          </View>
          <View style={styles.suggestionItem}>
            <MaterialIcons
              name="lightbulb"
              size={20}
              color={colors.warning || "#FF9800"}
            />
            <Text style={styles.suggestionText}>
              平均シフト時間が{productivityData.averageTaskTime}
              時間です。効率化を検討してください
            </Text>
          </View>
          <View style={styles.suggestionItem}>
            <MaterialIcons
              name="lightbulb"
              size={20}
              color={colors.warning || "#FF9800"}
            />
            <Text style={styles.suggestionText}>
              品質スコアが{productivityData.qualityScore}
              %です。さらなる向上を目指しましょう
            </Text>
          </View>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  overviewCard: {
    marginBottom: layout.padding.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  productivityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: layout.padding.small,
  },
  productivityCard: {
    flex: 1,
    minWidth: 150,
    padding: layout.padding.medium,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.text.disabled,
  },
  efficiencyCard: {
    marginBottom: layout.padding.medium,
  },
  efficiencyGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  efficiencyItem: {
    alignItems: "center",
    flex: 1,
  },
  efficiencyValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginVertical: 4,
  },
  efficiencyLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
  },
  suggestionCard: {
    marginBottom: layout.padding.medium,
  },
  suggestionList: {
    gap: layout.padding.small,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: layout.padding.small,
    backgroundColor: colors.warning + "10",
    borderRadius: layout.borderRadius.small,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning || "#FF9800",
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: layout.padding.small,
  },
});
