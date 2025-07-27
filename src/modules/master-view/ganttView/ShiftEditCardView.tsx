import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { ShiftModal, ShiftData } from "./components/ShiftModal";

interface ShiftEditCardViewProps {
  shifts: any[];
  users: Array<{ uid: string; nickname: string; color?: string }>;
  days: string[];
  currentYearMonth: { year: number; month: number };
  onMonthChange: (year: number, month: number) => void;
  onShiftUpdate: () => void;
  onShiftPress: (shift: any) => void;
  onShiftCreate?: (date: string) => void;
  onShiftSave?: (data: ShiftData) => void;
  onShiftDelete?: (shiftId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const ShiftEditCardView: React.FC<ShiftEditCardViewProps> = ({
  shifts,
  users,
  days,
  currentYearMonth,
  onMonthChange,
  onShiftUpdate,
  onShiftPress,
  onShiftCreate,
  onShiftSave,
  onShiftDelete,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // モーダル状態管理
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">(
    "create"
  );
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const getShiftsForDate = (date: string) => {
    const dateShifts = shifts.filter((shift) => {
      // 削除されていないシフトのみを表示
      const isNotDeleted =
        shift.status !== "deleted" && shift.status !== "purged";
      const matchesDate = shift.date === date;
      return isNotDeleted && matchesDate;
    });
    return dateShifts;
  };

  const getUserById = (userId: string) => {
    return users.find((user) => user.uid === userId);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM形式に変換
  };

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

  // モーダル処理関数
  const openCreateModal = (date: string) => {
    setSelectedDate(date);
    setSelectedShift(null);
    setModalMode("create");
    setModalVisible(true);
  };

  const openEditModal = (shift: any) => {
    setSelectedShift(shift);
    setSelectedDate(shift.date);
    setModalMode("edit");
    setModalVisible(true);
  };

  const openDeleteModal = (shift: any) => {
    setSelectedShift(shift);
    setSelectedDate(shift.date);
    setModalMode("delete");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedShift(null);
    setSelectedDate("");
  };

  const handleShiftSave = async (data: ShiftData) => {
    try {
      await onShiftSave?.(data);
      onShiftUpdate(); // 一覧を更新
    } catch (error) {
      throw error;
    }
  };

  const handleShiftDelete = async (shiftId: string) => {
    try {
      await onShiftDelete?.(shiftId);
      onShiftUpdate(); // 一覧を更新
    } catch (error) {
      throw error;
    }
  };

  const renderShiftCard = (shift: any) => {
    const user = getUserById(shift.userId);
    const startTime = formatTime(shift.startTime);
    const endTime = formatTime(shift.endTime);

    return (
      <View
        key={shift.id}
        style={[
          styles.shiftCard,
          { borderLeftColor: user?.color || colors.primary },
        ]}
      >
        <TouchableOpacity
          style={styles.shiftContent}
          onPress={() => {
            openEditModal(shift);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.shiftHeader}>
            <Text style={styles.shiftUser}>{user?.nickname || "不明"}</Text>
            <Text style={styles.shiftTime}>
              {startTime} - {endTime}
            </Text>
          </View>
          {shift.subject && (
            <Text style={styles.shiftSubject}>{shift.subject}</Text>
          )}
        </TouchableOpacity>

        {/* 編集・削除ボタン */}
        <View style={styles.shiftActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              openEditModal(shift);
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="edit" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => openDeleteModal(shift)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDayCard = (date: string) => {
    const dayShifts = getShiftsForDate(date);
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const day = new Date(date).getDate();

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
          <View style={styles.dayInfo}>
            <Text style={[styles.dayNumber, isWeekend && styles.weekendText]}>
              {day}
            </Text>
            <Text style={[styles.dayOfWeek, isWeekend && styles.weekendText]}>
              {format(new Date(date), "E", { locale: ja })}
            </Text>
          </View>

          {/* シフト追加ボタン */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openCreateModal(date)}
          >
            <MaterialIcons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.shiftsContainer}>
          {dayShifts.length > 0 ? (
            dayShifts.map((shift) => renderShiftCard(shift))
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
          {days.map((date) => renderDayCard(date))}
        </View>
      </ScrollView>

      {/* シフト編集モーダル */}
      <ShiftModal
        visible={modalVisible}
        mode={modalMode}
        shiftData={selectedShift}
        date={selectedDate}
        users={users}
        onClose={closeModal}
        onSave={handleShiftSave}
        onDelete={handleShiftDelete}
      />
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
    minHeight: 100,
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
    justifyContent: "space-between",
    marginBottom: layout.padding.small,
    paddingBottom: layout.padding.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "50",
  },
  dayInfo: {
    flexDirection: "row",
    alignItems: "center",
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
  addButton: {
    padding: 6,
    borderRadius: layout.borderRadius.small,
    backgroundColor: colors.primary + "15",
  },
  shiftsContainer: {
    gap: layout.padding.small,
  },
  shiftCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.small,
    borderLeftWidth: 4,
    ...shadows.small,
    overflow: "hidden",
  },
  shiftContent: {
    padding: layout.padding.small,
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
  shiftActions: {
    flexDirection: "row",
    backgroundColor: colors.surface + "80",
    paddingHorizontal: layout.padding.small,
    paddingVertical: 6,
    gap: layout.padding.small,
  },
  actionButton: {
    padding: 6,
    borderRadius: layout.borderRadius.small,
  },
  editButton: {
    backgroundColor: colors.primary + "15",
  },
  deleteButton: {
    backgroundColor: colors.error + "15",
  },
  noShiftText: {
    fontSize: 12,
    color: colors.text.disabled,
    textAlign: "center",
    fontStyle: "italic",
  },
});
