import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import { useAuth } from "@/services/auth/useAuth";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { createInfoDashboardStyles } from "./InfoDashboard.styles";
import Button from "@/common/common-ui/ui-forms/FormButton";

interface StaffData {
  id: string;
  name: string;
  workedHours: number;
  efficiency: number;
  totalEarnings: number;
  hourlyWage: number;
}

/**
 * Wrapper: auth解決後にContentをマウントし、hooks が loading=true の初期状態から開始する
 */
export const InfoDashboard: React.FC = () => {
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(
    () => createInfoDashboardStyles(theme, bp),
    [theme, bp]
  );

  const { user, loading: authLoading } = useAuth();

  if (authLoading || !user?.storeId) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colorScheme.primary}
          />
          <Text style={styles.loadingText}>データ読み込み中...</Text>
        </View>
      </View>
    );
  }

  return <InfoDashboardContent storeId={user.storeId} />;
};

const InfoDashboardContent: React.FC<{ storeId: string }> = ({ storeId }) => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500000);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInputValue, setBudgetInputValue] = useState(
    monthlyBudget.toString()
  );

  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(
    () => createInfoDashboardStyles(theme, bp),
    [theme, bp]
  );

  const { isTablet, isDesktop } = bp;

  const numColumns = isDesktop ? 5 : isTablet ? 3 : 1;

  const { shifts, loading: shiftsLoading } = useShiftsRealtime(storeId);
  const { users, loading: usersLoading } = useUsers(storeId);

  // Current month shifts
  const currentMonthShifts = useMemo(() => {
    const now = new Date();
    return shifts.filter((shift) => {
      const d = new Date(shift.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        (shift.status === "approved" ||
          shift.status === "pending" ||
          shift.status === "completed")
      );
    });
  }, [shifts]);

  // Aggregate data
  const realData = useMemo(() => {
    let totalMinutes = 0;
    let totalAmount = 0;

    currentMonthShifts.forEach((shift) => {
      const shiftUser = users.find((u) => u.uid === shift.userId);
      const hourlyWage = shiftUser?.hourlyWage || 1100;
      const { totalMinutes: workMinutes, totalWage: workWage } =
        calculateTotalWage(
          {
            startTime: shift.startTime,
            endTime: shift.endTime,
            classes: shift.classes || [],
          },
          hourlyWage
        );
      totalMinutes += workMinutes;
      totalAmount += workWage;
    });

    const totalHours = totalMinutes / 60;
    const totalCost = Math.round(totalAmount);
    const budgetUsage = (totalCost / monthlyBudget) * 100;

    return { totalHours, totalCost, budgetUsage };
  }, [currentMonthShifts, users, monthlyBudget]);

  // Per-staff data
  const staffData = useMemo<StaffData[]>(() => {
    if (users.length === 0) return [];

    return users.map((u) => {
      const userShifts = currentMonthShifts.filter(
        (s) => s.userId === u.uid
      );
      let totalWorkedMinutes = 0;
      let totalEarnings = 0;
      const hourlyWage = u.hourlyWage || 1100;

      userShifts.forEach((shift) => {
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

      const workedHours = Math.round((totalWorkedMinutes / 60) * 10) / 10;
      const targetHours = 100;
      const efficiency = Math.round(((workedHours / targetHours) * 100) * 10) / 10;

      return {
        id: u.uid,
        name: u.nickname || "名前未設定",
        workedHours,
        efficiency,
        totalEarnings: Math.round(totalEarnings),
        hourlyWage,
      };
    });
  }, [users, currentMonthShifts]);

  // Cost breakdown
  const costData = useMemo(() => {
    if (currentMonthShifts.length === 0)
      return { fixedCosts: 0, variableCosts: 0, overtimeCosts: 0, totalCost: 0 };

    let totalCost = 0;
    let totalMinutes = 0;

    currentMonthShifts.forEach((shift) => {
      const u = users.find((usr) => usr.uid === shift.userId);
      const hourlyWage = u?.hourlyWage || 1100;
      const { totalMinutes: wm, totalWage: ww } = calculateTotalWage(
        {
          startTime: shift.startTime,
          endTime: shift.endTime,
          classes: shift.classes || [],
        },
        hourlyWage
      );
      totalCost += ww;
      totalMinutes += wm;
    });

    const avgHourlyWage =
      users.length > 0
        ? users.reduce((sum, u) => sum + (u.hourlyWage || 1100), 0) /
          users.length
        : 1100;

    const totalHours = totalMinutes / 60;
    const regularHours = Math.min(totalHours, users.length * 160);
    const overtimeHours = Math.max(0, totalHours - regularHours);

    const fixedCosts = regularHours * avgHourlyWage;
    const overtimeCosts = overtimeHours * avgHourlyWage * 1.25;
    const variableCosts = Math.max(0, totalCost - fixedCosts - overtimeCosts);

    return {
      fixedCosts: Math.max(0, Math.round(fixedCosts)),
      variableCosts: Math.round(variableCosts),
      overtimeCosts: Math.max(0, Math.round(overtimeCosts)),
      totalCost: Math.round(totalCost),
    };
  }, [currentMonthShifts, users]);

  // Budget status helpers
  const getBudgetStatusColor = useCallback(
    (usageRate: number) => {
      if (usageRate >= 90) return theme.colorScheme.error;
      if (usageRate >= 75) return theme.colorScheme.warning;
      if (usageRate >= 50) return theme.colorScheme.primary;
      return theme.colorScheme.success;
    },
    [theme]
  );

  const getBudgetStatusIcon = useCallback((usageRate: number) => {
    if (usageRate >= 90) return "warning";
    if (usageRate >= 75) return "priority-high";
    if (usageRate >= 50) return "info";
    return "check-circle";
  }, []);

  const getBudgetStatusText = useCallback((usageRate: number) => {
    if (usageRate >= 90) return "予算超過危険";
    if (usageRate >= 75) return "予算注意";
    if (usageRate >= 50) return "予算適正";
    return "予算余裕あり";
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  }, []);

  const handleBudgetSave = useCallback(() => {
    const numericValue = parseInt(budgetInputValue.replace(/,/g, ""), 10);
    if (!isNaN(numericValue)) {
      setMonthlyBudget(numericValue);
    }
    setShowBudgetModal(false);
  }, [budgetInputValue]);

  const openBudgetModal = useCallback(() => {
    setBudgetInputValue(monthlyBudget.toString());
    setShowBudgetModal(true);
  }, [monthlyBudget]);

  const getEfficiencyColor = useCallback(
    (efficiency: number) => {
      if (efficiency >= 100) return theme.colorScheme.success;
      if (efficiency >= 80) return theme.colorScheme.warning;
      return theme.colorScheme.error;
    },
    [theme]
  );

  // Render cost bar
  const renderCostBar = (
    amount: number,
    total: number,
    color: string,
    label: string
  ) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    return (
      <View style={styles.costBarContainer} key={label}>
        <View style={styles.costBarHeader}>
          <Text style={styles.costBarLabel}>{label}</Text>
          <Text style={styles.costBarAmount}>
            ¥{amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.costBarBg}>
          <View
            style={[
              styles.costBarFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  // Staff card renderer
  const renderStaffCard = useCallback(
    ({ item }: { item: StaffData }) => {
      const effColor = getEfficiencyColor(item.efficiency);
      return (
        <View style={styles.staffCard}>
          <Text style={styles.staffName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.staffHours}>{item.workedHours}h</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(item.efficiency, 100)}%`,
                    backgroundColor: effColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {item.efficiency.toFixed(0)}%
            </Text>
          </View>
          <Text style={styles.staffWage}>
            ¥{item.totalEarnings.toLocaleString()}
          </Text>
        </View>
      );
    },
    [styles, getEfficiencyColor]
  );

  // Loading (データ取得中)
  if (shiftsLoading || usersLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colorScheme.primary}
          />
          <Text style={styles.loadingText}>データ読み込み中...</Text>
        </View>
      </View>
    );
  }

  // No data
  if (shifts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <MaterialIcons
            name="info"
            size={48}
            color={theme.colorScheme.outline}
          />
          <Text style={styles.noDataTitle}>シフトデータがありません</Text>
          <Text style={styles.noDataDescription}>
            シフトを登録すると、ここに分析データが表示されます。
          </Text>
        </View>
      </View>
    );
  }

  const remainingBudget = monthlyBudget - realData.totalCost;
  const costPerHour =
    realData.totalHours > 0
      ? Math.round(realData.totalCost / realData.totalHours)
      : 0;
  const costPerStaff =
    users.length > 0
      ? Math.round(realData.totalCost / users.length)
      : 0;
  const budgetEfficiency =
    monthlyBudget > 0
      ? (((monthlyBudget - realData.totalCost) / monthlyBudget) * 100).toFixed(
          1
        )
      : "0.0";

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Budget button */}
          <TouchableOpacity
            style={[
              styles.budgetButton,
              {
                borderLeftColor: getBudgetStatusColor(realData.budgetUsage),
                borderLeftWidth: 4,
              },
            ]}
            onPress={openBudgetModal}
          >
            <MaterialIcons
              name={getBudgetStatusIcon(realData.budgetUsage) as any}
              size={20}
              color={getBudgetStatusColor(realData.budgetUsage)}
            />
            <View style={styles.budgetButtonContent}>
              <Text style={styles.budgetButtonText}>
                月間予算 {formatCurrency(monthlyBudget)}
              </Text>
              <Text
                style={[
                  styles.budgetStatusText,
                  { color: getBudgetStatusColor(realData.budgetUsage) },
                ]}
              >
                {getBudgetStatusText(realData.budgetUsage)} (
                {realData.budgetUsage.toFixed(1)}%)
              </Text>
            </View>
          </TouchableOpacity>

          {/* 1. Monthly summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>月間サマリー</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <MaterialIcons
                  name="schedule"
                  size={24}
                  color={theme.colorScheme.primary}
                />
                <Text style={styles.summaryValue}>
                  {realData.totalHours.toFixed(1)}h
                </Text>
                <Text style={styles.summaryLabel}>総稼働時間</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons
                  name="attach-money"
                  size={24}
                  color={theme.colorScheme.primary}
                />
                <Text style={styles.summaryValue}>
                  ¥{realData.totalCost.toLocaleString()}
                </Text>
                <Text style={styles.summaryLabel}>総人件費</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons
                  name="pie-chart"
                  size={24}
                  color={theme.colorScheme.primary}
                />
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        realData.budgetUsage > 100
                          ? theme.colorScheme.error
                          : theme.colorScheme.success,
                    },
                  ]}
                >
                  {realData.budgetUsage.toFixed(1)}%
                </Text>
                <Text style={styles.summaryLabel}>予算使用率</Text>
              </View>
            </View>
          </View>

          {/* 2. Staff grid */}
          <View style={styles.staffSection}>
            <Text style={styles.sectionTitle}>スタッフ別稼働状況</Text>
            <FlatList
              data={staffData}
              renderItem={renderStaffCard}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              key={numColumns}
              columnWrapperStyle={
                numColumns > 1 ? styles.columnWrapper : undefined
              }
              scrollEnabled={false}
              contentContainerStyle={{ gap: theme.spacing.md }}
            />
          </View>

          {/* 3. Budget vs Actual */}
          <View style={styles.budgetCard}>
            <Text style={styles.sectionTitle}>予算 vs 実績</Text>
            <View style={styles.budgetGrid}>
              <View style={styles.budgetItem}>
                <MaterialIcons
                  name="account-balance-wallet"
                  size={24}
                  color={theme.colorScheme.primary}
                />
                <Text style={styles.budgetValue}>
                  ¥{monthlyBudget.toLocaleString()}
                </Text>
                <Text style={styles.budgetLabel}>月間予算</Text>
              </View>
              <View style={styles.budgetItem}>
                <MaterialIcons
                  name="trending-down"
                  size={24}
                  color={
                    realData.totalCost > monthlyBudget
                      ? theme.colorScheme.error
                      : theme.colorScheme.success
                  }
                />
                <Text
                  style={[
                    styles.budgetValue,
                    {
                      color:
                        realData.totalCost > monthlyBudget
                          ? theme.colorScheme.error
                          : theme.colorScheme.onSurface,
                    },
                  ]}
                >
                  ¥{realData.totalCost.toLocaleString()}
                </Text>
                <Text style={styles.budgetLabel}>実績</Text>
              </View>
              <View style={styles.budgetItem}>
                <MaterialIcons
                  name="savings"
                  size={24}
                  color={
                    remainingBudget >= 0
                      ? theme.colorScheme.success
                      : theme.colorScheme.error
                  }
                />
                <Text
                  style={[
                    styles.budgetValue,
                    {
                      color:
                        remainingBudget >= 0
                          ? theme.colorScheme.success
                          : theme.colorScheme.error,
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
            <View style={styles.budgetProgressBg}>
              <View
                style={[
                  styles.budgetProgressFill,
                  {
                    width: `${Math.min(realData.budgetUsage, 100)}%`,
                    backgroundColor:
                      realData.budgetUsage > 100
                        ? theme.colorScheme.error
                        : realData.budgetUsage > 80
                          ? theme.colorScheme.warning
                          : theme.colorScheme.success,
                  },
                ]}
              />
            </View>
            <Text style={styles.budgetUsageText}>
              予算使用率: {realData.budgetUsage.toFixed(1)}%
            </Text>
          </View>

          {/* 4. Cost breakdown */}
          <View style={styles.costCard}>
            <Text style={styles.sectionTitle}>コスト内訳</Text>
            {renderCostBar(
              costData.fixedCosts,
              costData.totalCost,
              theme.colorScheme.primary,
              "固定費"
            )}
            {renderCostBar(
              costData.variableCosts,
              costData.totalCost,
              theme.colorScheme.secondary,
              "変動費"
            )}
            {renderCostBar(
              costData.overtimeCosts,
              costData.totalCost,
              theme.colorScheme.warning,
              "残業代"
            )}
          </View>

          {/* 5. Efficiency metrics */}
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>効率指標</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <MaterialIcons
                  name="timeline"
                  size={20}
                  color={theme.colorScheme.primary}
                />
                <Text style={styles.metricValue}>
                  ¥{costPerHour.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>時間あたりコスト</Text>
              </View>
              <View style={styles.metricItem}>
                <MaterialIcons
                  name="person"
                  size={20}
                  color={theme.colorScheme.primary}
                />
                <Text style={styles.metricValue}>
                  ¥{costPerStaff.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>スタッフあたり</Text>
              </View>
              <View style={styles.metricItem}>
                <MaterialIcons
                  name="trending-up"
                  size={20}
                  color={theme.colorScheme.primary}
                />
                <Text style={styles.metricValue}>{budgetEfficiency}%</Text>
                <Text style={styles.metricLabel}>予算効率</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Budget modal */}
        <Modal
          visible={showBudgetModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBudgetModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <MaterialIcons
                  name="account-balance"
                  size={24}
                  color={theme.colorScheme.primary}
                />
                <Text style={styles.modalTitle}>月間予算設定</Text>
                <TouchableOpacity
                  onPress={() => setShowBudgetModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={theme.colorScheme.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalInputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>¥</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={budgetInputValue}
                    onChangeText={setBudgetInputValue}
                    keyboardType="numeric"
                    placeholder="500000"
                    placeholderTextColor={theme.colorScheme.outline}
                    autoFocus={true}
                  />
                </View>
              </View>

              <View style={styles.modalButtonContainer}>
                <Button
                  title="キャンセル"
                  onPress={() => setShowBudgetModal(false)}
                  variant="outline"
                  size="medium"
                  style={styles.modalButton}
                />
                <Button
                  title="保存"
                  onPress={handleBudgetSave}
                  variant="primary"
                  size="medium"
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};
