/** @file PayrollList.tsx
 *  @description ユーザー別の月間給与サマリーを一覧表示するコンポーネント。
 *    承認済みシフトの時間・金額を集計し、未承認分も別途表示する。
 *    ユーザーをタップすると、そのユーザーのシフトだけをフィルタリングできる。
 */

// 【このファイルの位置づけ】
// - import元: calculateTotalWage（給与計算ユーティリティ）
// - importされる先: CalendarView（左カラムの給与リスト）
// - 役割: 「誰が何時間働いて、いくらになるか」を月単位で集計・表示する。

import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import { colors } from "@/common/common-theme/ThemeColors";

// UserPayrollData: 1ユーザー分の集計結果の型
interface UserPayrollData {
  uid: string;
  nickname: string;
  color?: string;
  hourlyWage?: number;
  totalHours: number;
  totalAmount: number;
  shiftCount: number;
  // 未承認分を追加
  pendingHours: number;
  pendingAmount: number;
  pendingCount: number;
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

    // 全ユーザーを初期化（シフトなしでも表示）
    users.forEach((user) => {
      userDataMap.set(user.uid, {
        uid: user.uid,
        nickname: user.nickname,
        color: user.color || "#999",
        hourlyWage: user.hourlyWage || 1100,
        totalHours: 0,
        totalAmount: 0,
        shiftCount: 0,
        pendingHours: 0,
        pendingAmount: 0,
        pendingCount: 0,
      });
    });

    // 承認済み・完了のシフト
    const approvedShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      const shiftYear = shiftDate.getFullYear();
      const shiftMonth = shiftDate.getMonth() + 1;

      return (
        shiftYear === selectedYear &&
        shiftMonth === selectedMonth &&
        (shift.status === "approved" ||
          shift.status === "completed")
      );
    });

    // 未承認のシフト（pending）
    const pendingShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      const shiftYear = shiftDate.getFullYear();
      const shiftMonth = shiftDate.getMonth() + 1;

      return (
        shiftYear === selectedYear &&
        shiftMonth === selectedMonth &&
        shift.status === "pending"
      );
    });

    // 承認済みシフトの計算
    approvedShifts.forEach((shift) => {
      const user = users.find((u) => u.uid === shift.userId);
      if (!user || !userDataMap.has(user.uid)) return;

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

      const existing = userDataMap.get(user.uid)!;
      existing.totalHours += totalHours;
      existing.totalAmount += totalWage;
      existing.shiftCount += 1;
    });

    // 未承認シフトの計算
    pendingShifts.forEach((shift) => {
      const user = users.find((u) => u.uid === shift.userId);
      if (!user || !userDataMap.has(user.uid)) return;

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

      const existing = userDataMap.get(user.uid)!;
      existing.pendingHours += totalHours;
      existing.pendingAmount += totalWage;
      existing.pendingCount += 1;
    });

    return Array.from(userDataMap.values()).sort(
      (a, b) => (b.totalAmount + b.pendingAmount) - (a.totalAmount + a.pendingAmount)
    );
  };

  const payrollData = calculateUserPayrollData();
  const grandTotal = payrollData.reduce(
    (acc, user) => ({
      totalHours: acc.totalHours + user.totalHours,
      totalAmount: acc.totalAmount + user.totalAmount,
      shiftCount: acc.shiftCount + user.shiftCount,
      pendingHours: acc.pendingHours + user.pendingHours,
      pendingAmount: acc.pendingAmount + user.pendingAmount,
      pendingCount: acc.pendingCount + user.pendingCount,
    }),
    { totalHours: 0, totalAmount: 0, shiftCount: 0, pendingHours: 0, pendingAmount: 0, pendingCount: 0 }
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
        {grandTotal.pendingCount > 0 && (
          <Text style={styles.summaryPending}>
            未承認: {grandTotal.pendingAmount.toLocaleString()}円 | {Math.floor(grandTotal.pendingHours)}h{Math.round((grandTotal.pendingHours % 1) * 60) > 0 && `${Math.round((grandTotal.pendingHours % 1) * 60)}m`}{' '}| {grandTotal.pendingCount}件
          </Text>
        )}
        <Text style={styles.summaryNote}>
          ※承認済み・完了のシフトのみ計算対象
        </Text>
      </View>

      {/* 個人別リスト */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {payrollData.map((user) => (
            <TouchableOpacity 
              key={user.uid} 
              style={[
                styles.userRow,
                selectedUserId === user.uid && styles.selectedUserRow,
                user.shiftCount === 0 && styles.noShiftUserRow // シフトがない場合のスタイル
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
                <Text style={[
                  styles.userAmount,
                  user.shiftCount === 0 && user.pendingCount === 0 && styles.noShiftText
                ]}>
                  {user.shiftCount === 0 && user.pendingCount === 0 ? (
                    "シフトなし"
                  ) : (
                    <>
                      {user.totalAmount.toLocaleString()}円 | {Math.floor(user.totalHours)}h
                      {Math.round((user.totalHours % 1) * 60) > 0 &&
                        `${Math.round((user.totalHours % 1) * 60)}m`}{' '}| {user.shiftCount}件
                    </>
                  )}
                </Text>
                {/* 未承認分の表示 */}
                {user.pendingCount > 0 && (
                  <Text style={styles.pendingAmount}>
                    未承認: {user.pendingAmount.toLocaleString()}円 | {Math.floor(user.pendingHours)}h
                    {Math.round((user.pendingHours % 1) * 60) > 0 &&
                      `${Math.round((user.pendingHours % 1) * 60)}m`}{' '}| {user.pendingCount}件
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  summaryNote: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
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
    backgroundColor: colors.selected,
    borderColor: colors.primary,
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
  noShiftUserRow: {
    backgroundColor: "#f8f9fa",
    borderColor: "#dee2e6",
    opacity: 0.7,
  },
  noShiftText: {
    color: "#6c757d",
    fontStyle: "italic",
  },
  pendingAmount: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ff8c00", // 濃い黄色（オレンジ系）
    marginTop: 2,
  },
  summaryPending: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ff8c00", // 濃い黄色（オレンジ系）
    textAlign: "center",
    marginTop: 4,
  },
});