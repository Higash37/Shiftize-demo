import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { ServiceProvider } from "@/services/ServiceProvider";
import { ShiftCalendar } from "@/modules/reusable-widgets/calendar/main-calendar/ShiftCalendar";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { Header } from "@/common/common-ui/ui-layout/LayoutHeader";
import { useAuth } from "@/services/auth/useAuth";
import { format } from "date-fns";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { ShiftListItem } from "./ShiftListItem";
import { ShiftDetailsView } from "../shiftDetail/ShiftDetailsView";
import { splitShiftIntoTimeSlots } from "../../user-shift-utils/shift-time.utils";
import { createShiftListViewStyles } from "./styles";
import type { ShiftSubmissionPeriod } from "@/services/interfaces/IShiftSubmissionService";
import ShiftModal from "../ListModal/ShiftModal";
import ShiftReportModal from "../ListModal/ShiftReportModal";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";
import type { ShiftItem } from "@/common/common-models/model-shift/shiftTypes";

export const UserShiftList = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { shifts, loading: shiftsLoading, fetchShifts } = useShift();
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM");
  });
  const [displayMonth, setDisplayMonth] = useState<string | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isCalendarMounted, setIsCalendarMounted] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalShift, setModalShift] = useState<ShiftItem | null>(null);
  const [currentUserStoreId, setCurrentUserStoreId] = useState<
    string | undefined
  >(undefined);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [comments, setComments] = useState("");
  const scrollViewRef = useRef<ScrollView | null>(null);
  const shiftPositionsRef = useRef<Record<string, number>>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // MD3 theme hooks
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(
    () => createShiftListViewStyles(theme, bp),
    [theme, bp]
  );

  // シフト確定ボタン用の状態
  const [period, setPeriod] = useState<ShiftSubmissionPeriod | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 画面がフォーカスされた時にデータを更新
  // 初回マウント時のfetchはuseShift内のuseEffectで実行されるため不要
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchShifts();
    });

    return unsubscribe;
  }, [navigation, fetchShifts]);

  // 期間設定を読み込む
  useEffect(() => {
    if (user?.storeId) {
      loadActivePeriod();
    }
  }, [user?.storeId]);

  const loadActivePeriod = async () => {
    try {
      const periods = await ServiceProvider.shiftSubmissions.getActivePeriods(
        user?.storeId || ""
      );
      const currentPeriod = periods.length > 0 ? periods[0] : null;
      setPeriod(currentPeriod ?? null);

      // 確定状況もロード
      if (currentPeriod && user?.uid) {
        const isConfirmed =
          await ServiceProvider.shiftConfirmations.getUserConfirmationStatus(
            user.uid,
            currentPeriod.id
          );
        setIsCompleted(isConfirmed);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleShiftConfirm = () => {
    if (isCompleted) {
      // 確定済みの場合は取り消しを確認
      Alert.alert("確認", "シフト確定を取り消しますか？", [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "取り消し",
          style: "destructive",
          onPress: async () => {
            try {
              if (user?.uid && period?.id) {
                await ServiceProvider.shiftConfirmations.cancelConfirmation(
                  user.uid,
                  period.id
                );
                setIsCompleted(false);
              }
            } catch (error) {
              console.error(error);
              Alert.alert("エラー", "取り消しに失敗しました");
            }
          },
        },
      ]);
    } else {
      // 未確定の場合は確認モーダルを表示
      setShowConfirmModal(true);
    }
  };

  const handleConfirmComplete = async () => {
    try {
      if (user?.uid && user?.storeId && period?.id) {
        await ServiceProvider.shiftConfirmations.confirmShift(
          user.uid,
          user.storeId,
          period.id
        );
        setIsCompleted(true);
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("エラー", "確定に失敗しました");
    }
  };

  // ユーザーの店舗IDを取得
  useEffect(() => {
    const fetchUserStoreId = async () => {
      if (!user?.uid) return;

      try {
        const userData = await ServiceProvider.users.getUserData(user.uid) as (Record<string, any>) | null;
        if (userData) {
          setCurrentUserStoreId(userData['storeId']);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserStoreId();
  }, [user]);

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
  };

  // 月ごとにシフトをグループ化
  const monthlyShifts = useMemo(() => {
    if (!displayMonth || !user) {
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
        const isUserShift = shift.userId === user.uid;
        const isNotDeleted =
          shift.status !== "deleted" && shift.status !== "purged";

        return isInDateRange && isUserShift && isNotDeleted;
      })
      .sort((a, b) => {
        const dateCompare =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare === 0) {
          return (
            new Date(`2000-01-01T${a.startTime}`).getTime() -
            new Date(`2000-01-01T${b.startTime}`).getTime()
          );
        }
        return dateCompare;
      });

    return filteredShifts;
  }, [shifts, displayMonth, user]);

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
  const handleShiftEdit = (shift: ShiftItem) => {
    router.push({
      pathname: "/(main)/user/shifts/create",
      params: {
        mode: "edit",
        shiftId: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        classes: JSON.stringify(shift.classes || []),
      },
    });
  };

  const handleShiftPress = (shift: ShiftItem) => {
    if (shift.status === "approved") {
      setModalShift(shift);
      setModalVisible(true);
    } else {
      handleShiftEdit(shift);
    }
  };

  const handleReportShift = async () => {
    if (modalShift) {
      setModalVisible(false);
      setReportModalVisible(true);
    }
  };

  const handleEditShift = () => {
    if (modalShift) {
      handleShiftEdit(modalShift);
    }
    setModalVisible(false);
  };

  const containerStyle = bp.isTablet
    ? styles.tabletContainer
    : styles.defaultContainer;

  return (
    <>
      <View style={containerStyle}>
        <Header
          title="シフト一覧"
          onPressSettings={() => setShowPasswordModal(true)}
        />
        <View
          style={[styles.calendarContainer, styles.calendarContainerCompact]}
        >
          <ShiftCalendar
            key={`calendar-${currentMonth}`}
            shifts={monthlyShifts}
            selectedDate={selectedDate}
            currentMonth={currentMonth + "-01"}
            currentUserStoreId={currentUserStoreId ?? ""}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            onMount={handleCalendarMount}
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
            {/* シフト確定ボタン */}
            {period && (
              <View style={styles.confirmButtonWrapper}>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    isCompleted && styles.confirmButtonCompleted,
                  ]}
                  onPress={handleShiftConfirm}
                  disabled={isCompleted}
                >
                  <Text style={styles.confirmButtonText}>
                    {isCompleted ? "確定済み" : "シフト確定"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {monthlyShifts.length > 0 ? (
              monthlyShifts.map((shift) => {
                // シフトの表示
                const isSelected = selectedShiftId === shift.id;
                const timeSlots = isSelected
                  ? splitShiftIntoTimeSlots(shift)
                  : null;
                return (
                  <View
                    key={shift.id}
                    style={{ width: "100%" }}
                    onLayout={({ nativeEvent }) => {
                      shiftPositionsRef.current[shift.id] =
                        nativeEvent.layout.y;
                    }}
                  >
                    <ShiftListItem
                      shift={shift as unknown as ShiftItem}
                      isSelected={isSelected}
                      selectedDate={selectedDate}
                      onPress={() =>
                        handleShiftPress(shift as unknown as ShiftItem)
                      }
                      onDetailsPress={() => {
                        setSelectedShiftId(isSelected ? null : shift.id);
                      }}
                    >
                      {isSelected && timeSlots && (
                        <ShiftDetailsView timeSlots={timeSlots} />
                      )}
                    </ShiftListItem>
                  </View>
                );
              })
            ) : (
              <View style={[styles.noShiftContainer, { width: "100%" }]}>
                <Text style={styles.noShiftText}>
                  この月のシフトはありません
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
      <ShiftModal
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        handleReportShift={handleReportShift}
        handleEditShift={handleEditShift}
      />
      <ShiftReportModal
        reportModalVisible={reportModalVisible}
        setReportModalVisible={setReportModalVisible}
        comments={comments}
        setComments={setComments}
        modalShift={modalShift}
        fetchShifts={fetchShifts}
      />
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
      </Modal>

      {/* シフト確定確認モーダル */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <TouchableOpacity
          style={styles.confirmModalOverlay}
          activeOpacity={1}
          onPress={() => setShowConfirmModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.confirmModalContent}
          >
            <Text style={styles.confirmModalTitle}>
              シフト確定{" "}
            </Text>

            <Text style={styles.confirmModalDescription}>
              現在提出しているシフトで一旦確定でよろしいですか？
            </Text>

            <View style={styles.confirmModalButtonRow}>
              <TouchableOpacity
                style={styles.confirmModalCancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.confirmModalCancelText}>
                  キャンセル
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmModalConfirmButton}
                onPress={handleConfirmComplete}
              >
                <Text style={styles.confirmModalConfirmText}>
                  決定{" "}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
