/**
 * @file HomeCommonScreen.tsx
 * @description ホーム画面の共通ラッパー。画面幅に応じて Wide / Tablet / Mobile の
 *   レイアウトを自動で切り替える。
 *
 * 【このファイルの位置づけ】
 *   home-view > home-screens 配下の画面コンポーネント。
 *   アプリの「ホーム」タブで最初に描画されるルートコンポーネント。
 *   内部で HomeGanttWideScreen / HomeGanttTabletScreen / HomeGanttMobileScreen を
 *   ブレークポイントに応じて出し分ける。
 *
 * 主な内部ロジック:
 *   - useBreakpoint() で画面幅を判定
 *   - Wide(PC): 3カラムレイアウト
 *   - Tablet: 2カラムレイアウト
 *   - Mobile: 1カラム + モーダルで切り替え
 */
// 共通ホーム画面（リファクタリング後）
// 旧: app/(main)/HomeCommonScreen.tsx
// スタイル分割済み（home-view-styles.ts）
// 型定義分割済み（home-view-types.ts）
import React, { useState, useMemo } from "react";
import { View, Modal, StyleSheet, useWindowDimensions } from "react-native";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { createHomeViewStyles } from "../home-styles/home-view-styles";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { DatePickerModal } from "@/modules/reusable-widgets/calendar/modals/DatePickerModal";
import { HomeGanttWideScreen } from "./HomeGanttWideScreen";
import { HomeGanttMobileScreen } from "./HomeGanttMobileScreen";
import { HomeGanttTabletScreen } from "./HomeGanttTabletScreen";
import { UserDayGanttModal } from "../home-components/home-gantt/UserDayGanttModal";
import { useHomeGanttState } from "../home-components/home-hooks/useHomeGanttState";
import { DateNavBar } from "../home-components/home-nav/DateNavBar";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";
import { NextShiftWidget } from "../home-components/home-widgets/NextShiftWidget";
import { TodayStaffWidget } from "../home-components/home-widgets/TodayStaffWidget";
import { NextShiftDetailModal } from "../home-components/home-widgets/NextShiftDetailModal";
import { useAuth } from "@/services/auth/useAuth";

