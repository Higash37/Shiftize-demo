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
import { shadows } from "@/common/common-constants/ShadowConstants";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

interface StaffEfficiencyTabProps {
  budget: number;
  shifts?: any[]; // シフトデータ
  users?: any[]; // ユーザーデータ
  totalHours?: number;
  totalCost?: number;
  budgetUsage?: number;
}

interface StaffData {
  id: string;
  name: string;
  workedHours: number;
  targetHours: number;
  hourlyWage: number;
  efficiency: number;
  totalEarnings: number; // 実際の収入
}

export const StaffEfficiencyTab: React.FC<StaffEfficiencyTabProps> = ({
  budget,
  shifts = [],
  users = [],
  totalHours = 0,
  totalCost = 0,
  budgetUsage = 0,
}) => {
  const [staffData, setStaffData] = useState<StaffData[]>([]);
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  // 実データからスタッフ別稼働データを計算
  useEffect(() => {
    if (users.length === 0) return;

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

    const staffStats = users.map((user) => {
      const userShifts = currentMonthShifts.filter(
        (shift) => shift.userId === user.uid
      );

      // ガントチャートと同じロジックで正確な時間と金額を計算
      let totalWorkedMinutes = 0;
      let totalEarnings = 0;

      userShifts.forEach((shift) => {
        const hourlyWage = user.hourlyWage || 1100; // デフォルト時給を1100円に統一

        // 授業時間を除外した実労働時間を計算
        const { totalMinutes, totalWage } = calculateTotalWage(
          {
            startTime: shift.startTime,
            endTime: shift.endTime,
            classes: shift.classes || [],
          },
          hourlyWage
        );

        totalWorkedMinutes += totalMinutes;
        totalEarnings += totalWage;
      });

      const workedHours = totalWorkedMinutes / 60;
      // 目標時間を月100時間と仮定（実際のアプリではユーザー設定から取得）
      const targetHours = 100;
      const hourlyWage = user.hourlyWage || 1100;
      const efficiency = (workedHours / targetHours) * 100;

      return {
        id: user.uid,
        name: user.nickname || user.name || "名前未設定",
        workedHours: Math.round(workedHours * 10) / 10, // 小数点1桁まで
        targetHours,
        hourlyWage,
        efficiency: Math.round(efficiency * 10) / 10,
        totalEarnings: Math.round(totalEarnings), // 実際の収入
      };
    });

    setStaffData(staffStats);
  }, [shifts, users]);

  // 集計データは実データから計算
  const totalWorkedHours = staffData.reduce(
    (sum, staff) => sum + staff.workedHours,
    0
  );
  const totalCostAmount = staffData.reduce(
    (sum, staff) => sum + staff.totalEarnings,
    0
  );
  const budgetUsageRate = (totalCostAmount / budget) * 100;

  const renderProgressBar = (
    percentage: number,
    color: string = colors.primary
  ) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{percentage.toFixed(1)}%</Text>
    </View>
  );

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return colors.success || "#4CAF50";
    if (efficiency >= 80) return colors.warning || "#FF9800";
    return colors.error;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 全体サマリー */}
      <Box variant="card" style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>月間サマリー</Text>
        <View
          style={[
            styles.summaryGrid,
            isTabletOrDesktop && styles.summaryGridDesktop,
          ]}
        >
          <View style={styles.summaryItem}>
            <MaterialIcons name="schedule" size={24} color={colors.primary} />
            <Text style={styles.summaryValue}>{totalWorkedHours}h</Text>
            <Text style={styles.summaryLabel}>総稼働時間</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialIcons
              name="attach-money"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.summaryValue}>
              ¥{totalCostAmount.toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>総人件費</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialIcons name="pie-chart" size={24} color={colors.primary} />
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    budgetUsageRate > 100
                      ? colors.error
                      : colors.success || "#4CAF50",
                },
              ]}
            >
              {budgetUsageRate.toFixed(1)}%
            </Text>
            <Text style={styles.summaryLabel}>予算使用率</Text>
          </View>
        </View>
      </Box>

      {/* スタッフ別稼働率 */}
      <Box variant="card" style={styles.staffCard}>
        <Text style={styles.sectionTitle}>スタッフ別稼働状況</Text>
        {staffData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <MaterialIcons
              name="people"
              size={32}
              color={colors.text.disabled}
            />
            <Text style={styles.noDataText}>データがありません</Text>
          </View>
        ) : (
          staffData.map((staff) => (
            <View key={staff.id} style={styles.staffItem}>
              <View style={styles.staffHeader}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffHours}>
                  {staff.workedHours}h / {staff.targetHours}h
                </Text>
              </View>

              {renderProgressBar(
                staff.efficiency,
                getEfficiencyColor(staff.efficiency)
              )}

              <View style={styles.staffDetails}>
                <Text style={styles.staffDetailText}>
                  時給: ¥{staff.hourlyWage.toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.staffDetailText,
                    styles.staffEarningsText,
                    {
                      color:
                        staff.totalEarnings > 100000
                          ? colors.success || "#4CAF50"
                          : colors.text.secondary,
                    },
                  ]}
                >
                  月額: ¥{staff.totalEarnings.toLocaleString()}
                </Text>
              </View>

              {/* 個人ごとの収入バー */}
              <View style={styles.earningsBarContainer}>
                <View style={styles.earningsBarBg}>
                  <View
                    style={[
                      styles.earningsBarFill,
                      {
                        width: `${Math.min(
                          (staff.totalEarnings /
                            Math.max(
                              ...staffData.map((s) => s.totalEarnings),
                              1
                            )) *
                            100,
                          100
                        )}%`,
                        backgroundColor:
                          staff.totalEarnings > 100000
                            ? colors.success || "#4CAF50"
                            : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.earningsBarText}>
                  {(
                    (staff.totalEarnings /
                      Math.max(...staffData.map((s) => s.totalEarnings), 1)) *
                    100
                  ).toFixed(0)}
                  %
                </Text>
              </View>
            </View>
          ))
        )}
      </Box>

      {/* 効率性指標 */}
      <Box variant="card" style={styles.metricsCard}>
        <Text style={styles.sectionTitle}>効率性指標</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              ¥{(totalCostAmount / totalWorkedHours).toFixed(0)}
            </Text>
            <Text style={styles.metricLabel}>時間あたりコスト</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{staffData.length}人</Text>
            <Text style={styles.metricLabel}>稼働スタッフ数</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {(totalWorkedHours / staffData.length).toFixed(1)}h
            </Text>
            <Text style={styles.metricLabel}>平均稼働時間</Text>
          </View>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: layout.padding.medium,
  },
  staffCard: {
    marginBottom: layout.padding.medium,
  },
  metricsCard: {
    marginBottom: layout.padding.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryGridDesktop: {
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: "center",
  },
  staffItem: {
    marginBottom: layout.padding.medium,
    paddingBottom: layout.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  staffHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  staffHours: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginRight: layout.padding.small,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
    minWidth: 45,
    textAlign: "right",
  },
  staffDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  staffDetailText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  staffEarningsText: {
    fontWeight: "600",
  },
  earningsBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: layout.padding.small,
  },
  earningsBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginRight: layout.padding.small,
  },
  earningsBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  earningsBarText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
    minWidth: 35,
    textAlign: "right",
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: layout.padding.large,
  },
  noDataText: {
    fontSize: 14,
    color: colors.text.disabled,
    marginTop: layout.padding.small,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
});
