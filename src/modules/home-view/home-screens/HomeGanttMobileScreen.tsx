/**
 * @file HomeGanttMobileScreen.tsx
 * @description モバイル版ホーム画面。時計ウィジェット + シフト一覧モーダルの構成。
 *
 * 【このファイルの位置づけ】
 *   home-view > home-screens 配下の画面コンポーネント。
 *   HomeCommonScreen がモバイル幅の時に描画する。
 *
 * 主な内部ロジック:
 *   - ClockWidget でアナログ時計を表示
 *   - 下部にシフト情報カードとスタッフ数カードを表示
 *   - カードタップでモーダルを開く
 *   - GanttHalfSwitch で前半/後半の時間帯を切り替え
 */
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
import { ClockWidget } from "../home-components/home-widgets/ClockWidget";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getShiftStatus, groupConsecutiveSlots } from "../home-utils/shiftStatusUtils";

interface Props {
  namesFirst: string[];
  namesSecond: string[];
  timesFirst: string[];
  timesSecond: string[];
  sampleSchedule: SampleScheduleColumn[];
  CELL_WIDTH: number;
  showFirst: boolean;
  onCellPress?: (userName: string) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  shiftsForDate?: any[];
  maxHeight?: number; // カレンダー部分の最大高さ
  showShiftListModal?: boolean; // シフト一覧モーダルの表示状態
  onToggleShiftListModal?: (show: boolean) => void; // シフト一覧モーダルの開閉制御
}

export const HomeGanttMobileScreen: React.FC<Props> = ({
  sampleSchedule,
  selectedDate = new Date(),
  onDateSelect = () => {},
  shiftsForDate = [],
  maxHeight,
  showShiftListModal: showShiftListModalProp,
  onToggleShiftListModal,
}) => {
  // カレンダーのサイズを親の高さに合わせて計算
  // padding分を引いて、適切なサイズに調整
  const clockSize = maxHeight
    ? Math.min(maxHeight - 60, 280) // 最大280px、padding考慮
    : 300; // デフォルト300px

  // 親から制御される場合はpropsを使用、そうでない場合は内部stateを使用
  const [internalShowShiftListModal, setInternalShowShiftListModal] =
    useState(false);
  const showShiftListModal =
    showShiftListModalProp ?? internalShowShiftListModal;
  const setShowShiftListModal =
    onToggleShiftListModal ?? setInternalShowShiftListModal;

  const [selectedUser, setSelectedUser] = useState<SampleScheduleColumn | null>(
    null
  );

  // 選択された日付のシフトがあるユーザーとそのシフトを取得
  const daySchedules = sampleSchedule.filter(
    (col) => col.slots && col.slots.length > 0
  );

  const staffWorkingHours = groupConsecutiveSlots(sampleSchedule);

  // シフトカードのレンダリング
  const renderShiftCard = (schedule: SampleScheduleColumn) => {
    const userName = schedule.position;
    const userSlots = schedule.slots;

    // スタッフシフトと授業を分ける
    const staffSlots = userSlots.filter((s) => s.type !== "class");
    const classSlots = userSlots.filter((s) => s.type === "class");

    // 最初と最後の時間を取得
    const firstSlot = staffSlots[0];
    const lastSlot = staffSlots.at(-1);
    const staffTimes =
      firstSlot && lastSlot ? `${firstSlot.start} - ${lastSlot.end}` : "";

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
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={colors.text.secondary}
          />
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
              <MaterialIcons
                name={statusIcon as any}
                size={16}
                color={statusColor}
              />
              <Text style={[styles.infoText, { color: statusColor }]}>
                {currentStatus}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.scrollView}>
        {/* 時計を中央に配置 */}
        <View style={styles.clockContainer}>
          <TouchableOpacity
            onPress={() => setShowShiftListModal(true)}
            activeOpacity={0.8}
          >
            <ClockWidget
              staffSchedules={staffWorkingHours}
              size={clockSize}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* シフトカード一覧モーダル */}
      <Modal
        visible={showShiftListModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShiftListModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowShiftListModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.shiftListModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {format(selectedDate, "M月d日", { locale: ja })}のシフト
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowShiftListModal(false)}
                  >
                    <MaterialIcons
                      name="close"
                      size={28}
                      color={colors.text.primary}
                    />
                  </TouchableOpacity>
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
                      <Text style={styles.emptyText}>
                        この日にシフトはありません
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* シフト詳細モーダル */}
      <Modal
        visible={selectedUser !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedUser(null)}>
          <View style={styles.detailModalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.detailModalContent}>
                {selectedUser && (
                  <>
                    <Text style={styles.detailModalTitle}>
                      {selectedUser.position} のシフト詳細
                    </Text>

                    <Text style={styles.modalDateInfo}>
                      {format(selectedDate, "yyyy年M月d日 (E)", { locale: ja })}
                    </Text>

                    <ScrollView style={styles.modalScrollView}>
                      {selectedUser.slots.map((slot, index) => {
                        const isStaffSlot = slot.type !== "class";
                        const textColor = isStaffSlot
                          ? "#FFFFFF"
                          : colors.text.primary;

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
                            <Text
                              style={[
                                styles.modalSlotTime,
                                { color: textColor },
                              ]}
                            >
                              {slot.start} ~ {slot.end}
                            </Text>
                            <Text
                              style={[
                                styles.modalSlotTask,
                                { color: textColor },
                              ]}
                            >
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  clockContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: -20,
    paddingBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shiftListModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    minWidth: 320,
    maxWidth: 400,
    width: "90%",
    maxHeight: "80%",
    ...shadows.modal,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
  },
  shiftsScrollView: {
    width: "100%",
    maxHeight: "100%",
  },
  shiftCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    marginBottom: layout.padding.medium,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
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
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModalContent: {
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
  detailModalTitle: {
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
