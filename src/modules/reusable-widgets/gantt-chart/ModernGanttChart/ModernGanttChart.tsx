import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  addDays,
  isSameDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { DEFAULT_SHIFT_TYPES, ShiftTypeConfig } from "./types";
import { PayrollModal } from "./PayrollModal";
import { ShiftTypeLegend } from "./ShiftTypeLegend";
import { getDateBackgroundColor, getDateTextColor } from "@/common/common-utils/date/dateUtils";

type ViewMode = "week" | "month";

// 型安全性の強化
interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
  shiftType: string;
}

interface User {
  uid: string;
  nickname: string;
  color?: string;
  hourlyWage?: number;
}

interface ModernGanttChartProps {
  shifts: Shift[];
  users: User[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onShiftPress?: (shift: Shift) => void;
  onShiftCreate?: (date: string, time: string, userId: string) => void;
  shiftTypes?: ShiftTypeConfig[];
}

export const ModernGanttChart: React.FC<ModernGanttChartProps> = ({
  shifts,
  users,
  currentDate,
  onDateChange,
  onShiftPress,
  onShiftCreate,
  shiftTypes = DEFAULT_SHIFT_TYPES,
}) => {
  const { width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showPayrollModal, setShowPayrollModal] = useState(false);

  // 時間軸の設定（9:00 - 22:00を15分刻み）
  const startHour = 9;
  const endHour = 22;
  const minuteInterval = 15;
  const totalMinutes = (endHour - startHour) * 60;
  const timeSlots = totalMinutes / minuteInterval;

  // 表示する日付の計算（メモ化）
  const daysToShow = useMemo(() => {
    if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // 月曜始まり
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    } else {
      // 月表示の場合は月の日数分
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from(
        { length: daysInMonth },
        (_, i) => new Date(year, month, i + 1)
      );
    }
  }, [currentDate, viewMode]);

