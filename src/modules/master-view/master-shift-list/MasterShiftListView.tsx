/**
 * @file MasterShiftListView.tsx
 * @description 月間シフト一覧画面。カレンダー + 編集モーダルの構成。
 *
 * 【このファイルの位置づけ】
 *   master-view > master-shift-list 配下の画面コンポーネント。
 *   マスターの「シフト一覧」タブで描画される。
 *
 * 主な内部ロジック:
 *   - ShiftCalendar で月間カレンダーを表示
 *   - 日付タップで ShiftModal を開く
 *   - シフトの作成・編集・削除をモーダル経由で実行
 */
import { SHIFT_HOURS } from "@/common/common-constants/BoundaryConstants";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { ShiftCalendar } from "@/modules/reusable-widgets/calendar/main-calendar/ShiftCalendar";
import { colors } from "@/common/common-constants/ThemeConstants";
import { useShiftsByMonth } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { useAuth } from "@/services/auth/useAuth";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftListItem } from "@/modules/user-view/user-shift-forms/user-shift-list/ShiftListItem";
import { ShiftDetailsView } from "@/modules/user-view/user-shift-forms/shiftDetail/ShiftDetailsView";
import { splitShiftIntoTimeSlots } from "@/modules/user-view/user-shift-utils/shift-time.utils";
import type { ShiftItem, ShiftStatus, ClassTimeSlot } from "@/common/common-models/model-shift/shiftTypes";
import { StyleSheet } from "react-native";
import { layout } from "@/common/common-constants/LayoutConstants";
import { DateNavigator, SUB_HEADER_HEIGHT } from "@/common/common-ui/ui-navigation/DateNavigator";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { EditShiftModalView } from "@/modules/reusable-widgets/gantt-chart/view-modals/EditShiftModalView";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { ServiceProvider } from "@/services/ServiceProvider";
import { calculateDurationHours, compareByDateThenTime } from "@/common/common-utils/util-shift/wageCalculator";
import { DEFAULT_SHIFT_STATUS_CONFIG } from "@/common/common-models/model-shift/shiftTypes";
import { createGanttChartMonthViewStyles } from "@/modules/reusable-widgets/gantt-chart/GanttChartMonthView.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { QuickShiftUrlModal } from "@/modules/master-view/quick-shift-url/QuickShiftUrlModal";

interface MasterShiftListViewProps {
  targetMonth: "this" | "next"; // 今月または来月
}

// 時間オプション（9:00-22:00を15分刻み）— 静的定数
const TIME_OPTIONS: string[] = (() => {
  const options: string[] = [];
  for (let hour = SHIFT_HOURS.START_HOUR_INCLUSIVE; hour <= SHIFT_HOURS.END_HOUR_INCLUSIVE; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === SHIFT_HOURS.END_HOUR_INCLUSIVE && minute > 0) break;
      options.push(
        `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`
      );
    }
  }
  return options;
})();

