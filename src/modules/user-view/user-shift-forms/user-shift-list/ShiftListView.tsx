/** @file ShiftListView.tsx
 *  @description ユーザーのシフト一覧画面。
 *    月別カレンダー + シフトリスト + シフト確定ボタンを表示する。
 *    シフトタップで報告/編集モーダルを開く。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React / React Native / expo-router / ServiceProvider /
 *          ShiftCalendar / ShiftListItem / ShiftDetailsView /
 *          ShiftModal / ShiftReportModal / ChangePassword /
 *          DateNavigator / useShift / useAuth / useMD3Theme / useBreakpoint
 *  - 利用先: ユーザー画面のシフト一覧ルート（/(main)/user/shifts）
 *
 *  【コンポーネント概要】
 *  - 表示内容: ヘッダー → 月ナビゲーション → カレンダー → シフトリスト
 *              + シフト確定ボタン + 各種モーダル
 *  - 主要Props: なし（内部でデータ取得を行う）
 */
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
import { compareByDateThenTime } from "@/common/common-utils/util-shift/wageCalculator";
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
import { DateNavigator, SUB_HEADER_HEIGHT } from "@/common/common-ui/ui-navigation/DateNavigator";
import type { ShiftSubmissionPeriod } from "@/services/interfaces/IShiftSubmissionService";
import ShiftModal from "../ListModal/ShiftModal";
import ShiftReportModal from "../ListModal/ShiftReportModal";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";
import type { ShiftItem } from "@/common/common-models/model-shift/shiftTypes";

export const UserShiftList = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  /** useShift フックからシフト一覧と取得関数を取得 */
  const { shifts, loading: shiftsLoading, fetchShifts } = useShift();

  // --- State ---
  /** カレンダーで選択中の日付（"yyyy-MM-dd" 形式、空文字 = 未選択） */
  const [selectedDate, setSelectedDate] = useState("");
  /** 現在表示中の月（"yyyy-MM" 形式）。初期値は今月 */
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM");
  });
  /** 表示用の月文字列（カレンダーマウント後にセットされる） */
  const [displayMonth, setDisplayMonth] = useState<string | null>(null);
  /** 詳細展開中のシフトID */
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  /** カレンダーがマウント済みかどうか */
  const [isCalendarMounted, setIsCalendarMounted] = useState(false);
  /** シフト操作モーダル（報告/変更選択）の表示フラグ */
  const [isModalVisible, setModalVisible] = useState(false);
  /** モーダル操作対象のシフト */
  const [modalShift, setModalShift] = useState<ShiftItem | null>(null);
  /** 現在のユーザーの店舗ID */
  const [currentUserStoreId, setCurrentUserStoreId] = useState<
    string | undefined
  >(user?.storeId);
  /** シフト報告モーダルの表示フラグ */
  const [reportModalVisible, setReportModalVisible] = useState(false);
  /** 報告時のコメント */
  const [comments, setComments] = useState("");
  /** シフトリストの ScrollView 参照（日付選択時の自動スクロールに使用） */
  const scrollViewRef = useRef<ScrollView | null>(null);
  /** 各シフトの Y 座標位置を記録する辞書（自動スクロール用） */
  const shiftPositionsRef = useRef<Record<string, number>>({});
  /** パスワード変更モーダルの表示フラグ */
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- Theme / Style ---
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  /** テーマとブレークポイントが変わった時だけスタイルを再生成 */
  const styles = useMemo(
    () => createShiftListViewStyles(theme, bp),
    [theme, bp]
  );

  // --- シフト確定ボタン用の状態 ---
  /** アクティブな提出期間 */
  const [period, setPeriod] = useState<ShiftSubmissionPeriod | null>(null);
  /** ユーザーがシフト確定済みかどうか */
  const [isCompleted, setIsCompleted] = useState(false);
  /** シフト確定確認モーダルの表示フラグ */
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- Effects ---
  /**
   * 画面がフォーカスされた時にシフトデータを再取得する。
   * 初回マウント時の fetch は useShift 内の useEffect で実行されるため不要。
   */
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

  /** アクティブな提出期間と確定状況をロードする */
  const loadActivePeriod = async () => {
    try {
      const periods = await ServiceProvider.shiftSubmissions.getActivePeriods(
        user?.storeId || ""
      );
      const currentPeriod = periods[0] ?? null;
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

  // --- Handlers ---
  /**
   * シフト確定ボタン押下時のハンドラ。
   * 確定済みなら取り消し確認、未確定なら確認モーダルを表示する。
   */
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

  /** シフト確定を実行する（確認モーダルで「決定」を押した時） */
  const handleConfirmComplete = async () => {
    try {
      const canConfirm = user?.uid && user?.storeId && period?.id;
      if (canConfirm) {
        await ServiceProvider.shiftConfirmations.confirmShift(
          user!.uid,
          user!.storeId!,
          period!.id
        );
        setIsCompleted(true);
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("エラー", "確定に失敗しました");
    }
  };

  // AuthContextのstoreIdを同期
  useEffect(() => {
    if (user?.storeId) {
      setCurrentUserStoreId(user.storeId);
    }
  }, [user?.storeId]);

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

  // --- 派生データ ---
  /**
   * 現在表示中の月に該当するシフトを抽出してソートする。
   * useMemo で shifts / displayMonth / user が変わった時だけ再計算する。
   */
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
      .sort(compareByDateThenTime);

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

  /**
   * カレンダーの日付タップ時のハンドラ。
   * 同じ日付を再タップすると選択解除。別の月の日付なら月を切り替える。
   */
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
  /** シフト編集画面に遷移する。classes は JSON 文字列でパラメータに渡す */
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

  /**
   * シフト行タップ時のハンドラ。
   * 承認済みなら操作選択モーダルを表示、それ以外は直接編集画面へ遷移する。
   */
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

  // --- Render 準備 ---
  /** タブレットの場合は中央に 80% 幅で表示、それ以外はフル幅 */
  const containerStyle = bp.isTablet
    ? styles.tabletContainer
    : styles.defaultContainer;

  /** サブヘッダーに表示する「yyyy年M月」ラベル */
  const subHeaderLabel = useMemo(() => {
    const d = new Date(currentMonth + "-01");
    const validDate = Number.isNaN(d.getTime()) ? new Date() : d;
    return `${validDate.getFullYear()}年${validDate.getMonth() + 1}月`;
  }, [currentMonth]);

  /** 前月に移動するハンドラ */
  const handlePrevMonth = useCallback(() => {
    const d = new Date(currentMonth + "-01");
    d.setMonth(d.getMonth() - 1);
    handleMonthChange({ dateString: format(d, "yyyy-MM-dd") });
  }, [currentMonth]);

  /** 次月に移動するハンドラ */
  const handleNextMonth = useCallback(() => {
    const d = new Date(currentMonth + "-01");
    d.setMonth(d.getMonth() + 1);
    handleMonthChange({ dateString: format(d, "yyyy-MM-dd") });
  }, [currentMonth]);

  // --- Render ---
  return (
    <>
      <Header
        title="シフト一覧"
        onPressSettings={() => setShowPasswordModal(true)}
      />
      <View style={containerStyle}>
        {/* サブヘッダー：年月ピッカー */}
        <View style={{
          height: SUB_HEADER_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colorScheme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colorScheme.outlineVariant,
        }}>
          <DateNavigator
            label={subHeaderLabel}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
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
            <View
              style={styles.listContainer}
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
            </View>
          )}
        </ScrollView>
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
