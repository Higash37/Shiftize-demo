import React from "react";
import { View, Text } from "react-native";
import { Calendar } from "react-native-calendars";
import { styles, calendarTheme } from "./MultiDatePicker.styles";
import { MultiDatePickerProps } from "./types";
import type { DateData } from "react-native-calendars";

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
