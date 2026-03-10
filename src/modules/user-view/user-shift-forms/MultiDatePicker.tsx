/**
 * @file MultiDatePicker.tsx
 * @description 複数日付選択カレンダー。react-native-calendars を使い、
 *   タップした日付を選択/解除できる。
 *
 * 【このファイルの位置づけ】
 *   user-view > user-shift-forms 配下のフォームパーツ。
 *   MasterShiftCreate のシフト日付選択で使われる。
 *
 * 主な内部ロジック:
 *   - toggleDate(): タップした日付を selectedDates に追加/削除
 *   - markedDates: 選択中の日付にマーカーを付けて Calendar に渡す
 *
 * 主要Props:
 *   - selectedDates: 選択済み日付の配列 ("YYYY-MM-DD")
 *   - onDatesChange: 日付変更コールバック
 *   - setSelectedDates?: 外部の state setter
 */
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Calendar } from "react-native-calendars";
import { createMultiDatePickerStyles, createCalendarTheme } from "./MultiDatePicker.styles";
import { MultiDatePickerProps } from "./types";
import type { DateData } from "react-native-calendars";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

/**
 * MultiDatePicker - 複数日付選択カレンダーコンポーネント
 *
 * 複数の日付を選択できるカレンダーを提供します。
 * 選択された日付は視覚的にマークされます。
 */
const MultiDatePicker: React.FC<MultiDatePickerProps> = ({
  selectedDates,
  onDatesChange,
  setSelectedDates,
}) => {
  const theme = useMD3Theme();
  const styles = useThemedStyles(createMultiDatePickerStyles);
  const calendarTheme = useMemo(() => createCalendarTheme(theme), [theme]);

  // 日付の選択/選択解除を切り替える
  const toggleDate = (dateString: string) => {
    if (selectedDates.includes(dateString)) {
      const newDates = selectedDates.filter((d) => d !== dateString);
      onDatesChange(newDates);
      setSelectedDates?.(newDates);
    } else {
      const newDates = [...selectedDates, dateString];
      onDatesChange(newDates);
      setSelectedDates?.(newDates);
    }
  };

  // 選択された日付のマーク情報を作成
  const marked: Record<string, any> = {};
  selectedDates.forEach((date) => {
    marked[date] = {
      selected: true,
      marked: true,
      selectedColor: "#4A90E2",
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📅 指導予定日を選択（複数可）</Text>
      <Calendar
        onDayPress={(day: DateData) => toggleDate(day.dateString)}
        markedDates={marked}
        theme={calendarTheme}
        style={styles.calendar}
      />
    </View>
  );
};

export default MultiDatePicker;
