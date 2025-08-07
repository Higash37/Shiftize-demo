import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { styles } from "./CalendarModal.styles";
import { CalendarModalProps } from "./CalendarModal.types";
import { colors } from "@/common/common-theme/ThemeColors";
import { DAY_WIDTH } from "./CalendarModal.styles";

/**
 * CalendarModal - カレンダーモーダルコンポーネント
 *
 * 日付選択のためのモーダルUIを提供します。
 * 複数日付の選択に対応し、選択された日付はハイライト表示されます。
 */
const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDates = [],
}) => {
  const [selectedDates, setSelectedDates] =
    React.useState<string[]>(initialDates);

  const markedDates = React.useMemo(() => {
    const marked: { [key: string]: any } = {};
    selectedDates.forEach((date) => {
      marked[date] = {
        selected: true,
        selectedColor: colors.primary,
      };
    });
    return marked;
  }, [selectedDates]);

  const handleDayPress = (day: any) => {
    setSelectedDates((prev) => {
      const dateExists = prev.includes(day.dateString);
      if (dateExists) {
        return prev.filter((date) => date !== day.dateString);
      } else {
        return [...prev, day.dateString];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedDates);
    onClose();
  };

  const renderHeader = (date: Date) => {
    const month = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    return (
      <View style={styles.calendarHeader}>
        <Text style={styles.monthText}>{month}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>日付を選択</Text>
            <Text style={styles.subtitle}>{selectedDates.length}日選択中</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            enableSwipeMonths
            style={styles.calendar}
            renderHeader={renderHeader}
            theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.background,
              textSectionTitleColor: colors.text.secondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.text.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.text.primary,
              textDisabledColor: colors.text.disabled,
              dotColor: colors.primary,
              selectedDotColor: colors.text.white,
              arrowColor: colors.text.primary,
              monthTextColor: colors.text.primary,
              textMonthFontSize: 16,
              textDayFontSize: 14,
              textDayHeaderFontSize: 12,
              "stylesheet.calendar.header": {
                header: {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
                monthText: {
                  fontSize: 16,
                  fontWeight: "bold",
                },
                arrow: {
                  padding: 8,
                },
              },
              "stylesheet.calendar.main": {
                week: {
                  marginTop: 0,
                  marginBottom: 0,
                  flexDirection: "row",
                  justifyContent: "space-around",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              },
              "stylesheet.day.basic": {
                base: {
                  width: DAY_WIDTH,
                  height: DAY_WIDTH,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                },
                dot: {
                  width: 2,
                  height: 2,
                  marginTop: 2,
                  borderRadius: 1.5,
                },
                selected: {
                  backgroundColor: colors.primary,
                  borderRadius: DAY_WIDTH / 2,
                },
                today: {
                  borderColor: colors.primary,
                  borderWidth: 1,
                  borderRadius: DAY_WIDTH / 2,
                },
              },
            }}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>設定する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CalendarModal;
