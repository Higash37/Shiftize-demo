import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import Box from "@/common/common-ui/ui-base/BoxComponent";

interface ShiftMetricsTabProps {
  shifts?: any[];
  users?: any[];
}

export const ShiftMetricsTab: React.FC<ShiftMetricsTabProps> = ({
  shifts = [],
  users = [],
}) => {
  const [metrics, setMetrics] = useState({
    totalShifts: 0,
    filledShifts: 0,
    canceledShifts: 0,
    overtimeShifts: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
    averageShiftLength: 0,
  });

  // 実データからシフト指標を計算
  useEffect(() => {
    if (shifts.length === 0) return;

    const currentDate = new Date();
    const currentMonthShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shiftDate.getMonth() === currentDate.getMonth() &&
        shiftDate.getFullYear() === currentDate.getFullYear()
      );
    });

    const totalShifts = currentMonthShifts.length;
    const filledShifts = currentMonthShifts.filter(
      (shift) => shift.status === "completed" || shift.status === "confirmed"
    ).length;
    const canceledShifts = currentMonthShifts.filter(
      (shift) => shift.status === "cancelled"
    ).length;

    // 8時間以上を残業シフトとして扱う（正確な実労働時間で計算）
    const overtimeShifts = currentMonthShifts.filter((shift) => {
      const { totalMinutes } = calculateTotalWage(
        {
          startTime: shift.startTime,
          endTime: shift.endTime,
          classes: shift.classes || [],
        },
        1100 // 時給は計算に影響しないので固定値
      );
      const hours = totalMinutes / 60;
      return hours > 8;
    }).length;

    // リクエスト関連（シフトのstatusから推測）
    const approvedRequests = currentMonthShifts.filter(
      (shift) => shift.status === "confirmed" || shift.status === "approved"
    ).length;
    const pendingRequests = currentMonthShifts.filter(
      (shift) => shift.status === "pending"
    ).length;
    const rejectedRequests = currentMonthShifts.filter(
      (shift) => shift.status === "rejected"
    ).length;

    // 平均シフト時間を正確に計算（実労働時間ベース）
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

    const averageShiftLength =
      totalShifts > 0 ? totalWorkingMinutes / 60 / totalShifts : 0;

    setMetrics({
      totalShifts,
      filledShifts,
      canceledShifts,
      overtimeShifts,
      approvedRequests,
      pendingRequests,
      rejectedRequests,
      averageShiftLength: Math.round(averageShiftLength * 10) / 10,
    });
  }, [shifts]);

  const fillRate = (metrics.filledShifts / metrics.totalShifts) * 100;
  const cancelRate = (metrics.canceledShifts / metrics.totalShifts) * 100;
  const overtimeRate = (metrics.overtimeShifts / metrics.filledShifts) * 100;
  const approvalRate =
    (metrics.approvedRequests /
      (metrics.approvedRequests + metrics.rejectedRequests)) *
    100;

  const renderMetricCard = (
    icon: string,
    value: string,
    label: string,
    color: string = colors.primary,
    trend?: { value: number; isPositive: boolean }
  ) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <MaterialIcons name={icon as any} size={24} color={color} />
        {trend && (
          <View style={styles.trendContainer}>
            <MaterialIcons
              name={trend.isPositive ? "trending-up" : "trending-down"}
              size={16}
              color={
                trend.isPositive ? colors.success || "#4CAF50" : colors.error
              }
            />
            <Text
              style={[
                styles.trendText,
                {
                  color: trend.isPositive
                    ? colors.success || "#4CAF50"
                    : colors.error,
                },
              ]}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );

  const renderProgressIndicator = (
    percentage: number,
    label: string,
    color: string
  ) => (
    <View style={styles.progressIndicator}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{percentage.toFixed(1)}%</Text>
      </View>
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 主要指標 */}
      <Box variant="card" style={styles.mainMetricsCard}>
        <Text style={styles.sectionTitle}>シフト運営指標</Text>

        <View style={styles.metricsGrid}>
          {renderMetricCard(
            "event-available",
            `${metrics.filledShifts}/${metrics.totalShifts}`,
            "シフト充足率",
            colors.primary,
            { value: 2.3, isPositive: true }
          )}

          {renderMetricCard(
            "cancel",
            metrics.canceledShifts.toString(),
            "キャンセル数",
            colors.error,
            { value: -1.2, isPositive: true }
          )}

          {renderMetricCard(
            "schedule",
            `${metrics.averageShiftLength}h`,
            "平均シフト時間",
            colors.secondary,
            { value: 0.5, isPositive: true }
          )}

          {renderMetricCard(
            "access-time",
            metrics.overtimeShifts.toString(),
            "残業シフト数",
            colors.warning || "#FF9800",
            { value: 3.1, isPositive: false }
          )}
        </View>
      </Box>

      {/* 充足率詳細 */}
      <Box variant="card" style={styles.fillRateCard}>
        <Text style={styles.sectionTitle}>シフト充足状況</Text>

        {renderProgressIndicator(
          fillRate,
          "全体充足率",
          colors.success || "#4CAF50"
        )}
        {renderProgressIndicator(cancelRate, "キャンセル率", colors.error)}
        {renderProgressIndicator(
          overtimeRate,
          "残業率",
          colors.warning || "#FF9800"
        )}
      </Box>

      {/* 申請・承認状況 */}
      <Box variant="card" style={styles.requestCard}>
        <Text style={styles.sectionTitle}>申請・承認状況</Text>

        <View style={styles.requestGrid}>
          <View style={styles.requestItem}>
            <View style={styles.requestIcon}>
              <MaterialIcons
                name="pending"
                size={20}
                color={colors.warning || "#FF9800"}
              />
            </View>
            <Text style={styles.requestValue}>{metrics.pendingRequests}</Text>
            <Text style={styles.requestLabel}>承認待ち</Text>
          </View>

          <View style={styles.requestItem}>
            <View style={styles.requestIcon}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={colors.success || "#4CAF50"}
              />
            </View>
            <Text style={styles.requestValue}>{metrics.approvedRequests}</Text>
            <Text style={styles.requestLabel}>承認済み</Text>
          </View>

          <View style={styles.requestItem}>
            <View style={styles.requestIcon}>
              <MaterialIcons name="cancel" size={20} color={colors.error} />
            </View>
            <Text style={styles.requestValue}>{metrics.rejectedRequests}</Text>
            <Text style={styles.requestLabel}>却下</Text>
          </View>
        </View>

        <View style={styles.approvalRate}>
          <Text style={styles.approvalRateLabel}>承認率</Text>
          <Text
            style={[
              styles.approvalRateValue,
              {
                color:
                  approvalRate >= 90
                    ? colors.success || "#4CAF50"
                    : colors.warning || "#FF9800",
              },
            ]}
          >
            {approvalRate.toFixed(1)}%
          </Text>
        </View>
      </Box>

      {/* 運営効率 */}
      <Box variant="card" style={styles.efficiencyCard}>
        <Text style={styles.sectionTitle}>運営効率</Text>

        <View style={styles.efficiencyGrid}>
          <View style={styles.efficiencyItem}>
            <MaterialIcons name="speed" size={24} color={colors.primary} />
            <Text style={styles.efficiencyValue}>95.2%</Text>
            <Text style={styles.efficiencyLabel}>シフト効率</Text>
            <Text style={styles.efficiencyDescription}>計画に対する実績</Text>
          </View>

          <View style={styles.efficiencyItem}>
            <MaterialIcons name="people" size={24} color={colors.primary} />
            <Text style={styles.efficiencyValue}>4.1h</Text>
            <Text style={styles.efficiencyLabel}>平均対応時間</Text>
            <Text style={styles.efficiencyDescription}>申請から承認まで</Text>
          </View>

          <View style={styles.efficiencyItem}>
            <MaterialIcons name="security" size={24} color={colors.primary} />
            <Text style={styles.efficiencyValue}>98.4%</Text>
            <Text style={styles.efficiencyLabel}>安定性指標</Text>
            <Text style={styles.efficiencyDescription}>予定通り実行率</Text>
          </View>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainMetricsCard: {
    marginBottom: layout.padding.medium,
  },
  fillRateCard: {
    marginBottom: layout.padding.medium,
  },
  requestCard: {
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    marginBottom: layout.padding.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  progressIndicator: {
    marginBottom: layout.padding.medium,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  requestGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: layout.padding.medium,
  },
  requestItem: {
    alignItems: "center",
    flex: 1,
  },
  requestIcon: {
    marginBottom: layout.padding.small,
  },
  requestValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  requestLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
  },
  approvalRate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary + "10",
    borderRadius: layout.borderRadius.small,
    padding: layout.padding.medium,
  },
  approvalRateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  approvalRateValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  efficiencyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  efficiencyItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: layout.padding.small,
  },
  efficiencyValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginTop: layout.padding.small,
    marginBottom: 4,
  },
  efficiencyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 2,
  },
  efficiencyDescription: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
