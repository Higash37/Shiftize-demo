import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import { useAuth } from "@/services/auth/useAuth";

import {
  BudgetSection,
  StaffEfficiencyTab,
  CostAnalysisTab,
  ShiftMetricsTab,
  ProductivityTab,
  TrendAnalysisTab,
} from "./analytics-widgets";
import { TaskManagementIntegratedTab } from "./analytics-widgets/TaskManagementIntegratedTab";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import Button from "@/common/common-ui/ui-forms/FormButton";

type TabType =
  | "efficiency"
  | "cost"
  | "shift"
  | "productivity"
  | "trend"
  | "tasks";

interface TabItem {
  key: TabType;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { key: "efficiency", label: "スタッフ稼働", icon: "people" },
  { key: "cost", label: "人件費分析", icon: "attach-money" },
  { key: "shift", label: "シフト指標", icon: "schedule" },
  { key: "productivity", label: "生産性", icon: "trending-up" },
  { key: "trend", label: "トレンド", icon: "analytics" },
  { key: "tasks", label: "タスク管理", icon: "assignment" },
];

/**
 * InfoDashboard - 経営ダッシュボード
 *
 * 実データ（Firebase/Firestore）を使用したシフト管理の経営分析ダッシュボード
 *
 * 機能:
 * - スタッフ稼働率分析（実データ）
 * - 人件費分析（実データ）
 * - シフト指標分析（実データ）
 * - 生産性分析（実データ）
 * - トレンド分析（実データ）
 * - 月間予算設定機能
 *
 * データソース:
 * - シフトデータ: useShiftsRealtime()から取得
 * - ユーザーデータ: useUsers()から取得
 * - 集計処理: リアルタイムで現在月のデータを計算
 *
 * Enhanced Features:
 * - Robust numeric processing with validation
 * - Production-ready error handling
 * - Type-safe data calculations
 * - Optimized performance with memoization
 */

export const InfoDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("efficiency");
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500000);
  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);
  const [budgetInputValue, setBudgetInputValue] = useState<string>(
    BudgetCalculator.formatBudgetForInput(500000)
  );
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  // 実際のデータを取得
  const { user } = useAuth();
  const { shifts, loading: shiftsLoading } = useShiftsRealtime(user?.storeId);
  const { users, loading: usersLoading } = useUsers(user?.storeId);

  // 現在の月のデータを計算（メモ化でパフォーマンス向上）
  const currentMonthShifts = useMemo(() => {
    return DashboardDataProcessor.getCurrentMonthShifts(shifts);
  }, [shifts]);

  // 実際の集計データを計算（メモ化でパフォーマンス向上）
  const realData = useMemo(() => {
    return DashboardDataProcessor.calculateRealData({
      shifts: currentMonthShifts,
      users,
      monthlyBudget,
    });
  }, [currentMonthShifts, users, monthlyBudget]);

  // 予算ステータス関連のメモ化関数
  const budgetStatusInfo = useMemo(() => {
    return BudgetCalculator.getBudgetStatusInfo(realData.budgetUsage);
  }, [realData.budgetUsage]);

  const formatCurrency = useCallback((amount: number) => {
    return BudgetCalculator.formatCurrency(amount);
  }, []);

  const handleBudgetSave = useCallback(() => {
    const validationResult = BudgetCalculator.validateAndParseBudget(budgetInputValue);
    
    if (validationResult.isValid && validationResult.value !== null) {
      setMonthlyBudget(validationResult.value);
    }
    
    setShowBudgetModal(false);
  }, [budgetInputValue]);

  const openBudgetModal = useCallback(() => {
    setBudgetInputValue(BudgetCalculator.formatBudgetForInput(monthlyBudget));
    setShowBudgetModal(true);
  }, [monthlyBudget]);

  const handleBudgetInputChange = useCallback((value: string) => {
    const sanitizedValue = BudgetCalculator.sanitizeBudgetInput(value);
    setBudgetInputValue(sanitizedValue);
  }, []);

  const renderTabContent = () => {
    const commonProps = {
      shifts,
      users,
      totalHours: realData.totalHours,
      totalCost: realData.totalCost,
      budgetUsage: realData.budgetUsage,
    };

    switch (activeTab) {
      case "efficiency":
        return <StaffEfficiencyTab budget={monthlyBudget} {...commonProps} />;
      case "cost":
        return <CostAnalysisTab budget={monthlyBudget} {...commonProps} />;
      case "shift":
        return <ShiftMetricsTab {...commonProps} />;
      case "productivity":
        return <ProductivityTab {...commonProps} />;
      case "trend":
        return <TrendAnalysisTab shifts={shifts} users={users} />;
      case "tasks":
        return (
          <TaskManagementIntegratedTab
            storeId={user?.storeId || "default-store"}
          />
        );
      default:
        return <StaffEfficiencyTab budget={monthlyBudget} {...commonProps} />;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mainContent,
          isTabletOrDesktop && styles.mainContentDesktop,
        ]}
      >
        {/* タブナビゲーション */}
        <View
          style={[
            styles.tabContainer,
            isTabletOrDesktop && styles.tabContainerDesktop,
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContainer}
          >
            {/* 月間予算表示 */}
            <TouchableOpacity
              style={[
                styles.budgetTab,
                isTabletOrDesktop && styles.budgetTabDesktop,
                {
                  borderLeftColor: budgetStatusInfo.color,
                  borderLeftWidth: 4,
                },
              ]}
              onPress={openBudgetModal}
            >
              <MaterialIcons
                name={budgetStatusInfo.icon as any}
                size={18}
                color={budgetStatusInfo.color}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.budgetTabText}>
                  月間予算設定 {formatCurrency(monthlyBudget)}
                </Text>
                <Text
                  style={[
                    styles.budgetStatusText,
                    { color: budgetStatusInfo.color },
                  ]}
                >
                  {budgetStatusInfo.text} (
                  {BudgetCalculator.formatPercentage(realData.budgetUsage)}%)
                </Text>
              </View>
            </TouchableOpacity>

            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.activeTab,
                  isTabletOrDesktop && styles.tabDesktop,
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialIcons
                  name={tab.icon as any}
                  size={20}
                  color={
                    activeTab === tab.key
                      ? colors.primary
                      : colors.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* タブコンテンツ */}
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {shifts.length === 0 && !shiftsLoading ? (
            <View style={styles.noDataContainer}>
              <MaterialIcons
                name="info"
                size={48}
                color={colors.text.disabled}
              />
              <Text style={styles.noDataTitle}>シフトデータがありません</Text>
              <Text style={styles.noDataDescription}>
                シフトを登録すると、ここに分析データが表示されます。
              </Text>
            </View>
          ) : (
            renderTabContent()
          )}
        </ScrollView>

        {/* データ読み込み中の表示 */}
        {(shiftsLoading || usersLoading) && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBadge}>
              <MaterialIcons name="sync" size={16} color={colors.primary} />
              <Text style={styles.loadingText}>データ読み込み中...</Text>
            </View>
          </View>
        )}

        {/* 予算編集モーダル */}
        <Modal
          visible={showBudgetModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBudgetModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Box variant="card" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <MaterialIcons
                  name="account-balance"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.modalTitle}>月間予算設定</Text>
                <TouchableOpacity
                  onPress={() => setShowBudgetModal(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalInputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>¥</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={budgetInputValue}
                    onChangeText={handleBudgetInputChange}
                    keyboardType="numeric"
                    placeholder="500000"
                    placeholderTextColor="#999"
                    autoFocus={true}
                    maxLength={10}
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
            </Box>
          </View>
        </Modal>
      </View>
    </View>
  );
};

