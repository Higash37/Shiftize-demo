import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";

interface UserPayrollData {
  uid: string;
  nickname: string;
  color?: string;
  hourlyWage?: number;
  totalHours: number;
  totalAmount: number;
  shiftCount: number;
}

interface PayrollDetailModalProps {
  visible: boolean;
  onClose: () => void;
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string; hourlyWage?: number }>;
  selectedDate: Date;
}

export const PayrollDetailModal: React.FC<PayrollDetailModalProps> = ({
  visible,
  onClose,
  shifts,
  users,
  selectedDate,
}) => {
  // 選択された月の年月を取得
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;

  // 個人別給与データを計算
  const calculateUserPayrollData = (): UserPayrollData[] => {
    const userDataMap = new Map<string, UserPayrollData>();

    // 選択された月のシフトをフィルタリング
    const monthlyShifts = shifts.filter((shift) => {
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

    // 各シフトを処理して個人別データを集計
    monthlyShifts.forEach((shift) => {
      const user = users.find((u) => u.uid === shift.userId);
      if (!user) return;

      const hourlyWage = user.hourlyWage || 1100; // デフォルト時給
      const classes = shift.classes || [];

      // 時間と給与を計算
      const { totalMinutes, totalWage } = calculateTotalWage(
        {
          startTime: shift.startTime,
          endTime: shift.endTime,
          classes: classes,
        },
        hourlyWage
      );

      const totalHours = totalMinutes / 60;

      // 既存データがあれば加算、なければ新規作成
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

    // MapをArrayに変換し、金額でソート（降順）
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {selectedYear}年{selectedMonth}月 給与詳細
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* 総計表示 */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>総計</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                総額: {grandTotal.totalAmount.toLocaleString()}円
              </Text>
              <Text style={styles.summaryText}>
                総時間: {Math.floor(grandTotal.totalHours)}時間
                {Math.round((grandTotal.totalHours % 1) * 60)}分
              </Text>
            </View>
            <Text style={styles.summarySubtext}>
              総シフト数: {grandTotal.shiftCount}件 | ※授業時間を除く
            </Text>
            <Text style={styles.summaryNote}>
              ※承認済み・完了のシフトのみ計算対象
            </Text>
          </View>

          {/* 個人別リスト */}
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {payrollData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedYear}年{selectedMonth}月のシフトデータがありません
                </Text>
              </View>
            ) : (
              payrollData.map((user, index) => (
                <View key={user.uid} style={styles.userRow}>
                  {/* ユーザー色インジケーター */}
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: user.color || "#ccc" },
                    ]}
                  />
                  
                  {/* ユーザー情報 */}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.nickname}</Text>
                    <Text style={styles.userDetails}>
                      時給: {user.hourlyWage?.toLocaleString()}円 | シフト: {user.shiftCount}件
                    </Text>
                  </View>

                  {/* 時間・金額表示 */}
                  <View style={styles.userAmounts}>
                    <Text style={styles.userAmount}>
                      {user.totalAmount.toLocaleString()}円
                    </Text>
                    <Text style={styles.userHours}>
                      {Math.floor(user.totalHours)}時間
                      {Math.round((user.totalHours % 1) * 60) > 0 &&
                        `${Math.round((user.totalHours % 1) * 60)}分`}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    maxHeight: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  summaryContainer: {
    backgroundColor: "#f8f9fa",
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196f3",
  },
  summarySubtext: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  summaryNote: {
    fontSize: 11,
    color: "#ff6b6b",
    marginTop: 4,
    fontWeight: "500",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  colorIndicator: {
    width: 12,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userDetails: {
    fontSize: 12,
    color: "#666",
  },
  userAmounts: {
    alignItems: "flex-end",
  },
  userAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196f3",
    marginBottom: 2,
  },
  userHours: {
    fontSize: 12,
    color: "#666",
  },
});