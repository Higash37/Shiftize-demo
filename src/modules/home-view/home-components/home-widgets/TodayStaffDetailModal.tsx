import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";

interface TodayStaffDetailModalProps {
  visible: boolean;
  onClose: () => void;
  shifts: ShiftItem[];
  selectedDate: Date;
}

export function TodayStaffDetailModal({
  visible,
  onClose,
  shifts,
  selectedDate,
}: TodayStaffDetailModalProps) {
  const approvedShifts = shifts.filter(
    (shift) => shift.status === "approved" || shift.status === "completed"
  );

  // 時間順にソート
  const sortedShifts = [...approvedShifts].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialIcons name="people" size={24} color={colors.primary} />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>スタッフ一覧</Text>
              <Text style={styles.subtitle}>
                {format(selectedDate, "M月d日(E)", { locale: ja })}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {sortedShifts.length > 0 ? (
              sortedShifts.map((shift, index) => (
                <View key={shift.id} style={styles.staffCard}>
                  <View style={styles.staffHeader}>
                    <View style={styles.staffAvatar}>
                      <Text style={styles.avatarText}>
                        {shift.nickname ? shift.nickname.charAt(0) : "?"}
                      </Text>
                    </View>
                    <View style={styles.staffInfo}>
                      <Text style={styles.staffName}>
                        {shift.nickname || "名前なし"}
                      </Text>
                      <View style={styles.timeRow}>
                        <MaterialIcons
                          name="access-time"
                          size={14}
                          color={colors.text.secondary}
                        />
                        <Text style={styles.timeText}>
                          {shift.startTime} - {shift.endTime}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            shift.status === "completed"
                              ? colors.success
                              : colors.primary,
                        },
                      ]}
                    />
                  </View>

                  {shift.subject && (
                    <View style={styles.detailRow}>
                      <MaterialIcons
                        name="class"
                        size={16}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.detailText}>{shift.subject}</Text>
                    </View>
                  )}

                  {shift.notes && (
                    <View style={styles.memoContainer}>
                      <Text style={styles.memoText}>{shift.notes}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="person-off"
                  size={64}
                  color={colors.text.disabled}
                />
                <Text style={styles.emptyText}>
                  この日はスタッフの予定がありません
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.summaryContainer}>
              <MaterialIcons name="group" size={20} color={colors.primary} />
              <Text style={styles.summaryText}>
                合計 {sortedShifts.length} 人のスタッフ
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    maxHeight: 400,
  },
  staffCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  staffHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  memoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  memoText: {
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.disabled,
    marginTop: 12,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});
