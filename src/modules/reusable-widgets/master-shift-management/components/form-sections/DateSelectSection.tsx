import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { styles } from "../../MasterShiftCreate.styles";

interface DateSelectSectionProps {
  selectedDates: string[];
  onCalendarOpen: () => void;
  onDateRemove: (date: string) => void;
}

export const DateSelectSection: React.FC<DateSelectSectionProps> = ({
  selectedDates,
  onCalendarOpen,
  onDateRemove,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>日付選択</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={onCalendarOpen}
      >
        <Text style={styles.dateText}>
          {selectedDates.length > 0
            ? `${selectedDates.length}日選択中`
            : "日付を選択"}
        </Text>
      </TouchableOpacity>
      {selectedDates.length > 0 && (
        <View style={styles.selectedDatesContainer}>
          {selectedDates.sort().map((date) => (
            <View key={date} style={styles.selectedDateCard}>
              <Text style={styles.selectedDateText}>{`${format(
                new Date(date),
                "yyyy年M月d日(E)",
                {
                  locale: ja,
                }
              )}`}</Text>
              <TouchableOpacity
                style={styles.removeDateButton}
                onPress={() => onDateRemove(date)}
              >
                <Text style={styles.removeDateText}>削除</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};