export const MasterShiftListView: React.FC<MasterShiftListViewProps> = ({
  targetMonth,
}) => {
  const { user } = useAuth();
  const initialDate = useMemo(() => {
    const today = new Date();
    return targetMonth === "next"
      ? new Date(today.getFullYear(), today.getMonth() + 1, 1)
      : today;
  }, [targetMonth]);
  const {
    shifts,
    loading: shiftsLoading,
    changeMonth,
    refetch,
  } = useShiftsByMonth(user?.storeId, initialDate.getFullYear(), initialDate.getMonth());
  const { users } = useUsers(user?.storeId);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() =>
    format(initialDate, "yyyy-MM")
  );
  const [displayMonth, setDisplayMonth] = useState<string | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isCalendarMounted, setIsCalendarMounted] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const shiftPositionsRef = useRef<Record<string, number>>({});
  const { width } = useWindowDimensions();

  // ガントチャートスタイル（MD3テーマ対応）+ モバイル用幅オーバーライド
  const ganttBaseStyles = useThemedStyles(createGanttChartMonthViewStyles);
  const mobileGanttStyles = useMemo(() => ({
    ...ganttBaseStyles,
    modalContent: [ganttBaseStyles.modalContent, { width: "90%", maxWidth: 500 }],
  }), [ganttBaseStyles]);

  // 編集モーダル用の状態
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [newShiftData, setNewShiftData] = useState<{
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    userId: string;
    nickname: string;
    subject: string;
    status: ShiftStatus;
    classes: ClassTimeSlot[];
  }>({
    date: "",
    startTime: "",
    endTime: "",
    userId: "",
    nickname: "",
    subject: "",
    status: "approved",
    classes: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // URL発行モーダル用の状態
  const [showUrlModal, setShowUrlModal] = useState(false);

  const timeOptions = TIME_OPTIONS;

  // ステータス設定（削除済み・purgedはピッカーから除外）
  const statusConfigs = useMemo(
    () => DEFAULT_SHIFT_STATUS_CONFIG.filter(
      (c) => c.status !== "deleted" && c.status !== "purged"
    ),
    []
  );

  // 月ごとにシフトをグループ化（全員分）
  const monthlyShifts = useMemo(() => {
    if (!displayMonth) {
      return [];
    }

    const displayMonthDate = new Date(`${displayMonth}-01`);
    const year = displayMonthDate.getFullYear();
    const month = displayMonthDate.getMonth();

    // 月の最初の日と最後の日を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 月の最後の日を週末まで拡張
    const adjustedLastDay = new Date(lastDay);
    adjustedLastDay.setDate(
      adjustedLastDay.getDate() + (7 - adjustedLastDay.getDay())
    );

    const filteredShifts = shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        const isInDateRange =
          shiftDate >= firstDay &&
          shiftDate <= adjustedLastDay &&
          shiftDate.getMonth() === month;
        const isNotDeleted =
          shift.status !== "deleted" && shift.status !== "purged";

        return isInDateRange && isNotDeleted;
      })
      .sort(compareByDateThenTime);

    return filteredShifts;
  }, [shifts, displayMonth]);

  // カレンダーがマウントされた時に現在の月を設定
  const handleCalendarMount = () => {
    setIsCalendarMounted(true);
    setDisplayMonth(currentMonth);
  };

  const handleMonthChange = (month: { dateString: string }) => {
    const date = new Date(month.dateString);
    const monthKey = format(date, "yyyy-MM");
    setCurrentMonth(monthKey);
    setDisplayMonth(monthKey);
    setSelectedDate("");
    setSelectedShiftId(null);

    // 月が変わったらシフトを取得
    changeMonth(date.getFullYear(), date.getMonth());
  };

  const handleDayPress = (day: { dateString: string }) => {
    // 同じ日付をもう一度押したときに選択を解除
    if (selectedDate === day.dateString) {
      setSelectedDate("");
      return;
    }

    const targetDate = new Date(day.dateString);
    const targetMonthString = format(targetDate, "yyyy-MM");
    const currentMonthString = currentMonth;

    // 違う月の日付がクリックされた場合、月を切り替える
    if (targetMonthString !== currentMonthString) {
      handleMonthChange({ dateString: `${targetMonthString}-01` });
      // 月切り替え後に日付を選択
      setTimeout(() => {
        setSelectedDate(day.dateString);
      }, 100);
    } else {
      // 同じ月の日付の場合、そのまま選択
      setSelectedDate(day.dateString);
    }
  };

  // 選択された日付のシフトにスクロール
  useEffect(() => {
    if (!selectedDate) return;
    const selectedShift = monthlyShifts.find(
      (shift) => shift.date === selectedDate
    );
    if (!selectedShift) return;
    const targetY = shiftPositionsRef.current[selectedShift.id];
    if (typeof targetY !== "number") return;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
    }, 120);
  }, [selectedDate, monthlyShifts]);

  // useShiftsByMonth が初回マウント時に自動取得するため手動fetchは不要

  // シフトカードをタップしたときのハンドラー（編集モーダルを開く）
  const handleShiftPress = (shift: ShiftItem) => {
    setEditingShift(shift);
    setNewShiftData({
      id: shift.id,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      userId: shift.userId,
      nickname: shift.nickname,
      subject: shift.subject || "",
      status: shift.status,
      classes: shift.classes || [],
    });
    setShowEditModal(true);
  };

  // シフト保存ハンドラー
  const handleSaveShift = async () => {
    if (!newShiftData.id) return;

    try {
      setIsLoading(true);

      const durationHours = calculateDurationHours(newShiftData.startTime, newShiftData.endTime);

      await ServiceProvider.shifts.updateShift(newShiftData.id, {
        userId: newShiftData.userId,
        storeId: user?.storeId || "",
        date: newShiftData.date,
        startTime: newShiftData.startTime,
        endTime: newShiftData.endTime,
        type: "user",
        subject: newShiftData.subject || "",
        isCompleted: false,
        duration: durationHours,
        status: newShiftData.status,
        classes: newShiftData.classes || [],
      });

      setShowEditModal(false);
      setEditingShift(null);
      refetch();
      Alert.alert("成功", "シフトを更新しました");
    } catch (error) {
      Alert.alert("エラー", "シフトの保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // シフト削除ハンドラー
  const handleDeleteShift = async () => {
    if (!editingShift) return;

    try {
      setIsLoading(true);
      await ServiceProvider.shifts.markShiftAsDeleted(editingShift.id);
      setShowEditModal(false);
      setEditingShift(null);
      refetch();
      Alert.alert("成功", "シフトを削除しました");
    } catch (error) {
      Alert.alert("エラー", "シフトの削除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const title = targetMonth === "next" ? "来月のシフト" : "今月のシフト";
  const cs = useMD3Theme();

  // サブヘッダー用の月ナビゲーション
  const subHeaderLabel = useMemo(() => {
    const d = new Date(currentMonth + "-01");
    const validDate = Number.isNaN(d.getTime()) ? new Date() : d;
    return `${validDate.getFullYear()}年${validDate.getMonth() + 1}月`;
  }, [currentMonth]);

  const handlePrevMonth = useCallback(() => {
    const d = new Date(currentMonth + "-01");
    d.setMonth(d.getMonth() - 1);
    handleMonthChange({ dateString: format(d, "yyyy-MM-dd") });
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    const d = new Date(currentMonth + "-01");
    d.setMonth(d.getMonth() + 1);
    handleMonthChange({ dateString: format(d, "yyyy-MM-dd") });
  }, [currentMonth]);

  if (shiftsLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MasterHeader title={title} />
      {/* サブヘッダー：年月ピッカー */}
      <View style={{
        height: SUB_HEADER_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: cs.colorScheme.surface,
        borderBottomWidth: 1,
        borderBottomColor: cs.colorScheme.outlineVariant,
      }}>
        <DateNavigator
          label={subHeaderLabel}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
      </View>
      <View style={styles.calendarContainer}>
        <ShiftCalendar
          key={`calendar-${currentMonth}`}
          shifts={monthlyShifts}
          selectedDate={selectedDate}
          currentMonth={currentMonth + "-01"}
          currentUserStoreId={""} // マスター用なので空文字（全員分表示）
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          onMount={handleCalendarMount}
          hideMonthNav
          responsiveSize={{
            container: {
              width: "98%",
              maxWidth: 600,
              paddingVertical: 0,
            },
            day: { fontSize: 32, fontWeight: "700" },
            scale: 0.8,
          }}
        />

      </View>
      {isCalendarMounted && displayMonth && (
        <ScrollView
          ref={scrollViewRef}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {monthlyShifts.length > 0 ? (
            monthlyShifts.map((shift) => {
              const isSelected = selectedShiftId === shift.id;
              const timeSlots = isSelected
                ? splitShiftIntoTimeSlots(shift)
                : null;
              return (
                <View
                  key={shift.id}
                  style={{ width: "100%" }}
                  onLayout={({ nativeEvent }) => {
                    shiftPositionsRef.current[shift.id] = nativeEvent.layout.y;
                  }}
                >
                  <ShiftListItem
                    shift={shift}
                    isSelected={isSelected}
                    selectedDate={selectedDate}
                    onPress={() => {
                      handleShiftPress(shift);
                    }}
                    onDetailsPress={() => {
                      setSelectedShiftId(isSelected ? null : shift.id);
                    }}
                    showNickname={true}
                  >
                    {isSelected && timeSlots && (
                      <ShiftDetailsView timeSlots={timeSlots} />
                    )}
                  </ShiftListItem>
                </View>
              );
            })
          ) : (
            <View style={styles.noShiftContainer}>
              <Text style={styles.noShiftText}>この月のシフトはありません</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* シフト編集モーダル */}
      {showEditModal && (
        <EditShiftModalView
          visible={showEditModal}
          newShiftData={newShiftData}
          users={users.map((u) => ({ uid: u.uid, nickname: u.nickname }))}
          timeOptions={timeOptions}
          statusConfigs={statusConfigs}
          isLoading={isLoading}
          styles={mobileGanttStyles}
          onChange={(field, value) =>
            setNewShiftData((prev) => ({ ...prev, [field]: value }))
          }
          onClose={() => {
            setShowEditModal(false);
            setEditingShift(null);
          }}
          onSave={handleSaveShift}
          onDelete={handleDeleteShift}
        />
      )}

      {/* クイックURL発行モーダル */}
      {user?.storeId && user?.uid && (
        <QuickShiftUrlModal
          visible={showUrlModal}
          storeId={user.storeId}
          userId={user.uid}
          onClose={() => setShowUrlModal(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    paddingHorizontal: layout.padding.medium,
    paddingTop: 0,
    paddingBottom: layout.padding.small,
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: layout.padding.medium,
    paddingBottom: layout.padding.large,
  },
  noShiftContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noShiftText: {
    fontSize: 16,
    color: colors.text.disabled,
  },
  quickUrlButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    padding: layout.padding.medium,
    borderRadius: 12,
    marginTop: layout.padding.medium,
    marginHorizontal: layout.padding.medium,
  },
  quickUrlButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: layout.padding.small,
  },
});
