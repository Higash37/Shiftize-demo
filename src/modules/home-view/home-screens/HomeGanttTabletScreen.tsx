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
import { colors } from "@/common/common-constants/ThemeConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { MaterialIcons } from "@expo/vector-icons";
import { ShiftCalendar } from "@/modules/reusable-widgets/calendar/main-calendar/ShiftCalendar";
import { ClockWidget } from "../home-components/home-widgets/ClockWidget";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

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
  shifts: any[];
  shiftsForDate: any[]; // 選択された日付のシフトデータ（時計ウィジェット用）
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

  // スタッフがいる時間帯を抽出（時計ウィジェット用）
  // スロットデータから連続したスタッフシフトの塊をグループ化
  const staffWorkingHours: Array<{ startTime: string; endTime: string }> = [];
  sampleSchedule.forEach((col) => {
    const staffSlots = col.slots
      .filter((s) => s.type !== "class")
      .sort((a, b) => a.start.localeCompare(b.start));

    // 連続したスタッフスロットをグループ化
    let currentGroup: typeof staffSlots = [];
    staffSlots.forEach((slot, index) => {
      if (currentGroup.length === 0) {
        currentGroup.push(slot);
      } else {
        const lastSlot = currentGroup[currentGroup.length - 1];
        // 前のスロットの終了時刻と現在のスロットの開始時刻が連続しているか確認
        if (lastSlot && lastSlot.end === slot.start) {
          currentGroup.push(slot);
        } else {
          // 連続していない場合、現在のグループを保存して新しいグループを開始
          if (currentGroup.length > 0 && currentGroup[0] && lastSlot) {
            staffWorkingHours.push({
              startTime: currentGroup[0].start,
              endTime: lastSlot.end,
            });
          }
          currentGroup = [slot];
        }
      }

      // 最後のスロットの場合、グループを保存
      if (index === staffSlots.length - 1 && currentGroup.length > 0) {
        const firstSlot = currentGroup[0];
        const lastSlot = currentGroup[currentGroup.length - 1];
        if (firstSlot && lastSlot) {
          staffWorkingHours.push({
            startTime: firstSlot.start,
            endTime: lastSlot.end,
          });
        }
      }
    });
  });

  // シフトカードのレンダリング（まとめた形式）
  const renderShiftCard = (schedule: SampleScheduleColumn) => {
    const userName = schedule.position;
    const userSlots = schedule.slots;

    // スタッフシフトと授業を分ける
    const staffSlots = userSlots.filter((s) => s.type !== "class");
    const classSlots = userSlots.filter((s) => s.type === "class");

    // 最初と最後の時間を取得
    const firstStaffSlot = staffSlots[0];
    const lastStaffSlot = staffSlots[staffSlots.length - 1];
    const staffTimes = staffSlots.length > 0 && firstStaffSlot && lastStaffSlot
      ? `${firstStaffSlot.start} - ${lastStaffSlot.end}`
      : "";

    // 現在の状態を判定
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    const isToday = today.getTime() === selectedDateOnly.getTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    let currentStatus = "";
    let statusIcon = "";
    let statusColor = colors.text.secondary;

    if (!isToday) {
      // 今日以外の日付は何も表示しない
      currentStatus = "";
    } else if (staffSlots.length > 0 || classSlots.length > 0) {
      // 今日の場合
      // 現在時刻がスタッフシフト中か授業中かをチェック
      const isInStaff = staffSlots.some((slot) => {
        return slot.start <= currentTimeStr && currentTimeStr < slot.end;
      });

      const isInClass = classSlots.some((slot) => {
        return slot.start <= currentTimeStr && currentTimeStr < slot.end;
      });

      // 全シフトの最初と最後の時間を取得
      const allSlots = [...staffSlots, ...classSlots].sort((a, b) =>
        a.start.localeCompare(b.start)
      );
      const firstSlot = allSlots[0];
      const lastSlot = allSlots[allSlots.length - 1];

      const isBeforeShift = firstSlot && currentTimeStr < firstSlot.start;
      const isAfterShift = lastSlot && currentTimeStr >= lastSlot.end;

      if (isBeforeShift) {
        currentStatus = `このあと ${firstSlot.start}~`;
        statusIcon = "schedule";
        statusColor = colors.text.secondary;
      } else if (isAfterShift) {
        currentStatus = "勤務終了";
        statusIcon = "done";
        statusColor = colors.text.disabled;
      } else if (isInStaff) {
        currentStatus = "現在: スタッフ中";
        statusIcon = "work";
        statusColor = colors.primary;
      } else if (isInClass) {
        currentStatus = "現在: 授業中";
        statusIcon = "school";
        statusColor = colors.text.secondary;
      } else {
        currentStatus = "現在: 休憩中";
        statusIcon = "free-breakfast";
        statusColor = colors.text.disabled;
      }
    }

    return (
      <TouchableOpacity
        key={userName}
        style={styles.shiftCard}
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
        {/* 時計 */}
        <View style={styles.clockSection}>
          <Text style={styles.clockTitle}>
            {format(selectedDate, "M月d日", { locale: ja })}
          </Text>
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
        <Text style={styles.columnTitle}>
          {format(selectedDate, "M月d日", { locale: ja })}のシフト
        </Text>

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
  clockTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: colors.background,
    padding: layout.padding.medium,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
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
