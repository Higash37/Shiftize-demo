import React, { useState, useMemo, useCallback } from "react";
import { View, ScrollView, Text, TouchableOpacity, Dimensions } from "react-native";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { getStatusColor } from "../../calendar/calendar-utils/calendar.utils";
import { Ionicons } from "@expo/vector-icons";
import { ShiftCalendar } from "../../calendar/calendar-components/calendar-main/ShiftCalendar";
import { groupNonOverlappingShifts } from "./utils";

interface TabletCompactViewProps {
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string; hourlyWage?: number }>;
  selectedDate: Date;
  onShiftPress?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  onEmptyCellClick?: (date: string, time: string, userId: string) => void;
  onAddShift?: () => void;
  colorMode: "status" | "user";
  styles: any;
}

export const TabletCompactView: React.FC<TabletCompactViewProps> = ({
  shifts,
  users,
  selectedDate,
  onShiftPress,
  onMonthChange,
  onEmptyCellClick,
  onAddShift,
  colorMode,
  styles,
}) => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    format(selectedDate, "yyyy-MM-dd")
  );
  const [hideEarlyHours, setHideEarlyHours] = useState(false);

  // 画面サイズを取得
  const screenWidth = Dimensions.get("window").width;

  // 月の週を計算
  const weeksInMonth = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const weeks = [];
    let currentWeek = [];
    let currentDate = new Date(firstDay);
    
    // 月の最初の週を埋める
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    while (currentDate <= lastDay) {
      currentWeek.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // 最後の週を埋める
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [selectedDate]);

  // 現在の週の日付
  const currentWeekDates = weeksInMonth[selectedWeek] || [];

  // マークされた日付を生成
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    // 選択中の日付のスタイル
    if (selectedCalendarDate) {
      marks[selectedCalendarDate] = {
        selected: true,
        selectedColor: "#2196f3" + "20",
        selectedTextColor: "#333",
      };
    }
    
    // 日付ごとにシフトをグループ化
    const shiftsByDate: Record<string, any[]> = {};
    shifts.forEach((shift) => {
      if (shift.status !== "deleted" && shift.status !== "purged") {
        const date = shift.date;
        if (!shiftsByDate[date]) {
          shiftsByDate[date] = [];
        }
        shiftsByDate[date].push(shift);
      }
    });

    // 各日付にマークを設定（複数シフトの場合は複数ドットで表示）
    Object.entries(shiftsByDate).forEach(([date, dayShifts]) => {
      const existingMark = marks[date] || {};
      
      // 各シフトの色を配列で保持
      const shiftDots = dayShifts.map((shift, index) => ({
        key: `${shift.id}-${index}`,
        color: getStatusColor(shift.status),
        selectedDotColor: getStatusColor(shift.status),
      }));

      marks[date] = {
        ...existingMark,
        dots: shiftDots,
        selected: selectedCalendarDate === date,
        selectedColor: "#2196f3" + "20",
        selectedTextColor: "#333",
      };
    });

    return marks;
  }, [shifts, selectedCalendarDate]);

  // 変換されたシフト
  const convertedShifts = useMemo(() => {
    return shifts.map(shift => ({
      ...shift,
      duration: typeof shift.duration === 'string' ? parseFloat(shift.duration) : shift.duration
    }));
  }, [shifts]);

  // 時間のラベル（9:00〜22:00 または 13:00〜22:00）
  const timeLabels = useMemo(() => {
    const labels = [];
    const startHour = hideEarlyHours ? 13 : 9;
    for (let hour = startHour; hour <= 22; hour++) {
      labels.push(`${hour}:00`);
    }
    return labels;
  }, [hideEarlyHours]);

  // 日付とユーザーIDからシフトを検索
  const getShiftsForDateAndUser = (date: Date | null, userId: string) => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return shifts.filter(shift => 
      shift.date === dateStr && 
      shift.userId === userId &&
      shift.status !== "deleted" && 
      shift.status !== "purged"
    );
  };

  // その日のシフトを取得してグループ化（通常のガントチャートと同じロジック）
  const getShiftGroupsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    
    // その日のシフトを取得
    const dayShifts = shifts.filter(shift => 
      shift.date === dateStr &&
      shift.status !== "deleted" && 
      shift.status !== "purged"
    );
    
    if (dayShifts.length === 0) return [];
    
    // 通常のガントチャートと同じグループ化ロジックを使用
    return groupNonOverlappingShifts(dayShifts);
  };

  // シフトの色を取得
  const getShiftColor = useCallback((shift: ShiftItem) => {
    if (colorMode === "user") {
      const user = users.find(u => u.uid === shift.userId);
      return user?.color || "#90caf9";
    }
    return getStatusColor(shift.status);
  }, [colorMode, users]);

  // 前月・翌月ハンドラー
  const handlePrevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
    setSelectedWeek(0);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
    setSelectedWeek(0);
  };

  // カレンダーの日付選択ハンドラー
  const handleDayPress = (day: any) => {
    const targetDate = day.dateString;
    
    // 同じ日付をもう一度押したときに選択を解除
    if (selectedCalendarDate === targetDate) {
      setSelectedCalendarDate("");
      return;
    }
    
    setSelectedCalendarDate(targetDate);
  };

  // カレンダーの月変更ハンドラー
  const handleCalendarMonthChange = (month: any) => {
    const date = new Date(month.dateString);
    if (onMonthChange) {
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 左右分割レイアウト */}
      <View style={{ flexDirection: "row", flex: 1, height: "100%" }}>
        {/* 左側：カレンダー */}
        <View style={{ 
          flex: 1, 
          backgroundColor: "#fff", 
          paddingRight: 2,
          borderRightWidth: 1,
          borderRightColor: "#e0e0e0"
        }}>
          <View style={{ height: 380, overflow: "hidden" }}>
            <View style={{ transform: [{ scale: 0.7 }], height: 400, marginTop: -40 }}>
              <ShiftCalendar
                shifts={convertedShifts as any}
                selectedDate={selectedCalendarDate}
                currentMonth={format(selectedDate, "yyyy-MM-dd")}
                currentUserStoreId={""}
                onDayPress={handleDayPress}
                onMonthChange={handleCalendarMonthChange}
                markedDates={markedDates}
              />
            </View>
          </View>
        </View>

        {/* 右側：週間ガントチャート */}
        <View style={{ 
          flex: 1, 
          backgroundColor: "#fff", 
          paddingLeft: 2
        }}>
          {/* ヘッダー：週選択 */}
          <View style={{ 
            backgroundColor: "#f5f5f5", 
            borderBottomWidth: 1, 
            borderBottomColor: "#e0e0e0",
            paddingVertical: 10,
          }}>
            {/* 週選択タブ */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ paddingHorizontal: 16 }}
            >
              <View style={{ flexDirection: "row", gap: 8 }}>
                {weeksInMonth.map((week, index) => {
                  const firstDate = week.find(d => d !== null);
                  const lastDate = [...week].reverse().find(d => d !== null);
                  
                  if (!firstDate || !lastDate) return null;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        backgroundColor: selectedWeek === index ? "#2196f3" : "#e0e0e0",
                        borderRadius: 20,
                      }}
                      onPress={() => setSelectedWeek(index)}
                    >
                      <Text style={{
                        color: selectedWeek === index ? "#fff" : "#333",
                        fontWeight: selectedWeek === index ? "bold" : "normal",
                        fontSize: 14,
                      }}>
                        第{index + 1}週 ({format(firstDate, "d")}日〜{format(lastDate, "d")}日)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {/* 時間範囲切り替えボタン */}
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: hideEarlyHours ? "#ff9800" : "#e0e0e0",
                    borderRadius: 20,
                    marginLeft: 8,
                  }}
                  onPress={() => setHideEarlyHours(!hideEarlyHours)}
                >
                  <Text style={{
                    color: hideEarlyHours ? "#fff" : "#333",
                    fontWeight: hideEarlyHours ? "bold" : "normal",
                    fontSize: 12,
                  }}>
                    {hideEarlyHours ? "13:00-22:00" : "9:00-12:30省略"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* 週間ビュー */}
          <ScrollView style={{ flex: 1 }}>
            <View style={{ flexDirection: "row" }}>
              {/* 時間軸 */}
              <View style={{ width: 50 }}>
                <View style={{ height: 60 }} />
                {timeLabels.map(time => (
                  <View key={time} style={{ height: 40, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 10, color: "#666", fontWeight: "bold" }}>{time}</Text>
                  </View>
                ))}
              </View>

              {/* 週間スケジュール */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row" }}>
                  {currentWeekDates.map((date, dayIndex) => {
                    const shiftGroups = getShiftGroupsForDate(date);
                    const dateStr = date ? format(date, "yyyy-MM-dd") : "";
                    
                    return (
                      <View key={dayIndex} style={{ flexDirection: "row" }}>
                        {/* 日付ヘッダー（各日の最初の列のみ） */}
                        <View style={{ width: Math.max(90, (screenWidth / 2 - 50) * 0.25) }}>
                          <View style={{ 
                            height: 60, 
                            borderRightWidth: 1, 
                            borderRightColor: "#e0e0e0",
                            borderBottomWidth: 1,
                            borderBottomColor: "#e0e0e0",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: date ? "#f9f9f9" : "#f0f0f0",
                          }}>
                            {date ? (
                              <>
                                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
                                  {format(date, "d")}
                                </Text>
                                <Text style={{ fontSize: 12, color: "#666" }}>
                                  {format(date, "E", { locale: ja })}
                                </Text>
                              </>
                            ) : (
                              <Text style={{ fontSize: 12, color: "#999" }}>-</Text>
                            )}
                          </View>

                          {/* 時間スロット（空のセル） */}
                          <View style={{ position: "relative" }}>
                            {timeLabels.map((time, timeIndex) => (
                              <TouchableOpacity
                                key={time}
                                style={{
                                  height: 40,
                                  borderRightWidth: 1,
                                  borderRightColor: "#f0f0f0",
                                  borderBottomWidth: 1,
                                  borderBottomColor: timeIndex % 2 === 0 ? "#f0f0f0" : "#f5f5f5",
                                  zIndex: 1, // シフトバーより下に配置
                                }}
                                onPress={() => date && onEmptyCellClick?.(dateStr, time, "")}
                                disabled={!date}
                              />
                            ))}
                          </View>
                        </View>

                        {/* シフトグループ列（通常のガントチャートと同じ左詰めロジック） */}
                        {shiftGroups.map((group, groupIndex) => (
                          <View key={groupIndex} style={{ width: Math.max(90, (screenWidth / 2 - 50) * 0.25) }}>
                            {/* 列ヘッダー（グループの要約表示） */}
                            <View style={{ 
                              height: 60, 
                              borderRightWidth: 1, 
                              borderRightColor: "#e0e0e0",
                              borderBottomWidth: 1,
                              borderBottomColor: "#e0e0e0",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "#f9f9f9",
                              paddingHorizontal: 2,
                            }}>
                              <Text style={{ 
                                fontSize: 13, 
                                fontWeight: "bold", 
                                color: "#333",
                                textAlign: "center"
                              }}>
                                {group.length === 1 
                                  ? users.find(u => u.uid === group[0].userId)?.nickname || ""
                                  : `${group.length}シフト`
                                }
                              </Text>
                            </View>

                            {/* 時間スロット */}
                            <View style={{ position: "relative" }}>
                              {timeLabels.map((time, timeIndex) => (
                                <TouchableOpacity
                                  key={time}
                                  style={{
                                    height: 40,
                                    borderRightWidth: 1,
                                    borderRightColor: "#f0f0f0",
                                    borderBottomWidth: 1,
                                    borderBottomColor: timeIndex % 2 === 0 ? "#f0f0f0" : "#f5f5f5",
                                    zIndex: 1, // シフトバーより下に配置
                                  }}
                                  onPress={() => date && onEmptyCellClick?.(dateStr, time, "")}
                                  disabled={!date}
                                />
                              ))}

                              {/* シフトバー（同じ列の複数シフトを時間軸に配置） */}
                              {group.map((shift, shiftIndexInGroup) => {
                                const [startHour, startMin] = shift.startTime.split(':').map(Number);
                                const [endHour, endMin] = shift.endTime.split(':').map(Number);
                                const baseHour = hideEarlyHours ? 13 : 9;
                                const top = ((startHour - baseHour) * 60 + startMin) * (40 / 60);
                                const height = ((endHour - startHour) * 60 + (endMin - startMin)) * (40 / 60);
                                const user = users.find(u => u.uid === shift.userId);
                                
                                // 同じグループ内での重複チェック（念のため）
                                const hasOverlapInGroup = group.some((otherShift, otherIndex) => {
                                  if (otherIndex === shiftIndexInGroup) return false;
                                  const otherStart = otherShift.startTime;
                                  const otherEnd = otherShift.endTime;
                                  return shift.startTime < otherEnd && otherStart < shift.endTime;
                                });
                                
                                // 重複がある場合は水平方向にオフセット
                                const horizontalOffset = hasOverlapInGroup ? shiftIndexInGroup * 2 : 0;
                                const barWidth = hasOverlapInGroup ? -4 : -4; // 少し細くして重複を視覚化
                                
                                return (
                                  <TouchableOpacity
                                    key={shift.id}
                                    style={{
                                      position: "absolute",
                                      top,
                                      left: 2 + horizontalOffset,
                                      right: 2 + barWidth + horizontalOffset,
                                      height,
                                      backgroundColor: getShiftColor(shift),
                                      borderRadius: 4,
                                      padding: 2,
                                      justifyContent: "center",
                                      alignItems: "center",
                                      elevation: 1,
                                      zIndex: 10 + shiftIndexInGroup, // 空白セルより上に配置
                                    }}
                                    onPress={() => onShiftPress?.(shift)}
                                  >
                                    <Text style={{ 
                                      fontSize: 11, 
                                      fontWeight: "bold",
                                      color: "#000",
                                      textAlign: "center",
                                    }} numberOfLines={1}>
                                      {user?.nickname}
                                    </Text>
                                    <Text style={{ 
                                      fontSize: 10, 
                                      color: "#000",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                    }} numberOfLines={1}>
                                      {shift.startTime}
                                    </Text>
                                    <Text style={{ 
                                      fontSize: 10, 
                                      color: "#000",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                    }} numberOfLines={1}>
                                      {shift.endTime}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* シフト追加ボタン */}
      {onAddShift && (
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            backgroundColor: "#2196f3",
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: "center",
            alignItems: "center",
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            zIndex: 1000,
          }}
          onPress={onAddShift}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};