/**
 * Budget calculation and formatting utility class
 */
class BudgetCalculator {
  /**
   * Validate and parse budget input
   */
  static validateAndParseBudget(input: string): { isValid: boolean; value: number | null; error?: string } {
    if (!input || typeof input !== 'string') {
      return { isValid: false, value: null, error: "予算を入力してください" };
    }

    const sanitized = input.replace(/[^\d]/g, "");
    
    if (sanitized === "") {
      return { isValid: false, value: null, error: "予算を入力してください" };
    }

    const numericValue = parseInt(sanitized, 10);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return { isValid: false, value: null, error: "有効な予算を入力してください" };
    }

    if (numericValue > 100000000) { // 1億円以上は制限
      return { isValid: false, value: null, error: "予算は1億円以下で入力してください" };
    }

    return { isValid: true, value: numericValue };
  }

  /**
   * Sanitize budget input to allow only numbers
   */
  static sanitizeBudgetInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return "";
    }
    return input.replace(/[^\d]/g, "");
  }

  /**
   * Format budget for input field
   */
  static formatBudgetForInput(budget: number): string {
    if (!Number.isFinite(budget) || budget < 0) {
      return "";
    }
    return budget.toString();
  }

  /**
   * Format currency with proper validation
   */
  static formatCurrency(amount: number): string {
    if (!Number.isFinite(amount)) {
      return "¥0";
    }

    try {
      return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
      }).format(Math.round(amount));
    } catch (error) {
      // Fallback formatting
      return `¥${Math.round(amount).toLocaleString()}`;
    }
  }

  /**
   * Format percentage with proper validation
   */
  static formatPercentage(percentage: number): string {
    if (!Number.isFinite(percentage)) {
      return "0.0";
    }
    return Math.max(0, percentage).toFixed(1);
  }

  /**
   * Get budget status information
   */
  static getBudgetStatusInfo(usageRate: number): {
    color: string;
    icon: string;
    text: string;
  } {
    const safeUsageRate = Number.isFinite(usageRate) ? Math.max(0, usageRate) : 0;

    if (safeUsageRate >= 90) {
      return {
        color: "#E53E3E",
        icon: "warning",
        text: "予算超過危険"
      };
    }
    if (safeUsageRate >= 75) {
      return {
        color: "#FF9800",
        icon: "priority-high",
        text: "予算注意"
      };
    }
    if (safeUsageRate >= 50) {
      return {
        color: "#2196F3",
        icon: "info",
        text: "予算適正"
      };
    }
    return {
      color: "#4CAF50",
      icon: "check-circle",
      text: "予算余裕あり"
    };
  }
}