  // 時間位置の計算（メモ化）
  const timeToPosition = useCallback((timeString: string): number => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutesFromStart = (hours - startHour) * 60 + minutes;
    return (totalMinutesFromStart / totalMinutes) * 100;
  }, [startHour, endHour]);

  // 時間幅の計算（メモ化）
  const getTimeWidth = useCallback((startTime: string, endTime: string): number => {
    const startPos = timeToPosition(startTime);
    const endPos = timeToPosition(endTime);
    return endPos - startPos;
  }, [timeToPosition]);

  // シフトタイプの取得（メモ化）
  const getShiftType = useCallback((shiftTypeId: string) => {
    return shiftTypes.find((type) => type.id === shiftTypeId) || shiftTypes[0];
  }, [shiftTypes]);

  // 日付のシフト取得（メモ化）
  const getShiftsForDate = useCallback((date: Date, userId?: string) => {
    const dateString = format(date, "yyyy-MM-dd");
    return shifts.filter(
      (shift) =>
        shift.date === dateString && (!userId || shift.userId === userId)
    );
  }, [shifts]);

  // 重複シフトのレイヤー計算（メモ化・最適化）
  const calculateShiftLayers = useCallback((dayShifts: Shift[]) => {
    const sortedShifts = [...dayShifts].sort((a, b) => {
      const aStart = timeToPosition(a.startTime);
      const bStart = timeToPosition(b.startTime);
      return aStart - bStart;
    });

    const layers: Shift[][] = [];

    for (const shift of sortedShifts) {
      const shiftStart = timeToPosition(shift.startTime);
      const shiftEnd = timeToPosition(shift.endTime);

      // 適切なレイヤーを見つける（早期終了最適化）
      let layerIndex = 0;
      while (layerIndex < layers.length) {
        const layer = layers[layerIndex];
        const hasOverlap = layer.some((existingShift) => {
          const existingStart = timeToPosition(existingShift.startTime);
          const existingEnd = timeToPosition(existingShift.endTime);
          return !(shiftEnd <= existingStart || shiftStart >= existingEnd);
        });

        if (!hasOverlap) break;
        layerIndex++;
      }

      if (!layers[layerIndex]) {
        layers[layerIndex] = [];
      }
      layers[layerIndex].push(shift);
    }

    return layers;
  }, [timeToPosition]);

  // 給与計算
  const calculatePayroll = (userId: string, startDate: Date, endDate: Date) => {
    const user = users.find((u) => u.uid === userId);
    if (!user?.hourlyWage) return 0;

    const userShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shift.userId === userId &&
        shiftDate >= startDate &&
        shiftDate <= endDate &&
        shift.shiftType === "work"
      ); // 勤務シフトのみ計算
    });

    return userShifts.reduce((total, shift) => {
      const [startHours, startMinutes] = shift.startTime.split(":").map(Number);
      const [endHours, endMinutes] = shift.endTime.split(":").map(Number);
      const workMinutes =
        endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
      const workHours = workMinutes / 60;
      return total + workHours * user.hourlyWage!;
    }, 0);
  };

  // ヘッダーコンポーネント
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            const newDate =
              viewMode === "week"
                ? addDays(currentDate, -7)
                : subMonths(currentDate, 1);
            onDateChange(newDate);
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {viewMode === "week"
            ? `${format(currentDate, "yyyy年M月", { locale: ja })} ${format(
                startOfWeek(currentDate, { weekStartsOn: 1 }),
                "M/d",
                { locale: ja }
              )}-${format(
                addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6),
                "M/d",
                { locale: ja }
              )}`
            : format(currentDate, "yyyy年M月", { locale: ja })}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            const newDate =
              viewMode === "week"
                ? addDays(currentDate, 7)
                : addMonths(currentDate, 1);
            onDateChange(newDate);
          }}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === "week" && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode("week")}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === "week" && styles.viewModeTextActive,
            ]}
          >
            週
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === "month" && styles.viewModeButtonActive,
          ]}
          onPress={() => setViewMode("month")}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === "month" && styles.viewModeTextActive,
            ]}
          >
            月
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.payrollButton}
          onPress={() => setShowPayrollModal(true)}
        >
          <MaterialIcons name="calculate" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 時間軸のレンダリング
  const renderTimeAxis = () => (
    <View style={styles.timeAxis}>
      <View style={styles.timeAxisUserColumn} />
      {Array.from({ length: endHour - startHour + 1 }, (_, i) => {
        const hour = startHour + i;
        return (
          <View key={hour} style={styles.timeLabel}>
            <Text style={styles.timeLabelText}>{hour}:00</Text>
          </View>
        );
      })}
    </View>
  );

  // シフトバーのレンダリング
  const renderShiftBar = (
    shift: any,
    layerIndex: number,
    totalLayers: number
  ) => {
    const shiftType = getShiftType(shift.shiftType || "work");
    const leftPosition = timeToPosition(shift.startTime);
    const width = getTimeWidth(shift.startTime, shift.endTime);
    const height = totalLayers > 1 ? 20 : 28;
    const top = layerIndex * (height + 2);

    return (
      <TouchableOpacity
        key={shift.id}
        style={[
          styles.shiftBar,
          {
            left: `${leftPosition}%`,
            width: `${width}%`,
            backgroundColor: shiftType.backgroundColor,
            height,
            top,
          },
        ]}
        onPress={() => onShiftPress?.(shift)}
      >
        <Text
          style={[styles.shiftBarText, { color: shiftType.color }]}
          numberOfLines={1}
        >
          {shiftType.name}
        </Text>
        {width > 15 && (
          <Text
            style={[styles.shiftBarTime, { color: shiftType.color }]}
            numberOfLines={1}
          >
            {shift.startTime.substring(0, 5)}-{shift.endTime.substring(0, 5)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // ユーザー行のレンダリング
  const renderUserRow = (user: any) => (
    <View key={user.uid} style={styles.userRow}>
      <View style={styles.userInfo}>
        <View
          style={[
            styles.userColorIndicator,
            { backgroundColor: user.color || colors.primary },
          ]}
        />
        <Text style={styles.userName} numberOfLines={1}>
          {user.nickname}
        </Text>
        {user.hourlyWage && (
          <Text style={styles.hourlyWage}>¥{user.hourlyWage}/h</Text>
        )}
      </View>

      <ScrollView
        horizontal
        style={styles.userTimelineContainer}
        showsHorizontalScrollIndicator={true}
      >
        <View style={styles.userTimeline}>
          {daysToShow.map((date) => {
            const dayShifts = getShiftsForDate(date, user.uid);
            const layers = calculateShiftLayers(dayShifts);
            const dayWidth =
              viewMode === "week"
                ? (width * 0.7) / 7
                : (width * 0.7) / daysToShow.length;
            const dateString = format(date, "yyyy-MM-dd");
            const dateBackgroundColor = getDateBackgroundColor(dateString);
            const dateTextColor = getDateTextColor(dateString);

            return (
              <View
                key={date.toISOString()}
                style={[styles.dayColumn, { width: dayWidth, backgroundColor: dateBackgroundColor }]}
              >
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayNumber, dateTextColor ? { color: dateTextColor } : undefined]}>{format(date, "d")}</Text>
                  <Text style={[styles.dayName, dateTextColor ? { color: dateTextColor } : undefined]}>
                    {format(date, "E", { locale: ja })}
                  </Text>
                </View>

                <View style={styles.shiftContainer}>
                  {layers.map((layer, layerIndex) =>
                    layer.map((shift) =>
                      renderShiftBar(shift, layerIndex, layers.length)
                    )
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ShiftTypeLegend shiftTypes={shiftTypes} />
      {renderTimeAxis()}

      <ScrollView
        style={styles.chartContainer}
        showsVerticalScrollIndicator={true}
      >
        {users.map((user) => renderUserRow(user))}
      </ScrollView>

      {/* 給与計算モーダル */}
      <PayrollModal
        visible={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
        users={users}
        shifts={shifts}
        currentDate={currentDate}
      />
    </View>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.padding.small,
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
    minWidth: 120,
    textAlign: "center",
  },
  viewModeButton: {
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  viewModeTextActive: {
    color: colors.text.white,
  },
  payrollButton: {
    padding: layout.padding.small,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.primary + "15",
  },
  timeAxis: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: layout.padding.small,
  },
  timeAxisUserColumn: {
    width: 120,
  },
  timeLabel: {
    flex: 1,
    alignItems: "center",
  },
  timeLabelText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  chartContainer: {
    flex: 1,
  },
  userRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "30",
    minHeight: 60,
  },
  userInfo: {
    width: 120,
    padding: layout.padding.small,
    justifyContent: "center",
    backgroundColor: colors.surface + "80",
  },
  userColorIndicator: {
    width: 4,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginLeft: 8,
  },
  hourlyWage: {
    fontSize: 11,
    color: colors.text.secondary,
    marginLeft: 8,
    marginTop: 2,
  },
  userTimelineContainer: {
    flex: 1,
  },
  userTimeline: {
    flexDirection: "row",
    height: 60,
  },
  dayColumn: {
    borderRightWidth: 1,
    borderRightColor: colors.border + "30",
    position: "relative",
  },
  dayHeader: {
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "20",
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
  },
  dayName: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  shiftContainer: {
    flex: 1,
    position: "relative",
    paddingVertical: 4,
  },
  shiftBar: {
    position: "absolute",
    borderRadius: layout.borderRadius.small,
    paddingHorizontal: 4,
    paddingVertical: 2,
    justifyContent: "center",
    ...shadows.small,
  },
  shiftBarText: {
    fontSize: 10,
    fontWeight: "600",
  },
  shiftBarTime: {
    fontSize: 8,
    opacity: 0.8,
  },
});