export default function HomeCommonScreen() {
  const styles = useThemedStyles(createHomeViewStyles);
  const gantt = useHomeGanttState();
  const { user } = useAuth();
  const { height } = useWindowDimensions();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNextShiftModal, setShowNextShiftModal] = useState(false);
  const [showShiftListModal, setShowShiftListModal] = useState(false);

  const openDatePicker = () => gantt.setShowDatePicker(true);
  const handlePrevDay = () =>
    gantt.setSelectedDate((d: Date) => {
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      return prev;
    });
  const handleNextDay = () =>
    gantt.setSelectedDate((d: Date) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    });

  // scheduleForSelectedDateをフィルタリングして承認済みのシフトのみを表示
  const approvedAndCompletedSchedule = gantt.scheduleForSelectedDate.filter(
    (shift) => shift.status === "approved" || shift.status === "completed"
  );

  // ユーザーの次のシフトを取得
  const nextShift = useMemo(() => {
    if (!user?.uid) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userFutureShifts = gantt.shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        shiftDate.setHours(0, 0, 0, 0);
        return (
          shift.userId === user.uid &&
          (shift.status === "approved" || shift.status === "pending") &&
          shiftDate >= today
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return userFutureShifts[0] || null;
  }, [gantt.shifts, user?.uid]);

  // ユーザーの今後のシフト一覧（モーダル用）
  const userFutureShifts = useMemo(() => {
    if (!user?.uid) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return gantt.shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        shiftDate.setHours(0, 0, 0, 0);
        return (
          shift.userId === user.uid &&
          (shift.status === "approved" || shift.status === "pending") &&
          shiftDate >= today
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10); // 最大10件
  }, [gantt.shifts, user?.uid]);

  // カレンダーとウィジェットを6:4の固定比率で表示（flex使用）
  // カレンダー部分の最大高さを計算（ヘッダー・フッターを除いた60%）
  const calendarMaxHeight = useMemo(() => {
    const navBarHeight = 50;
    const footerHeight = 80;
    const availableHeight = height - navBarHeight - footerHeight;
    return availableHeight * 0.6; // 60%
  }, [height]);

  // レイアウト分岐を独立したステートメントに抽出
  const renderGanttScreen = useMemo(() => {
    if (gantt.isWide) {
      return (
        <HomeGanttWideScreen
          namesFirst={[]}
          namesSecond={[]}
          timesFirst={[]}
          timesSecond={[]}
          sampleSchedule={approvedAndCompletedSchedule}
          CELL_WIDTH={gantt.CELL_WIDTH}
          showFirst={false}
          onCellPress={gantt.setModalUser}
          selectedDate={gantt.selectedDate}
          onDateSelect={gantt.setSelectedDate}
          allTimes={gantt.allTimes}
          shifts={gantt.shifts}
          shiftsForDate={gantt.shiftsForDate}
          currentYearMonth={gantt.currentYearMonth}
          currentUserStoreId={gantt.currentUserStoreId}
        />
      );
    }

    if (gantt.isTablet) {
      return (
        <HomeGanttTabletScreen
          namesFirst={[]}
          namesSecond={[]}
          timesFirst={gantt.allTimes.slice(
            0,
            Math.ceil(gantt.allTimes.length / 2)
          )}
          timesSecond={gantt.allTimes.slice(
            Math.ceil(gantt.allTimes.length / 2) - 1
          )}
          sampleSchedule={approvedAndCompletedSchedule}
          CELL_WIDTH={gantt.CELL_WIDTH}
          showFirst={false}
          onCellPress={gantt.setModalUser}
          selectedDate={gantt.selectedDate}
          onDateSelect={gantt.setSelectedDate}
          allTimes={gantt.allTimes}
          shifts={gantt.shifts}
          shiftsForDate={gantt.shiftsForDate}
          currentYearMonth={gantt.currentYearMonth}
          currentUserStoreId={gantt.currentUserStoreId}
        />
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {/* カレンダー部分（60%） */}
        <View style={{ flex: 6 }}>
          <HomeGanttMobileScreen
            namesFirst={[]}
            namesSecond={[]}
            timesFirst={gantt.allTimes.slice(
              0,
              Math.ceil(gantt.allTimes.length / 2)
            )}
            timesSecond={gantt.allTimes.slice(
              Math.ceil(gantt.allTimes.length / 2) - 1
            )}
            sampleSchedule={approvedAndCompletedSchedule}
            CELL_WIDTH={gantt.CELL_WIDTH}
            showFirst={false}
            onCellPress={gantt.setModalUser}
            selectedDate={gantt.selectedDate}
            onDateSelect={gantt.setSelectedDate}
            shiftsForDate={gantt.shiftsForDate}
            maxHeight={calendarMaxHeight}
            showShiftListModal={showShiftListModal}
            onToggleShiftListModal={setShowShiftListModal}
          />
        </View>

        {/* モバイル版のみ：左右ウィジェット（40%） */}
        <View style={{ flex: 4 }}>
          <View style={widgetStyles.widgetContainer}>
            <NextShiftWidget
              nextShift={nextShift}
              onPress={() => setShowNextShiftModal(true)}
            />
            <TodayStaffWidget
              todayShifts={gantt.shiftsForDate}
              onPress={() => setShowShiftListModal(true)}
            />
          </View>
        </View>
      </View>
    );
  }, [
    gantt.isWide,
    gantt.isTablet,
    gantt.allTimes,
    gantt.CELL_WIDTH,
    gantt.setModalUser,
    gantt.selectedDate,
    gantt.setSelectedDate,
    gantt.shifts,
    gantt.shiftsForDate,
    gantt.currentYearMonth,
    gantt.currentUserStoreId,
    approvedAndCompletedSchedule,
    calendarMaxHeight,
    showShiftListModal,
    setShowShiftListModal,
    nextShift,
  ]);

  // リアルタイムリスナーによりローディング状態は不要
  // データは即座に反映され、UXが向上

  return (
    <View style={[styles.container, { flex: 1 }]}>
      {/* PC版以外のみDateNavBarを表示 */}
      {!gantt.isWide && (
        <DateNavBar
          isMobile={!gantt.isWide}
          showFirst={false}
          onToggleHalf={() => {}}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          dateLabel={format(gantt.selectedDate, "yyyy年M月d日(E)", { locale: ja })}
          onOpenDatePicker={openDatePicker}
          onPressSettings={() => setShowPasswordModal(true)}
        />
      )}

      <DatePickerModal
        isVisible={gantt.showDatePicker}
        initialDate={gantt.selectedDate}
        onClose={() => gantt.setShowDatePicker(false)}
        onSelect={(date) => {
          gantt.setSelectedDate(date);
          gantt.setShowDatePicker(false);
        }}
      />

      {/* レイアウト分岐 */}
      {renderGanttScreen}

      {/* ユーザー1日ガントチャートモーダル */}
      <UserDayGanttModal
        visible={!!gantt.modalUser}
        onClose={() => gantt.setModalUser(null)}
        userName={gantt.modalUser || ""}
        sampleSchedule={gantt.scheduleForSelectedDate}
      />

      {/* パスワード変更モーダル */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
      </Modal>

      {/* 次のシフト詳細モーダル */}
      <NextShiftDetailModal
        visible={showNextShiftModal}
        onClose={() => setShowNextShiftModal(false)}
        shifts={userFutureShifts}
      />
    </View>
  );
}

const widgetStyles = StyleSheet.create({
  widgetContainer: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 8,
    gap: 12,
  },
});
