/** @file GanttMiniCalendar.tsx
 *  @description ガントチャート内に埋め込む小型カレンダーウィジェット。
 *    シフトがある日にドットマーカーを表示し、日付タップで日付選択をコールバックする。
 */

// 【このファイルの位置づけ】
// - importされる先: GanttChartMonthView 等（インラインカレンダーとして使用）
// - 役割: 小さなスペースに収まるミニカレンダー。月ナビ付き。

import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { colors } from "@/common/common-constants/ThemeConstants";
import type { MarkedDates } from "react-native-calendars/src/types";

interface GanttMiniCalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange?: (year: number, month: number) => void;
  width: number;
  shifts?: ShiftItem[];
  currentUserStoreId?: string;
}

export const GanttMiniCalendar: React.FC<GanttMiniCalendarProps> = ({
  currentDate,
  onDateSelect,
  onMonthChange,
  width,
  shifts = [],
  currentUserStoreId = "",
}) => {
  const [viewingMonth, setViewingMonth] = useState(startOfMonth(currentDate));

  const handlePrevMonth = () => {
    const prevMonth = subMonths(viewingMonth, 1);
    setViewingMonth(prevMonth);
    onMonthChange?.(prevMonth.getFullYear(), prevMonth.getMonth());
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(viewingMonth, 1);
    setViewingMonth(nextMonth);
    onMonthChange?.(nextMonth.getFullYear(), nextMonth.getMonth());
  };

  const handleDatePress = (date: Date) => {
    onDateSelect(date);
  };

  // カレンダーの日付を生成（最初の日曜日から最後の土曜日まで）
  const monthStart = startOfMonth(viewingMonth);
  const monthEnd = endOfMonth(viewingMonth);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - getDay(monthStart)); // 最初の日曜日
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - getDay(monthEnd))); // 最後の土曜日

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // 週ごとにグループ化
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const cellSize = (width - 4) / 7; // 7日分、パディング考慮

  // ShiftCalendarと同じマーク処理
  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 選択中の日付のスタイル
    const currentDateString = format(currentDate, 'yyyy-MM-dd');
    marks[currentDateString] = {
      selected: true,
      selectedColor: "#2196f3",
      selectedTextColor: "#fff",
    };

    // 予定がある日付にドットマーカーを追加
    shifts.forEach((shift) => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(0, 0, 0, 0);
      // 他店舗のシフトかどうかを判定
      const isFromOtherStore =
        currentUserStoreId &&
        shift.storeId &&
        shift.storeId !== currentUserStoreId;
      const dotColor = isFromOtherStore ? "#8B5CF6" : "#2196f3"; // 他店舗は紫、自店舗は青

      const existingMark = marks[shift.date] || {};
      marks[shift.date] = {
        ...existingMark,
        marked: true,
        dotColor: dotColor,
        selected: currentDateString === shift.date,
        selectedColor: "#2196f3",
        selectedTextColor: "#fff",
      };
    });

    return marks;
  }, [shifts, currentDate, currentUserStoreId]);

  return (
    <View style={[styles.container, { width }]}>
      {/* 月選択ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={8} color="#666" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(viewingMonth, "MM月", { locale: ja })}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={8} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 曜日ヘッダー */}
      <View style={styles.weekHeader}>
        {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
          <View key={day} style={[styles.weekDayCell, { width: cellSize }]}>
            <Text style={[
              styles.weekDay,
              index === 0 && styles.sunday,
              index === 6 && styles.saturday,
            ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* カレンダーグリッド */}
      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((date) => {
              const dateString = format(date, 'yyyy-MM-dd');
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, currentDate);
              const isCurrentMonth = date.getMonth() === viewingMonth.getMonth();
              const dayOfWeek = date.getDay();
              const dateMarks = markedDates[dateString] || {};
              const hasShift = dateMarks.marked;

              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[
                    styles.dayButton,
                    { width: cellSize, height: cellSize },
                    isToday && styles.today,
                    isSelected && styles.selected,
                  ]}
                  onPress={() => handleDatePress(date)}
                >
                  <View style={styles.dayContent}>
                    <Text
                      style={[
                        styles.dayText,
                        !isCurrentMonth && styles.otherMonth,
                        dayOfWeek === 0 && styles.sundayText,
                        dayOfWeek === 6 && styles.saturdayText,
                        isToday && styles.todayText,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {format(date, "d")}
                    </Text>
                    {hasShift && (
                      <View 
                        style={[
                          styles.shiftDot, 
                          { backgroundColor: dateMarks.dotColor || "#2196f3" }
                        ]} 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 2,
    padding: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
    paddingHorizontal: 1,
  },
  navButton: {
    padding: 1,
    borderRadius: 2,
  },
  monthTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#333",
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 1,
  },
  weekDayCell: {
    alignItems: "center",
  },
  weekDay: {
    fontSize: 6,
    fontWeight: "600",
    color: "#666",
  },
  sunday: {
    color: "#ff6b6b",
  },
  saturday: {
    color: "#4dabf7",
  },
  calendarContainer: {
    maxHeight: 140, // スクロール可能な高さ制限
  },
  weekRow: {
    flexDirection: "row",
  },
  dayButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 1,
    marginVertical: 0.5,
  },
  dayContent: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  today: {
    backgroundColor: colors.selected,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 8, // 6から8に拡大
    color: colors.text.primary,
    fontWeight: "500",
  },
  shiftDot: {
    position: "absolute",
    bottom: -2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  otherMonth: {
    color: "#ccc",
  },
  sundayText: {
    color: "#ff6b6b",
  },
  saturdayText: {
    color: "#4dabf7",
  },
  todayText: {
    fontWeight: "bold",
    color: colors.primary,
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
});