import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import Button from "@/common/common-ui/ui-forms/FormButton";

interface PayrollModalProps {
  visible: boolean;
  onClose: () => void;
  users: Array<{
    uid: string;
    nickname: string;
    color?: string;
    hourlyWage?: number;
  }>;
  shifts: any[];
  currentDate: Date;
}

interface PayrollData {
  userId: string;
  nickname: string;
  color?: string;
  hourlyWage: number;
  totalHours: number;
  totalPay: number;
  workDays: number;
  overtimeHours: number;
  overtimePay: number;
}

export const PayrollModal: React.FC<PayrollModalProps> = ({
  visible,
  onClose,
  users,
  shifts,
  currentDate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(currentDate);

  // 給与計算データの生成
  const payrollData = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);

    return users
      .filter((user) => user.hourlyWage && user.hourlyWage > 0)
      .map((user) => {
        const userShifts = shifts.filter((shift) => {
          const shiftDate = new Date(shift.date);
          return (
            shift.userId === user.uid &&
            shiftDate >= monthStart &&
            shiftDate <= monthEnd &&
            (shift.shiftType === "work" || !shift.shiftType)
          ); // 勤務シフトのみ
        });

        let totalMinutes = 0;
        let overtimeMinutes = 0;
        const workDays = new Set();

        userShifts.forEach((shift) => {
          const [startHours, startMinutes] = shift.startTime
            .split(":")
            .map(Number);
          const [endHours, endMinutes] = shift.endTime.split(":").map(Number);
          const shiftMinutes =
            endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

          totalMinutes += shiftMinutes;
          workDays.add(shift.date);

          // 8時間超過分を残業として計算
          const dailyMinutes = shiftMinutes;
          if (dailyMinutes > 480) {
            // 8時間 = 480分
            overtimeMinutes += dailyMinutes - 480;
          }
        });

        const totalHours = totalMinutes / 60;
        const overtimeHours = overtimeMinutes / 60;
        const regularHours = totalHours - overtimeHours;
        const regularPay = regularHours * user.hourlyWage!;
        const overtimePay = overtimeHours * user.hourlyWage! * 1.25; // 残業割増25%
        const totalPay = regularPay + overtimePay;

        return {
          userId: user.uid,
          nickname: user.nickname,
          color: user.color,
          hourlyWage: user.hourlyWage!,
          totalHours,
          totalPay,
          workDays: workDays.size,
          overtimeHours,
          overtimePay,
        };
      })
      .sort((a, b) => b.totalPay - a.totalPay); // 給与順でソート
  }, [users, shifts, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const totalPayroll = payrollData.reduce(
    (sum, data) => sum + data.totalPay,
    0
  );

  const renderPayrollRow = (data: PayrollData) => (
    <View key={data.userId} style={styles.payrollRow}>
      <View style={styles.userSection}>
        <View
          style={[
            styles.userColorBar,
            { backgroundColor: data.color || colors.primary },
          ]}
        />
        <Text style={styles.userName}>{data.nickname}</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>出勤日数</Text>
          <Text style={styles.statValue}>{data.workDays}日</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>勤務時間</Text>
          <Text style={styles.statValue}>{formatHours(data.totalHours)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>時給</Text>
          <Text style={styles.statValue}>¥{data.hourlyWage}</Text>
        </View>
      </View>

      {data.overtimeHours > 0 && (
        <View style={styles.overtimeSection}>
          <View style={styles.statItem}>
            <Text style={styles.overtimeLabel}>残業時間</Text>
            <Text style={styles.overtimeValue}>
              {formatHours(data.overtimeHours)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.overtimeLabel}>残業代</Text>
            <Text style={styles.overtimeValue}>
              {formatCurrency(data.overtimePay)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>支給額</Text>
        <Text style={styles.totalValue}>{formatCurrency(data.totalPay)}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setSelectedMonth(subMonths(selectedMonth, 1))}
            >
              <MaterialIcons
                name="chevron-left"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {format(selectedMonth, "yyyy年M月", { locale: ja })} 給与明細
            </Text>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setSelectedMonth(addMonths(selectedMonth, 1))}
            >
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons
              name="close"
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* サマリー */}
        <Box variant="card" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>対象スタッフ</Text>
              <Text style={styles.summaryValue}>{payrollData.length}名</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>総支給額</Text>
              <Text style={styles.summaryValueLarge}>
                {formatCurrency(totalPayroll)}
              </Text>
            </View>
          </View>
        </Box>

        {/* 給与一覧 */}
        <ScrollView
          style={styles.payrollList}
          showsVerticalScrollIndicator={false}
        >
          {payrollData.length > 0 ? (
            payrollData.map((data) => renderPayrollRow(data))
          ) : (
            <Box variant="card" style={styles.emptyCard}>
              <MaterialIcons
                name="receipt-long"
                size={48}
                color={colors.text.disabled}
              />
              <Text style={styles.emptyText}>
                {format(selectedMonth, "M月", { locale: ja })}
                の勤務データがありません
              </Text>
            </Box>
          )}
        </ScrollView>

        {/* フッター */}
        <View style={styles.footer}>
          <Button
            title="CSVエクスポート"
            onPress={() => {
              // CSVエクスポート機能（今後実装）
            }}
            variant="outline"
            style={styles.exportButton}
          />
          <Button
            title="閉じる"
            onPress={onClose}
            variant="primary"
            style={styles.closeFooterButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: layout.padding.large,
    paddingVertical: layout.padding.medium,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.padding.medium,
  },
  navButton: {
    padding: layout.padding.small,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.primary + "15",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  closeButton: {
    padding: layout.padding.small,
  },
  summaryCard: {
    margin: layout.padding.medium,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  summaryValueLarge: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  payrollList: {
    flex: 1,
    paddingHorizontal: layout.padding.medium,
  },
  payrollRow: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    marginBottom: layout.padding.small,
    ...shadows.small,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  userColorBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: layout.padding.small,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: layout.padding.small,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  overtimeSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.warning + "15",
    borderRadius: layout.borderRadius.small,
    padding: layout.padding.small,
    marginBottom: layout.padding.small,
  },
  overtimeLabel: {
    fontSize: 12,
    color: colors.warning,
    marginBottom: 2,
  },
  overtimeValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.warning,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: layout.padding.small,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: layout.padding.xlarge,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: layout.padding.medium,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    padding: layout.padding.medium,
    gap: layout.padding.medium,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  exportButton: {
    flex: 1,
  },
  closeFooterButton: {
    flex: 2,
  },
});
