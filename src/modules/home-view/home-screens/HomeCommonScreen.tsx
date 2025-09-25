// 共通ホーム画面（リファクタリング後）
// 旧: app/(main)/HomeCommonScreen.tsx
// スタイル分割済み（home-view-styles.ts）
// 型定義分割済み（home-view-types.ts）
import React, { useState } from "react";
import { View, Modal } from "react-native";
import { styles } from "../home-styles/home-view-styles";
import { format } from "date-fns";
import ja from "date-fns/locale/ja";
import { DatePickerModal } from "@/modules/reusable-widgets/calendar/modals/DatePickerModal";
import { HomeGanttWideScreen } from "./HomeGanttWideScreen";
import { HomeGanttMobileScreen } from "./HomeGanttMobileScreen";
import { HomeGanttTabletScreen } from "./HomeGanttTabletScreen";
import { GanttHalfSwitch } from "../home-components/home-gantt/GanttHalfSwitch"; // 追加
import { UserDayGanttModal } from "../home-components/home-gantt/UserDayGanttModal";
import { useHomeGanttState } from "../home-components/home-hooks/useHomeGanttState";
import { DateNavBar } from "../home-components/home-nav/DateNavBar";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";

export default function HomeCommonScreen() {
  const gantt = useHomeGanttState();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  // リアルタイムリスナーによりローディング状態は不要
  // データは即座に反映され、UXが向上

  return (
    <View style={[styles.container, { flex: 1 }]}>
      {/* <Text style={styles.title}>作業スケジュール（講師・マスター共通）</Text> */}
      <DateNavBar
        isMobile={!gantt.isWide}
        showFirst={gantt.showFirst}
        onToggleHalf={() => gantt.setShowFirst((v: boolean) => !v)}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        dateLabel={format(gantt.selectedDate, "yyyy年M月d日", { locale: ja })}
        onOpenDatePicker={openDatePicker}
        onPressSettings={() => setShowPasswordModal(true)} // パスワード変更
      />
      {!!gantt.isWide && (
        <GanttHalfSwitch
          showFirst={gantt.showFirst}
          onChange={gantt.setShowFirst}
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
      {gantt.isTablet ? (
        <HomeGanttTabletScreen
          namesFirst={gantt.filteredNamesFirst}
          namesSecond={gantt.filteredNamesSecond}
          timesFirst={gantt.timesFirst}
          timesSecond={gantt.timesSecond}
          sampleSchedule={approvedAndCompletedSchedule}
          CELL_WIDTH={gantt.CELL_WIDTH}
          showFirst={gantt.showFirst}
          onCellPress={gantt.setModalUser}
        />
      ) : gantt.isWide ? (
        <HomeGanttWideScreen
          namesFirst={gantt.filteredNamesFirst}
          namesSecond={gantt.filteredNamesSecond}
          timesFirst={gantt.timesFirst}
          timesSecond={gantt.timesSecond}
          sampleSchedule={approvedAndCompletedSchedule}
          CELL_WIDTH={gantt.CELL_WIDTH}
          showFirst={gantt.showFirst}
          onCellPress={gantt.setModalUser}
        />
      ) : (
        <HomeGanttMobileScreen
          namesFirst={gantt.filteredNamesFirst}
          namesSecond={gantt.filteredNamesSecond}
          timesFirst={gantt.timesFirst}
          timesSecond={gantt.timesSecond}
          sampleSchedule={approvedAndCompletedSchedule}
          CELL_WIDTH={gantt.CELL_WIDTH}
          showFirst={gantt.showFirst}
          onCellPress={gantt.setModalUser}
        />
      )}
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
    </View>
  );
}
