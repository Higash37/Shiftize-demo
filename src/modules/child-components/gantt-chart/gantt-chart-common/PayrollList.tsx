import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import { colors } from "@/common/common-theme/ThemeColors";

interface UserPayrollData {
  uid: string;
  nickname: string;
  color?: string;
  hourlyWage?: number;
  totalHours: number;
  totalAmount: number;
  shiftCount: number;
}

interface PayrollListProps {
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string; hourlyWage?: number }>;
  selectedDate: Date;
  selectedUserId?: string | null;
  onUserSelect?: (userId: string | null) => void;
}

export const PayrollList: React.FC<PayrollListProps> = ({
  shifts,
  users,
  selectedDate,
  selectedUserId,
  onUserSelect,
}) => {
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;

  const calculateUserPayrollData = (): UserPayrollData[] => {
    const userDataMap = new Map<string, UserPayrollData>();

    const monthlyShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      const shiftYear = shiftDate.getFullYear();
      const shiftMonth = shiftDate.getMonth() + 1;

      return (
        shiftYear === selectedYear &&
        shiftMonth === selectedMonth &&
        (shift.status === "approved" ||
          shift.status === "pending" ||
          shift.status === "completed")
      );
    });

    monthlyShifts.forEach((shift) => {
      const user = users.find((u) => u.uid === shift.userId);
      if (!user) return;

      const hourlyWage = user.hourlyWage || 1100;
      const classes = shift.classes || [];

      const { totalMinutes, totalWage } = calculateTotalWage(
        {
          startTime: shift.startTime,
          endTime: shift.endTime,
          classes: classes,
        },
        hourlyWage
      );

      const totalHours = totalMinutes / 60;

      if (userDataMap.has(user.uid)) {
        const existing = userDataMap.get(user.uid)!;
        existing.totalHours += totalHours;
        existing.totalAmount += totalWage;
        existing.shiftCount += 1;
      } else {
        userDataMap.set(user.uid, {
          uid: user.uid,
          nickname: user.nickname,
          color: user.color,
          hourlyWage: hourlyWage,
          totalHours: totalHours,
          totalAmount: totalWage,
          shiftCount: 1,
        });
      }
    });

    return Array.from(userDataMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );
  };

  const payrollData = calculateUserPayrollData();
  const grandTotal = payrollData.reduce(
    (acc, user) => ({
      totalHours: acc.totalHours + user.totalHours,
      totalAmount: acc.totalAmount + user.totalAmount,
      shiftCount: acc.shiftCount + user.shiftCount,
    }),
    { totalHours: 0, totalAmount: 0, shiftCount: 0 }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {selectedYear}年{selectedMonth}月 給与詳細
      </Text>

      {/* 総計表示 */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          総計: {grandTotal.totalAmount.toLocaleString()}円 | {Math.floor(grandTotal.totalHours)}h{Math.round((grandTotal.totalHours % 1) * 60) > 0 && `${Math.round((grandTotal.totalHours % 1) * 60)}m`}{' '}| {grandTotal.shiftCount}件
        </Text>
      </View>

      {/* 個人別リスト */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {payrollData.length === 0 ? (
          <Text style={styles.emptyText}>
            この月のシフトデータがありません
          </Text>
        ) : (
          <View style={styles.gridContainer}>
            {payrollData.map((user) => (
              <TouchableOpacity 
                key={user.uid} 
                style={[
                  styles.userRow,
                  selectedUserId === user.uid && styles.selectedUserRow
                ]}
                onPress={() => {
                  if (onUserSelect) {
                    // 同じユーザーをタップしたら選択解除、異なるユーザーなら選択
                    onUserSelect(selectedUserId === user.uid ? null : user.uid);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.leftSection}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: user.color || "#ccc" },
                    ]}
                  />
                  <AntDesign name="user" size={16} color={user.color || "#ccc"} />
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.nickname}</Text>
                  <Text style={styles.userAmount}>
                    {user.totalAmount.toLocaleString()}円 | {Math.floor(user.totalHours)}h
                    {Math.round((user.totalHours % 1) * 60) > 0 &&
                      `${Math.round((user.totalHours % 1) * 60)}m`}{' '}| {user.shiftCount}件
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  summaryContainer: {
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  summaryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 14,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginBottom: 6,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
    width: "48%",
  },
  selectedUserRow: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
    borderWidth: 2,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  colorIndicator: {
    width: 8,
    height: 32,
    borderRadius: 4,
    marginRight: 4,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userAmount: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 1,
  },
  userDetails: {
    fontSize: 11,
    color: "#666",
  },
});