/**
 * Dashboard data processing utility class
 */
class DashboardDataProcessor {
  /**
   * Get current month's shifts with validation
   */
  static getCurrentMonthShifts(shifts: any[]) {
    if (!Array.isArray(shifts)) {
      return [];
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return shifts.filter((shift) => {
      if (!shift || !shift.date) {
        return false;
      }

      try {
        const shiftDate = new Date(shift.date);
        return (
          shiftDate.getMonth() === currentMonth &&
          shiftDate.getFullYear() === currentYear &&
          (shift.status === "approved" ||
            shift.status === "pending" ||
            shift.status === "completed")
        );
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Calculate real data with comprehensive validation
   */
  static calculateRealData(params: {
    shifts: any[];
    users: any[];
    monthlyBudget: number;
  }) {
    const { shifts, users, monthlyBudget } = params;

    const safeShifts = Array.isArray(shifts) ? shifts : [];
    const safeUsers = Array.isArray(users) ? users : [];
    const safeBudget = Number.isFinite(monthlyBudget) && monthlyBudget > 0 ? monthlyBudget : 1;

    let totalMinutes = 0;
    let totalAmount = 0;

    safeShifts.forEach((shift) => {
      if (!shift || !shift.userId) {
        return;
      }

      try {
        // ユーザーの時給を取得（未設定の場合は1,100円を自動適用）
        const user = safeUsers.find((u) => u?.uid === shift.userId);
        const hourlyWage = Number.isFinite(user?.hourlyWage) && user.hourlyWage > 0 
          ? user.hourlyWage 
          : 1100;

        // 授業時間を除外したシフト時間の計算
        const { totalMinutes: workMinutes, totalWage: workWage } =
          calculateTotalWage(
            {
              startTime: shift.startTime || "",
              endTime: shift.endTime || "",
              classes: shift.classes || [],
            },
            hourlyWage
          );

        if (Number.isFinite(workMinutes) && workMinutes >= 0) {
          totalMinutes += workMinutes;
        }
        if (Number.isFinite(workWage) && workWage >= 0) {
          totalAmount += workWage;
        }
      } catch (error) {
        console.warn("Error calculating shift data:", error);
      }
    });

    const totalHours = totalMinutes > 0 ? totalMinutes / 60 : 0;
    const totalCost = Math.round(Math.max(0, totalAmount));
    const budgetUsage = safeBudget > 0 ? (totalCost / safeBudget) * 100 : 0;

    const completedShifts = safeShifts.filter(
      (shift) => shift?.status === "completed"
    ).length;

    return {
      totalHours: Math.max(0, totalHours),
      totalCost: Math.max(0, totalCost),
      budgetUsage: Math.max(0, budgetUsage),
      staffCount: Math.max(0, safeUsers.length),
      completedShifts: Math.max(0, completedShifts),
      totalShifts: Math.max(0, safeShifts.length),
    };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // 背景を白に変更
    position: "relative",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    width: "100%",
  },
  mainContentDesktop: {
    width: "80%",
    maxWidth: 1200,
  },
  tabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  tabContainerDesktop: {
    paddingHorizontal: layout.padding.large,
  },
  tabScrollContainer: {
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
  },
  budgetTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    marginRight: layout.padding.medium,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.primary + "15",
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  budgetTabDesktop: {
    paddingHorizontal: layout.padding.large,
  },
  budgetTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 6,
  },
  budgetStatusText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 6,
    marginTop: 2,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    marginRight: layout.padding.small,
    borderRadius: layout.borderRadius.medium,
    minWidth: 100,
  },
  tabDesktop: {
    minWidth: 120,
    paddingHorizontal: layout.padding.large,
  },
  activeTab: {
    backgroundColor: colors.primary + "15",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    padding: layout.padding.medium,
  },
  // データなし表示のスタイル
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: layout.padding.xlarge * 2,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.secondary,
    marginTop: layout.padding.medium,
    marginBottom: layout.padding.small,
  },
  noDataDescription: {
    fontSize: 14,
    color: colors.text.disabled,
    textAlign: "center",
    maxWidth: 280,
  },
  // ローディング中オーバーレイ関連のスタイル
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  loadingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "E6",
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    borderRadius: layout.borderRadius.large,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.primary + "40",
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface,
    marginLeft: 6,
  },
  // モーダル関連のスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: layout.padding.large,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.large,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginLeft: layout.padding.small,
  },
  closeButton: {
    padding: 4,
  },
  modalInputContainer: {
    marginBottom: layout.padding.large,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    ...shadows.small,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    paddingVertical: 8,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: layout.padding.medium,
  },
  modalButton: {
    minWidth: 80,
  },
});