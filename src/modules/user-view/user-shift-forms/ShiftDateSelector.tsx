import React from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { colors } from "@/common/common-theme/ThemeColors";
import { styles, calendarTheme } from "./ShiftDateSelector.styles";
import { ShiftDateSelectorProps } from "./ShiftDateSelector.types";

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
