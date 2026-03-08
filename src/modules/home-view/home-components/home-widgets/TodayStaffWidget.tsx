import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ShiftItem } from "@/common/common-models/ModelIndex";

interface TodayStaffWidgetProps {
  todayShifts: ShiftItem[];
  onPress: () => void;
}

export function TodayStaffWidget({ todayShifts, onPress }: TodayStaffWidgetProps) {
  const approvedShifts = todayShifts.filter(
    (shift) => shift.status === "approved" || shift.status === "completed"
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <MaterialIcons name="people" size={20} color={colors.primary} />
        <Text style={styles.title}>今日のスタッフ</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{approvedShifts.length}</Text>
        </View>
      </View>

      {approvedShifts.length > 0 ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {approvedShifts.slice(0, 3).map((shift, index) => (
            <View key={shift.id} style={styles.staffItem}>
              <View style={styles.staffAvatar}>
                <Text style={styles.avatarText}>
                  {shift.nickname ? shift.nickname.charAt(0) : "?"}
                </Text>
              </View>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName} numberOfLines={1}>
                  {shift.nickname || "名前なし"}
                </Text>
                <Text style={styles.staffTime}>
                  {shift.startTime} - {shift.endTime}
                </Text>
              </View>
            </View>
          ))}
          {approvedShifts.length > 3 && (
            <Text style={styles.moreText}>他 {approvedShifts.length - 3}人</Text>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>スタッフなし</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.detailText}>タップして詳細</Text>
        <MaterialIcons name="chevron-right" size={16} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginLeft: 6,
    elevation: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginLeft: 6,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  staffItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  staffAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  staffTime: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  moreText: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.disabled,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailText: {
    fontSize: 11,
    color: colors.text.secondary,
    marginRight: 2,
  },
});
