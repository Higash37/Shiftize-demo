import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { format } from "date-fns";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import ShiftDateSelector from "@/modules/user-view/user-shift-forms/ShiftDateSelector";
import { styles } from "./DatePickerModal.styles";
import {
  DatePickerModalProps,
  YearPickerProps,
  MonthPickerProps,
} from "./DatePickerModal.types";

/**
 * 年選択コンポーネント
 */
const YearPicker: React.FC<YearPickerProps> = ({
  tempDate,
  onYearSelect,
  onCancel,
}) => {
  // 年の配列を生成（現在の年から前後5年）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>年を選択</Text>
      <CustomScrollView style={styles.pickerContainer}>
        {years.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.pickerItem,
              year === tempDate.getFullYear() && styles.selectedItem,
            ]}
            onPress={() => onYearSelect(year)}
          >
            <Text
              style={[
                styles.pickerText,
                year === tempDate.getFullYear() && styles.selectedText,
              ]}
            >
              {year}年
            </Text>
          </TouchableOpacity>
        ))}
      </CustomScrollView>
      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
          <Text style={styles.modalButtonText}>キャンセル</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * 月選択コンポーネント
 */
const MonthPicker: React.FC<MonthPickerProps> = ({
  tempDate,
  onMonthSelect,
  onBack,
}) => {
  // 月の配列を生成（1月から12月まで）
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{tempDate.getFullYear()}年 月を選択</Text>
      <View style={styles.monthGrid}>
        {months.map((month) => (
          <TouchableOpacity
            key={month}
            style={[
              styles.monthItem,
              month === tempDate.getMonth() + 1 && styles.selectedItem,
            ]}
            onPress={() => onMonthSelect(month)}
          >
            <Text
              style={[
                styles.monthItemText,
                month === tempDate.getMonth() + 1 && styles.selectedText,
              ]}
            >
              {month}月
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.modalButton} onPress={onBack}>
          <Text style={styles.modalButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * 日付選択モーダル
 */
export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isVisible,
  initialDate,
  onClose,
  onSelect,
}) => {
  const [tempDate, setTempDate] = useState<Date>(initialDate);
  const [showYearPicker, setShowYearPicker] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTempDate(initialDate);
      setShowYearPicker(true);
      setShowMonthPicker(false);
      setShowDayPicker(false);
    }
  }, [initialDate, isVisible]);

  // 年選択ハンドラ
  const handleYearSelect = (year: number) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(year);
    setTempDate(newDate);
    setShowYearPicker(false);
    setShowMonthPicker(true);
  };

  // 月選択ハンドラ
  const handleMonthSelect = (month: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(month - 1);
    setTempDate(newDate);
    setShowMonthPicker(false);
    setShowDayPicker(true);
  };

  // 日選択ハンドラ
  const handleDaySelect = (dateString: string) => {
    const [y, m, d] = dateString.split("-").map(Number);
    const newDate = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
    setTempDate(newDate);
    onSelect(newDate);
    onClose();
  };

  // モーダルクローズハンドラ
  const handleClose = () => {
    onClose();
    setShowYearPicker(true);
    setShowMonthPicker(false);
    setShowDayPicker(false);
  };

  // カレンダーのcurrentをtempDateの年月に合わせる
  const calendarCurrent = `${tempDate.getFullYear()}-${String(
    tempDate.getMonth() + 1
  ).padStart(2, "0")}-01`;
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              {showYearPicker && (
                <YearPicker
                  tempDate={tempDate}
                  onYearSelect={handleYearSelect}
                  onCancel={handleClose}
                />
              )}
              {showMonthPicker && (
                <MonthPicker
                  tempDate={tempDate}
                  onMonthSelect={handleMonthSelect}
                  onBack={() => {
                    setShowMonthPicker(false);
                    setShowYearPicker(true);
                  }}
                />
              )}
              {showDayPicker && (
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {tempDate.getFullYear()}年{tempDate.getMonth() + 1}月
                    日を選択
                  </Text>
                  <ShiftDateSelector
                    selectedDate={format(tempDate, "yyyy-MM-dd")}
                    onSelect={handleDaySelect}
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        setShowDayPicker(false);
                        setShowMonthPicker(true);
                      }}
                    >
                      <Text style={styles.modalButtonText}>戻る</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>{" "}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
