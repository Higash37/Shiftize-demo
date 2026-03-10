/**
 * @file NextShiftWidget.tsx
 * @description 次のシフト情報をカード形式で表示するウィジェット。
 *
 * 【このファイルの位置づけ】
 *   home-view > home-components > home-widgets 配下のウィジェット。
 *   HomeGanttMobileScreen / HomeGanttTabletScreen / HomeGanttWideScreen で使われる。
 *
 * 主要Props:
 *   - shift: 次のシフト情報（日付・開始時間・終了時間など）
 *   - onPress: カードタップ時のコールバック（詳細モーダルを開く）
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";

interface NextShiftWidgetProps {
  nextShift: ShiftItem | null;
  onPress: () => void;
}

export function NextShiftWidget({ nextShift, onPress }: NextShiftWidgetProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <MaterialIcons name="event" size={20} color={colors.primary} />
        <Text style={styles.title}>次のシフト</Text>
      </View>

      {nextShift ? (
        <View style={styles.content}>
          <Text style={styles.date}>
            {format(new Date(nextShift.date), "M月d日(E)", { locale: ja })}
          </Text>
          <Text style={styles.time}>
            {nextShift.startTime} - {nextShift.endTime}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {nextShift.status === "approved" ? "承認済み" : "確認中"}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>予定なし</Text>
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
    marginRight: 6,
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
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  date: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
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
