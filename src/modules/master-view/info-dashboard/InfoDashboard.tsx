import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import { useAuth } from "@/services/auth/useAuth";

import { BudgetSection } from "./analytics-widgets";

// タブコンテンツを遅延読み込み
const StaffEfficiencyTab = lazy(() => 
  import("./analytics-widgets/StaffEfficiencyTab").then(module => ({ default: module.StaffEfficiencyTab }))
);
const CostAnalysisTab = lazy(() => 
  import("./analytics-widgets/CostAnalysisTab").then(module => ({ default: module.CostAnalysisTab }))
);
const ShiftMetricsTab = lazy(() => 
  import("./analytics-widgets/ShiftMetricsTab").then(module => ({ default: module.ShiftMetricsTab }))
);
const ProductivityTab = lazy(() => 
  import("./analytics-widgets/ProductivityTab").then(module => ({ default: module.ProductivityTab }))
);
const TrendAnalysisTab = lazy(() => 
  import("./analytics-widgets/TrendAnalysisTab").then(module => ({ default: module.TrendAnalysisTab }))
);
const TaskManagementIntegratedTab = lazy(() => 
  import("./analytics-widgets/TaskManagementIntegratedTab").then(module => ({ default: module.TaskManagementIntegratedTab }))
);
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
 */

export const InfoDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("efficiency");
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500000); // デフォルト予算
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInputValue, setBudgetInputValue] = useState(
    monthlyBudget.toString()
  );
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  // 実際のデータを取得
  const { user } = useAuth();
  const { shifts, loading: shiftsLoading } = useShiftsRealtime(user?.storeId);
  const { users, loading: usersLoading } = useUsers(user?.storeId);

  // 現在の月のデータを計算（メモ化）
  const currentMonthShifts = useMemo(() => {
    const currentDate = new Date();
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shiftDate.getMonth() === currentDate.getMonth() &&
        shiftDate.getFullYear() === currentDate.getFullYear() &&
        (shift.status === "approved" ||
          shift.status === "pending" ||
          shift.status === "completed")
      );
    });
  }, [shifts]);

  // 実際の集計データを計算（ガントチャートと同じロジック、メモ化）
  const realData = useMemo(() => {
    let totalMinutes = 0;
    let totalAmount = 0;

    currentMonthShifts.forEach((shift) => {
      // ユーザーの時給を取得（未設定の場合は1,100円を自動適用）
      const shiftUser = users.find((u) => u.uid === shift.userId);
      const hourlyWage = shiftUser?.hourlyWage || 1100;

      // 授業時間を除外したシフト時間の計算
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

    return {
      totalHours,
      totalCost,
      budgetUsage,
      staffCount: users.length,
      completedShifts: currentMonthShifts.filter(
        (shift) => shift.status === "completed"
      ).length,
      totalShifts: currentMonthShifts.length,
    };
  }, [currentMonthShifts, users, monthlyBudget]);

  // 予算使用率の色を動的に決定（メモ化）
  const getBudgetStatusColor = useCallback((usageRate: number) => {
    if (usageRate >= 90) return "#E53E3E"; // 赤色：危険
    if (usageRate >= 75) return "#FF9800"; // オレンジ色：注意
    if (usageRate >= 50) return "#2196F3"; // 青色：適正
    return "#4CAF50"; // 緑色：余裕あり
  }, []);

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

  // 共通プロップスをメモ化
  const commonProps = useMemo(() => ({
    shifts,
    users,
    totalHours: realData.totalHours,
    totalCost: realData.totalCost,
    budgetUsage: realData.budgetUsage,
  }), [shifts, users, realData.totalHours, realData.totalCost, realData.budgetUsage]);

  const renderTabContent = useCallback(() => {

    const loadingFallback = (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

    switch (activeTab) {
      case "efficiency":
        return (
          <Suspense fallback={loadingFallback}>
            <StaffEfficiencyTab budget={monthlyBudget} {...commonProps} />
          </Suspense>
        );
      case "cost":
        return (
          <Suspense fallback={loadingFallback}>
            <CostAnalysisTab budget={monthlyBudget} {...commonProps} />
          </Suspense>
        );
      case "shift":
        return (
          <Suspense fallback={loadingFallback}>
            <ShiftMetricsTab {...commonProps} />
          </Suspense>
        );
      case "productivity":
        return (
          <Suspense fallback={loadingFallback}>
            <ProductivityTab {...commonProps} />
          </Suspense>
        );
      case "trend":
        return (
          <Suspense fallback={loadingFallback}>
            <TrendAnalysisTab shifts={shifts} users={users} />
          </Suspense>
        );
      case "tasks":
        return (
          <Suspense fallback={loadingFallback}>
            <TaskManagementIntegratedTab
              storeId={user?.storeId || "default-store"}
            />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={loadingFallback}>
            <StaffEfficiencyTab budget={monthlyBudget} {...commonProps} />
          </Suspense>
        );
    }
  }, [activeTab, monthlyBudget, commonProps, user?.storeId]);

  // ローディング中の早期リターンで不要なレンダリングを防ぐ
  if (shiftsLoading || usersLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>データ読み込み中...</Text>
        </View>
      </View>
    );
  }

  // データがない場合の早期リターン
  if (shifts.length === 0) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

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
                  borderLeftColor: getBudgetStatusColor(realData.budgetUsage),
                  borderLeftWidth: 4,
                },
              ]}
              onPress={openBudgetModal}
            >
              <MaterialIcons
                name={getBudgetStatusIcon(realData.budgetUsage) as any}
                size={18}
                color={getBudgetStatusColor(realData.budgetUsage)}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.budgetTabText}>
                  月間予算設定 {formatCurrency(monthlyBudget)}
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
          {renderTabContent()}
        </ScrollView>

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
                    onChangeText={setBudgetInputValue}
                    keyboardType="numeric"
                    placeholder="500000"
                    placeholderTextColor="#999"
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
            </Box>
          </View>
        </Modal>
      </View>
    </View>
  );
};

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
  // ローディング表示のスタイル
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: layout.padding.xlarge * 2,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: layout.padding.medium,
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
