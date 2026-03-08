import React, { useMemo, useState, useEffect } from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
import type { MarkedDates } from "react-native-calendars/src/types";
import { View, ViewStyle } from "react-native";
import { format } from "date-fns";
import { colors } from "@/common/common-theme/ThemeColors";
import { DayComponentProps } from "../calendar-types/common.types";
import { DayComponent } from "../day-view/DayComponent";

LocaleConfig.locales.ja = {
  monthNames: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  monthNamesShort: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  dayNames: [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
  ],
  dayNamesShort: ["日", "月", "火", "水", "木", "金", "土"],
  today: "今日",
};

LocaleConfig.defaultLocale = "ja";

import { CalendarHeader } from "../CalendarHeader";
import { DatePickerModal } from "../modals/DatePickerModal";
import { useResponsiveCalendarSize } from "../constants";
import { createShiftCalendarStyles } from "./ShiftCalendar.styles";
import { ShiftCalendarProps } from "./ShiftCalendar.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  shifts,
  selectedDate,
  currentMonth,
  currentUserStoreId,
  onDayPress,
  onMonthChange,
  markedDates: propMarkedDates,
  onMount,
  responsiveSize,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date(currentMonth));
  const { isSmallScreen } = useResponsiveCalendarSize();
  const styles = useThemedStyles(createShiftCalendarStyles);
  const scale = responsiveSize?.scale ?? 1;

  // currentMonthが変わったらtempDateも更新
  useEffect(() => {
    setTempDate(new Date(currentMonth));
  }, [currentMonth]);

  // レスポンシブなスタイルを生成
  const responsiveStyles = useMemo(() => {
    const calendarStyle: ViewStyle = {
      width: "96%",
      maxWidth: 480,
      alignSelf: "center",
    };

    if (scale !== 1) {
      calendarStyle.transform = [{ scale }];
    }

    const containerStyle: ViewStyle = {
      ...(responsiveSize?.container || {}),
    };

    return { calendar: calendarStyle, container: containerStyle };
  }, [responsiveSize, scale]);

  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, []);

  // カレンダーのマーカー用のデータを作成
  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 選択中の日付のスタイル
    if (selectedDate) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: colors.primary + "20",
        selectedTextColor: colors.text.primary,
      };
      // 選択日の翌日に borderLeft を消すフラグを付与
      const nextDay = new Date(selectedDate + "T00:00:00");
      nextDay.setDate(nextDay.getDate() + 1);
      const nd = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, "0")}-${String(nextDay.getDate()).padStart(2, "0")}`;
      marks[nd] = { ...(marks[nd] || {}), afterSelected: true } as any;
    }

    // 予定がある日付にドットマーカーを追加（全てのステータス）
    // ステータスごとに色を分ける
    const getStatusDotColor = (status: string) => {
      switch (status) {
        case "pending":
          return "#FFB800"; // オレンジ（承認待ち）
        case "approved":
          return "#0EA5E9"; // 青（承認済み）
        case "completed":
          return "#10B981"; // 緑（完了）
        case "draft":
          return "#9CA3AF"; // グレー（下書き）
        case "rejected":
          return "#EF4444"; // 赤（却下）
        case "deletion_requested":
          return "#F59E0B"; // 黄色（削除申請中）
        default:
          return "#10B981"; // デフォルトは緑
      }
    };

    shifts
      .filter((shift) => shift.status !== "deleted" && shift.status !== "purged")
      .forEach((shift) => {
        const existingMark = marks[shift.date] || {};
        const existingDots = existingMark.dots || [];
        const dotColor = getStatusDotColor(shift.status || "approved");

        // 人数分のドットを追加（重複チェックなし）
        marks[shift.date] = {
          ...existingMark,
          dots: [...existingDots, { color: dotColor }],
          selected: selectedDate === shift.date,
          selectedColor: colors.primary + "20",
        };
      });

    return marks;
  }, [selectedDate, shifts, currentUserStoreId]);

  // propMarkedDatesが提供されている場合はそれを使用、そうでなければ内部のmarkedDatesを使用
  const finalMarkedDates: MarkedDates =
    (propMarkedDates as MarkedDates | undefined) || markedDates;

  if (propMarkedDates) {
    const sampleKey = Object.keys(propMarkedDates)[0];
    if (sampleKey) {
      const sampleData = propMarkedDates[sampleKey];
      if (sampleData?.dots) {
      }
    }
  } else {
  }

  const handleDateSelect = (date: Date) => {
    setTempDate(date);
    if (onMonthChange) {
      onMonthChange({ dateString: format(date, "yyyy-MM-dd") });
    }
  };

  return (
    <View
      style={[
        styles.container,
        isSmallScreen && styles.containerFullWidth,
        responsiveStyles.container,
      ]}
    >
      <Calendar
        current={currentMonth}
        onDayPress={onDayPress}
        {...(onMonthChange && { onMonthChange })}
        markedDates={finalMarkedDates}
        markingType={"multi-dot"} // multi-dot機能を有効化
        enableSwipeMonths={true}
        style={[
          styles.calendar,
          styles.calendarShadow,
          responsiveStyles.calendar,
        ]}
        renderHeader={() => (
          <CalendarHeader
            date={new Date(currentMonth)} // ←常にcurrentMonthを反映
            onYearMonthSelect={() => {
              // 現在のカレンダーの月を正確に反映させる
              const currentCalendarDate = new Date(currentMonth);
              setTempDate(currentCalendarDate);
              setShowDatePicker(true);
            }}
            responsiveStyle={responsiveSize?.header}
          />
        )}
        theme={{
          backgroundColor: "transparent",
          calendarBackground: "transparent",
          textSectionTitleColor: colors.text.secondary,
          dayTextColor: colors.text.primary,
          textDisabledColor: colors.text.secondary,
          selectedDayBackgroundColor: colors.primary + "20",
          selectedDayTextColor: colors.primary,
          todayTextColor: colors.primary,
          dotColor: colors.primary,
          selectedDotColor: colors.primary,
          monthTextColor: colors.text.primary,
          // iOSカレンダー風：曜日ラベル色分け
          textDayFontFamily:
            "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
          textMonthFontFamily:
            "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
          textDayHeaderFontFamily:
            "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
          textDayFontWeight: "500",
          textMonthFontWeight: "600",
          textDayHeaderFontWeight: "600",
          textDayFontSize: 28,
          textMonthFontSize: 30,
          textDayHeaderFontSize: 20,
        }}
        dayComponent={({ date, state, marking }: DayComponentProps) => (
          <DayComponent
            date={date}
            state={state}
            marking={marking}
            onPress={(dateString) => onDayPress({ dateString })}
            responsiveSize={responsiveSize?.day}
          />
        )}
      />

      {/* カレンダー下のその日情報表示を削除 */}
      {/* {selectedDate && (
        <ShiftList shifts={shifts} selectedDate={selectedDate} />
      )} */}

      <DatePickerModal
        isVisible={showDatePicker}
        initialDate={tempDate}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
      />
    </View>
  );
};
