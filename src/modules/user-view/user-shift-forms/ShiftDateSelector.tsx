/**
 * @file ShiftDateSelector.tsx
 * @description 単一日付選択カレンダー。react-native-calendars で1日だけ選択できる。
 *
 * 【このファイルの位置づけ】
 *   user-view > user-shift-forms 配下のフォームパーツ。
 *   シフト作成・編集フォームの日付選択に使われる。
 *
 * 主要Props:
 *   - selectedDate: 現在選択中の日付 ("YYYY-MM-DD")
 *   - onSelect: 日付選択コールバック
 */
import React, { useMemo } from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { colors } from "@/common/common-theme/ThemeColors";
import { createShiftDateSelectorStyles, createCalendarTheme } from "./ShiftDateSelector.styles";
import { ShiftDateSelectorProps } from "./ShiftDateSelector.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

/**
 * ShiftDateSelector - シフト日付選択用カレンダーコンポーネント
 *
 * 単一の日付を選択するためのカレンダーを提供します。
 * 選択された日付は視覚的に強調表示されます。
 */
const ShiftDateSelector: React.FC<ShiftDateSelectorProps> = ({
  selectedDate,
  onSelect,
}) => {
  const theme = useMD3Theme();
  const styles = useThemedStyles(createShiftDateSelectorStyles);
  const calendarTheme = useMemo(() => createCalendarTheme(theme), [theme]);

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={(day: { dateString: string }) => onSelect(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: colors.primary,
          },
        }}
        theme={calendarTheme}
      />
    </View>
  );
};

export default ShiftDateSelector;
