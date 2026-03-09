import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import type { SampleScheduleColumn } from "../home-types/home-view-types";
import type { ShiftItem } from "@/common/common-models/ModelIndex";
import { colors } from "@/common/common-constants/ThemeConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { MaterialIcons } from "@expo/vector-icons";
import { ShiftCalendar } from "@/modules/reusable-widgets/calendar/main-calendar/ShiftCalendar";
import { ClockWidget } from "../home-components/home-widgets/ClockWidget";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getShiftStatus, groupConsecutiveSlots } from "../home-utils/shiftStatusUtils";
import { SUB_HEADER_HEIGHT } from "@/common/common-ui/ui-navigation/DateNavigator";

interface Props {
  namesFirst: string[];
  namesSecond: string[];
  timesFirst: string[];
  timesSecond: string[];
  sampleSchedule: SampleScheduleColumn[];
  CELL_WIDTH: number;
  showFirst: boolean;
  onCellPress?: (userName: string) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  allTimes: string[];
  shifts: ShiftItem[];
  shiftsForDate: ShiftItem[]; // 選択された日付のシフトデータ（時計ウィジェット用）
  currentYearMonth: { year: number; month: number };
  currentUserStoreId?: string | undefined;
}

export const HomeGanttTabletScreen: React.FC<Props> = ({
  sampleSchedule,
  onCellPress,
  selectedDate,
  onDateSelect,
  shifts,
  shiftsForDate,
  currentYearMonth,
  currentUserStoreId,
}) => {
  const [selectedUser, setSelectedUser] = useState<SampleScheduleColumn | null>(null);

  // 選択された日付のシフトがあるユーザーとそのシフトを取得
  const daySchedules = sampleSchedule.filter(
    (col) => col.slots && col.slots.length > 0
  );

  const staffWorkingHours = groupConsecutiveSlots(sampleSchedule);

  // シフトカードのレンダリング（まとめた形式）
  const renderShiftCard = (schedule: SampleScheduleColumn) => {
    const userName = schedule.position;
    const userSlots = schedule.slots;

    // スタッフシフトと授業を分ける
    const staffSlots = userSlots.filter((s) => s.type !== "class");
    const classSlots = userSlots.filter((s) => s.type === "class");

    // 最初と最後の時間を取得
    const firstStaffSlot = staffSlots[0];
    const lastStaffSlot = staffSlots.at(-1);
    const hasStaffSlots = staffSlots.length > 0 && firstStaffSlot && lastStaffSlot;
    const staffTimes = hasStaffSlots
      ? `${firstStaffSlot.start} - ${lastStaffSlot.end}`
      : "";

    // 現在の状態を判定
    const { currentStatus, statusIcon, statusColor } = getShiftStatus(
      selectedDate, staffSlots, classSlots
    );

    const statusBorderColor =
      schedule.status === "completed" ? "#10B981" :
      schedule.status === "approved" ? "#0EA5E9" :
      schedule.status === "pending" ? "#FFB800" :
      schedule.status === "rejected" ? "#EF4444" : colors.border;

    return (
      <TouchableOpacity
        key={userName}
        style={[styles.shiftCard, { borderWidth: 2, borderColor: statusBorderColor }]}
        onPress={() => setSelectedUser(schedule)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <MaterialIcons name="person" size={20} color={colors.primary} />
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.text.secondary} />
        </View>

        <View style={styles.cardContent}>
          {staffSlots.length > 0 && (
            <View style={styles.infoRow}>
              <MaterialIcons name="work" size={16} color={colors.primary} />
              <Text style={styles.infoText}>スタッフ: {staffTimes}</Text>
            </View>
          )}
          {currentStatus && (
            <View style={styles.infoRow}>
              <MaterialIcons name={statusIcon as any} size={16} color={statusColor} />
              <Text style={[styles.infoText, { color: statusColor }]}>{currentStatus}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 左列：時計 + カレンダー */}
      <View style={styles.leftColumn}>
        {/* ヘッダー */}
        <View style={styles.columnHeaderBar}>
          <Text style={styles.columnTitle}>
            {format(selectedDate, "M月d日(E)", { locale: ja })}
          </Text>
        </View>

        {/* 時計 */}
        <View style={styles.clockSection}>
          <ClockWidget
            staffSchedules={staffWorkingHours}
            size={200}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
          />
        </View>

        {/* カレンダー */}
        <View style={styles.calendarSection}>
          <ShiftCalendar
            shifts={shifts}
            selectedDate={format(selectedDate, "yyyy-MM-dd")}
            currentMonth={format(
              new Date(currentYearMonth.year, currentYearMonth.month),
              "yyyy-MM-dd"
            )}
            currentUserStoreId={currentUserStoreId || ""}
            onDayPress={(day) => {
              const newDate = new Date(day.dateString);
              onDateSelect(newDate);
            }}
            onMonthChange={(month) => {
              const newDate = new Date(month.dateString);
              onDateSelect(newDate);
            }}
          />
        </View>
      </View>

      {/* 右列：シフトカード一覧 */}
      <View style={styles.rightColumn}>
        <View style={styles.columnHeaderBar}>
          <Text style={styles.columnTitle}>
            {format(selectedDate, "M月d日", { locale: ja })}のシフト
          </Text>
        </View>

        <ScrollView
          style={styles.shiftsScrollView}
          showsVerticalScrollIndicator={false}
        >
          {daySchedules.length > 0 ? (
            daySchedules.map((schedule) => renderShiftCard(schedule))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="event-busy"
                size={48}
                color={colors.text.disabled}
              />
              <Text style={styles.emptyText}>この日にシフトはありません</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* シフト詳細モーダル */}
      <Modal
        visible={selectedUser !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedUser(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                {selectedUser && (
                  <>
                    <Text style={styles.modalTitle}>
                      {selectedUser.position} のシフト詳細
                    </Text>

                    <Text style={styles.modalDateInfo}>
                      {format(selectedDate, "yyyy年M月d日 (E)", { locale: ja })}
                    </Text>

                    <ScrollView style={styles.modalScrollView}>
                      {selectedUser.slots.map((slot, index) => {
                        // スタッフシフトの場合は白文字、それ以外は通常の文字色
                        const isStaffSlot = slot.type !== "class";
                        const textColor = isStaffSlot ? "#FFFFFF" : colors.text.primary;

                        return (
                          <View
                            key={index}
                            style={[
                              styles.modalSlotItem,
                              {
                                backgroundColor:
                                  slot.type === "class"
                                    ? colors.surfaceElevated
                                    : slot.color || colors.primary + "1A",
                              },
                            ]}
                          >
                            <Text style={[styles.modalSlotTime, { color: textColor }]}>
                              {slot.start} ~ {slot.end}
                            </Text>
                            <Text style={[styles.modalSlotTask, { color: textColor }]}>
                              {slot.task || ""}
                            </Text>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background,
  },
  leftColumn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  columnHeaderBar: {
    height: SUB_HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clockSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: layout.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  calendarSection: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.padding.medium,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  shiftsScrollView: {
    flex: 1,
  },
  shiftCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    marginBottom: layout.padding.medium,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.padding.small,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  cardContent: {
    gap: layout.padding.small,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.padding.small,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.disabled,
    marginTop: layout.padding.medium,
  },
  // モーダル用スタイル（UserDayGanttModalと同じスタイル）
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    minWidth: 320,
    maxWidth: 400,
    width: "90%",
    maxHeight: "90%",
    alignItems: "center",
    ...shadows.modal,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 16,
    color: colors.primary,
  },
  modalDateInfo: {
    color: colors.text.primary,
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  modalScrollView: {
    width: "100%",
    marginBottom: 16,
    maxHeight: 320,
  },
  modalSlotItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    padding: 8,
    borderRadius: 4,
  },
  modalSlotTime: {
    fontWeight: "bold",
    minWidth: 120,
    textAlign: "center",
  },
  modalSlotTask: {
    fontSize: 15,
    marginLeft: 8,
  },
});
