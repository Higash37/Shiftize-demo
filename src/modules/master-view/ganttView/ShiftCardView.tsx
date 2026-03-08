import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import type { GanttViewViewProps } from "./GanttViewView.types";
import type { ShiftItem } from "@/common/common-models/ModelIndex";

interface ShiftCardViewProps extends GanttViewViewProps {
  onShiftPress: (shift: ShiftItem) => void;
}

export const ShiftCardView: React.FC<ShiftCardViewProps> = ({
  shifts,
  users,
  days,
  currentYearMonth,
  onMonthChange,
  onShiftUpdate,
  onShiftPress,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const getShiftsForDate = (date: string) =>
    shifts.filter(
      (shift) =>
        shift.status !== "deleted" &&
        shift.status !== "purged" &&
        shift.date === date
    );

  const handlePrevMonth = () => {
    const prevDate = subMonths(
      new Date(currentYearMonth.year, currentYearMonth.month),
      1
    );
    onMonthChange(prevDate.getFullYear(), prevDate.getMonth());
  };

  const handleNextMonth = () => {
    const nextDate = addMonths(
      new Date(currentYearMonth.year, currentYearMonth.month),
      1
    );
    onMonthChange(nextDate.getFullYear(), nextDate.getMonth());
  };

  const renderShiftCard = (shift: ShiftItem) => {
    const user = users.find((u) => u.uid === shift.userId);

    return (
      <TouchableOpacity
        key={shift.id}
        style={[
          styles.shiftCard,
          { borderLeftColor: user?.color || colors.primary },
        ]}
        onPress={() => {
          onShiftPress(shift);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.shiftHeader}>
          <Text style={styles.shiftUser}>{user?.nickname || "不明"}</Text>
          <Text style={styles.shiftTime}>
            {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
          </Text>
        </View>
        {shift.subject ? (
          <Text style={styles.shiftSubject}>{shift.subject}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderDayCard = (date: string) => {
    const dayShifts = getShiftsForDate(date);
    const isWeekend = [0, 6].includes(new Date(date).getDay());

    return (
      <Box
        key={date}
        variant="card"
        style={[
          styles.dayCard,
          isTablet && styles.dayCardTablet,
          isWeekend && styles.weekendCard,
        ]}
      >
        <View style={styles.dayHeader}>
          <Text style={[styles.dayNumber, isWeekend && styles.weekendText]}>
            {new Date(date).getDate()}
          </Text>
          <Text style={[styles.dayOfWeek, isWeekend && styles.weekendText]}>
            {format(new Date(date), "E", { locale: ja })}
          </Text>
        </View>

        <View style={styles.shiftsContainer}>
          {dayShifts.length > 0 ? (
            dayShifts.map((shift) => shift ? renderShiftCard(shift) : null)
          ) : (
            <Text style={styles.noShiftText}>シフトなし</Text>
          )}
        </View>
      </Box>
    );
  };

  return (
    <View style={styles.container}>
      {/* 月選択ヘッダー */}
      <View style={styles.monthHeader}>
        <TouchableOpacity style={styles.monthButton} onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {format(
            new Date(currentYearMonth.year, currentYearMonth.month),
            "yyyy年M月",
            { locale: ja }
          )}
        </Text>

        <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 日別カード一覧 */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.cardsGrid, isTablet && styles.cardsGridTablet]}>
          {days.map((date) => date ? renderDayCard(date) : null)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.padding.large,
    paddingVertical: layout.padding.medium,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  monthButton: {
    padding: layout.padding.small,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.primary + "15",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.padding.medium,
  },
  cardsGrid: {
    gap: layout.padding.small,
  },
  cardsGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: layout.padding.medium,
  },
  dayCard: {
    marginBottom: layout.padding.small,
    minHeight: 80,
  },
  dayCardTablet: {
    width: "48%",
    marginBottom: layout.padding.medium,
  },
  weekendCard: {
    backgroundColor: colors.surface + "CC",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.small,
    paddingBottom: layout.padding.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "50",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginRight: layout.padding.small,
  },
  dayOfWeek: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  weekendText: {
    color: colors.error,
  },
  shiftsContainer: {
    gap: layout.padding.small,
  },
  shiftCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.small,
    padding: layout.padding.small,
    borderLeftWidth: 4,
    ...shadows.small,
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shiftUser: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  shiftTime: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  shiftSubject: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  noShiftText: {
    fontSize: 12,
    color: colors.text.disabled,
    textAlign: "center",
    fontStyle: "italic",
  },
});
