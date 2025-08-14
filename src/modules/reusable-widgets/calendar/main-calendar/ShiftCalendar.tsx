import React, { useMemo, useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import { View, useWindowDimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { DayComponentProps } from "../calendar-types/common.types";
import { DayComponent } from "../day-view/DayComponent";
import { CalendarHeader } from "../CalendarHeader";
import { DatePickerModal } from "../modals/DatePickerModal";
import {
  useResponsiveCalendarSize,
  PLATFORM_SPECIFIC,
} from "../constants";
import { styles } from "./ShiftCalendar.styles";
import { ShiftCalendarProps, CalendarHeaderInfo } from "./ShiftCalendar.types";

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
  const { calendarWidth, isSmallScreen } = useResponsiveCalendarSize();
  const { width: windowWidth } = useWindowDimensions();

  // currentMonthが変わったらtempDateも更新
  useEffect(() => {
    setTempDate(new Date(currentMonth));
  }, [currentMonth]);

  // レスポンシブなスタイルを生成
  const responsiveStyles = useMemo(
    () => ({
      calendar: {
        width: "96%", // リストと幅を統一（96%に統一）
        maxWidth: 480,
        marginHorizontal: "auto", // 中央揃え
        ...(responsiveSize?.container || {}),
      },
    }),
    [calendarWidth, isSmallScreen, responsiveSize]
  );

  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, []);

  // カレンダーのマーカー用のデータを作成
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 選択中の日付のスタイル
    if (selectedDate) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: colors.primary + "20",
        selectedTextColor: colors.text.primary,
      };
    }

    // 予定がある日付にドットマーカーを追加
    shifts.forEach((shift) => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(0, 0, 0, 0);
      const isPastShift = shiftDate < today;

      // 他店舗のシフトかどうかを判定
      const isFromOtherStore =
        currentUserStoreId &&
        shift.storeId &&
        shift.storeId !== currentUserStoreId;
      const dotColor = isFromOtherStore ? "#8B5CF6" : colors.primary; // 他店舗は紫、自店舗は青

      const existingMark = marks[shift.date] || {};
      marks[shift.date] = {
        ...existingMark,
        marked: true,
        dotColor: dotColor,
        dotStyle: {
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: isPastShift ? dotColor : "transparent",
          borderWidth: isPastShift ? 0 : 1,
          borderColor: dotColor,
        },
        selected: selectedDate === shift.date,
        selectedColor: colors.primary + "20",
      };
    });

    return marks;
  }, [selectedDate, shifts, currentUserStoreId]);

  // propMarkedDatesが提供されている場合はそれを使用、そうでなければ内部のmarkedDatesを使用
  const finalMarkedDates = propMarkedDates || markedDates;
  
  if (propMarkedDates) {
    const sampleKey = Object.keys(propMarkedDates)[0];
    const sampleData = propMarkedDates[sampleKey];
    if (sampleData.dots) {
    }
  } else {
  }

  const handleDateSelect = (date: Date) => {
    setTempDate(date);
    if (onMonthChange) {
      onMonthChange({ dateString: date.toISOString().split("T")[0] });
    }
  };

  return (
    <View
      style={[styles.container, isSmallScreen && styles.containerFullWidth]}
    >
      <Calendar
        current={currentMonth}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={finalMarkedDates}
        markingType={'multi-dot'} // multi-dot機能を有効化
        enableSwipeMonths={true}
        style={[
          styles.calendar,
          styles.calendarShadow,
          responsiveStyles.calendar,
        ]}
        renderHeader={(date: CalendarHeaderInfo) => (
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
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
          "stylesheet.calendar.header": {
            dayHeader: {
              color: colors.text.secondary,
              fontFamily:
                "SF Pro Text, San Francisco, Helvetica Neue, Arial, sans-serif",
              fontWeight: "600",
              fontSize: 14,
              // iOSカレンダー風：曜日ごとに色分け
              // Sunday: 赤, Saturday: 青, Weekday: グレー
              // これは DayComponent 側で曜日判定して色を渡すのが理想だが、
              // react-native-calendars の仕様上ここで全体色指定→DayComponentで個別色上書き
            },
          },
          "stylesheet.calendar.main": {
            week: {
              marginTop: 0,
              marginBottom: 0,
              flexDirection: "row",
              justifyContent: "space-around",
              borderWidth: 0,
              borderLeftWidth: 0,
              borderRightWidth: 0,
              borderColor: "transparent",
            },
            dayContainer: {
              borderWidth: 0,
              borderLeftWidth: 1, // 縦線のみ
              borderRightWidth: 0,
              borderBottomWidth: 0, // 横線は消す
              borderColor: "#E5E5E5",
              borderRadius: 0, // 角丸も消す
              overflow: "visible",
            },
          },
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
