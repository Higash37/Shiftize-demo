import React, { useState, useMemo, useCallback } from "react";
import { View, ScrollView, Text, TouchableOpacity, Dimensions } from "react-native";
import { ShiftCalendar } from "../../calendar/main-calendar/ShiftCalendar";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ja } from "date-fns/locale";
import { getStatusColor } from "../../calendar/calendar-utils/calendar.utils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface GoogleCalendarViewProps {
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

export const GoogleCalendarView: React.FC<GoogleCalendarViewProps> = ({
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
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedDay, setSelectedDay] = useState(selectedDate);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const sidebarWidth = sidebarCollapsed ? 0 : Math.min(300, screenWidth * 0.25);
  const mainViewWidth = screenWidth - sidebarWidth;

  // ShiftItemからShiftへの変換
  const convertedShifts = useMemo(() => {
    return shifts.map(shift => ({
      ...shift,
      duration: typeof shift.duration === 'string' ? parseFloat(shift.duration) : shift.duration
    }));
  }, [shifts]);

  // マークされた日付を生成
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    
    // 選択中の日付のスタイル
    const selectedDateStr = format(selectedDay, "yyyy-MM-dd");
    marks[selectedDateStr] = {
      selected: true,
      selectedColor: "#1a73e8",
      selectedTextColor: "#ffffff",
    };
    
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

    // 各日付にマークを設定
    Object.entries(shiftsByDate).forEach(([date, dayShifts]) => {
      const existingMark = marks[date] || {};
      
      // シフトドットを表示
      const shiftDots = dayShifts.slice(0, 3).map((shift, index) => ({
        key: `${shift.id}-${index}`,
        color: getStatusColor(shift.status),
        selectedDotColor: getStatusColor(shift.status),
      }));

      marks[date] = {
        ...existingMark,
        dots: shiftDots,
        selected: selectedDateStr === date,
        selectedColor: "#1a73e8",
        selectedTextColor: "#ffffff",
      };
    });

    return marks;
  }, [shifts, selectedDay]);

  // 時間のラベル（全日 + 9:00〜22:00）
  const timeLabels = useMemo(() => {
    const labels = ["終日"];
    for (let hour = 9; hour <= 22; hour++) {
      labels.push(`${hour}:00`);
    }
    return labels;
  }, []);

  // 表示する日付を計算
  const displayDates = useMemo(() => {
    if (viewMode === "day") {
      return [selectedDay];
    } else if (viewMode === "week") {
      const startDate = startOfWeek(selectedDay, { weekStartsOn: 0 }); // 日曜開始
      return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    } else {
      // 月表示の場合は週表示と同じ
      const startDate = startOfWeek(selectedDay, { weekStartsOn: 0 });
      return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    }
  }, [selectedDay, viewMode]);

  // 指定日付のシフトを取得
  const getShiftsForDate = useCallback((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return shifts.filter(shift => 
      shift.date === dateStr &&
      shift.status !== "deleted" && 
      shift.status !== "purged"
    );
  }, [shifts]);

  // シフトの色を取得
  const getShiftColor = useCallback((shift: ShiftItem) => {
    if (colorMode === "user") {
      const user = users.find(u => u.uid === shift.userId);
      return user?.color || "#1a73e8";
    }
    return getStatusColor(shift.status);
  }, [colorMode, users]);

  // ナビゲーションハンドラー
  const handlePrevious = () => {
    if (viewMode === "day") {
      setSelectedDay(subDays(selectedDay, 1));
    } else if (viewMode === "week") {
      setSelectedDay(subWeeks(selectedDay, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "day") {
      setSelectedDay(addDays(selectedDay, 1));
    } else if (viewMode === "week") {
      setSelectedDay(addWeeks(selectedDay, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDay(today);
    if (onMonthChange) {
      onMonthChange(today.getFullYear(), today.getMonth());
    }
  };

  const handleDayPress = (day: any) => {
    const newDate = new Date(day.dateString);
    setSelectedDay(newDate);
  };

  const handleMonthChangeCalendar = (month: any) => {
    const date = new Date(month.dateString);
    if (onMonthChange) {
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Google風ヘッダー */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e8eaed",
      }}>
        {/* 左側：メニューとタイトル */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <TouchableOpacity 
            onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ marginRight: 16 }}
          >
            <MaterialIcons name="menu" size={24} color="#5f6368" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 22, color: "#3c4043", fontWeight: "400" }}>
            カレンダー
          </Text>
        </View>

        {/* 中央：ナビゲーション */}
        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16 }}>
          <TouchableOpacity onPress={handlePrevious} style={{ padding: 8 }}>
            <MaterialIcons name="chevron-left" size={24} color="#5f6368" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleToday} style={{ 
            paddingHorizontal: 12, 
            paddingVertical: 6,
            marginHorizontal: 8,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#dadce0",
          }}>
            <Text style={{ color: "#3c4043", fontSize: 14 }}>今日</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleNext} style={{ padding: 8 }}>
            <MaterialIcons name="chevron-right" size={24} color="#5f6368" />
          </TouchableOpacity>
        </View>

        {/* 右側：年月とビュー切替 */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 22, color: "#3c4043", marginRight: 16 }}>
            {format(selectedDay, "yyyy年M月", { locale: ja })}
          </Text>
          
          <View style={{ flexDirection: "row", backgroundColor: "#f1f3f4", borderRadius: 4 }}>
            {["day", "week", "month"].map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setViewMode(mode as any)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: viewMode === mode ? "#ffffff" : "transparent",
                  borderRadius: 4,
                }}
              >
                <Text style={{ 
                  color: viewMode === mode ? "#1a73e8" : "#5f6368",
                  fontSize: 13,
                  fontWeight: viewMode === mode ? "500" : "400",
                }}>
                  {mode === "day" ? "日" : mode === "week" ? "週" : "月"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* 左サイドバー */}
        {!sidebarCollapsed && (
          <View style={{ 
            width: sidebarWidth, 
            backgroundColor: "#ffffff",
            borderRightWidth: 1,
            borderRightColor: "#e8eaed",
          }}>
            {/* 小さい月カレンダー */}
            <View style={{ padding: 16 }}>
              <ShiftCalendar
                shifts={convertedShifts as any}
                selectedDate={format(selectedDay, "yyyy-MM-dd")}
                currentMonth={format(selectedDate, "yyyy-MM-dd")}
                currentUserStoreId={""}
                onDayPress={handleDayPress}
                onMonthChange={handleMonthChangeCalendar}
                markedDates={markedDates}
              />
            </View>

            {/* フィルターエリア */}
            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#e8eaed" }}>
              <Text style={{ fontSize: 16, fontWeight: "500", color: "#3c4043", marginBottom: 12 }}>
                表示設定
              </Text>
              
              {/* カラーモード切替 */}
              <TouchableOpacity 
                style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  paddingVertical: 8,
                }}
              >
                <MaterialIcons 
                  name={colorMode === "status" ? "radio-button-checked" : "radio-button-unchecked"} 
                  size={20} 
                  color="#1a73e8" 
                />
                <Text style={{ marginLeft: 8, color: "#3c4043" }}>ステータス別</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  paddingVertical: 8,
                }}
              >
                <MaterialIcons 
                  name={colorMode === "user" ? "radio-button-checked" : "radio-button-unchecked"} 
                  size={20} 
                  color="#1a73e8" 
                />
                <Text style={{ marginLeft: 8, color: "#3c4043" }}>ユーザー別</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 右メインビュー */}
        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
          {/* 日付ヘッダー */}
          <View style={{ 
            flexDirection: "row", 
            backgroundColor: "#f8f9fa",
            borderBottomWidth: 1,
            borderBottomColor: "#e8eaed",
          }}>
            <View style={{ width: 60 }} />
            {displayDates.map((date, index) => (
              <View key={index} style={{ 
                flex: 1, 
                alignItems: "center", 
                paddingVertical: 12,
                borderRightWidth: index < displayDates.length - 1 ? 1 : 0,
                borderRightColor: "#e8eaed",
              }}>
                <Text style={{ fontSize: 11, color: "#5f6368", marginBottom: 2 }}>
                  {format(date, "E", { locale: ja })}
                </Text>
                <Text style={{ 
                  fontSize: 16, 
                  color: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "#1a73e8" : "#3c4043",
                  fontWeight: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "500" : "400",
                }}>
                  {format(date, "d")}
                </Text>
              </View>
            ))}
          </View>

          {/* タイムスロット */}
          <ScrollView style={{ flex: 1 }}>
            {timeLabels.map((time, timeIndex) => (
              <View key={time} style={{
                flexDirection: "row",
                minHeight: time === "終日" ? 50 : 60,
                borderBottomWidth: 1,
                borderBottomColor: "#f1f3f4",
              }}>
                {/* 時間ラベル */}
                <View style={{ 
                  width: 60, 
                  justifyContent: "flex-start",
                  alignItems: "center",
                  paddingTop: 8,
                  borderRightWidth: 1,
                  borderRightColor: "#e8eaed",
                }}>
                  <Text style={{ fontSize: 12, color: "#5f6368" }}>
                    {time}
                  </Text>
                </View>

                {/* 各日のシフト */}
                {displayDates.map((date, dateIndex) => {
                  const dateShifts = getShiftsForDate(date);
                  const timeShifts = time === "終日" 
                    ? [] // Remove isAllDay filter since property doesn't exist
                    : dateShifts.filter(shift => {
                        const [shiftStartHour] = shift.startTime.split(':').map(Number);
                        const [timeHour] = time.split(':').map(Number);
                        return shiftStartHour === timeHour;
                      });

                  return (
                    <TouchableOpacity
                      key={dateIndex}
                      style={{ 
                        flex: 1, 
                        minHeight: time === "終日" ? 50 : 60,
                        borderRightWidth: dateIndex < displayDates.length - 1 ? 1 : 0,
                        borderRightColor: "#f1f3f4",
                        position: "relative",
                        padding: 2,
                      }}
                      onPress={() => time !== "終日" && onEmptyCellClick?.(
                        format(date, "yyyy-MM-dd"), 
                        time, 
                        users[0]?.uid || ""
                      )}
                    >
                      {/* シフトブロック */}
                      {timeShifts.map((shift, shiftIndex) => {
                        const user = users.find(u => u.uid === shift.userId);
                        const shiftColor = getShiftColor(shift);
                        
                        return (
                          <TouchableOpacity
                            key={shift.id}
                            style={{
                              backgroundColor: shiftColor,
                              borderRadius: 4,
                              padding: 4,
                              marginBottom: 2,
                              opacity: 0.9,
                            }}
                            onPress={() => onShiftPress?.(shift)}
                          >
                            <Text style={{ 
                              fontSize: 12, 
                              fontWeight: "500",
                              color: "#ffffff",
                            }} numberOfLines={1}>
                              {user?.nickname || "Unknown"}
                            </Text>
                            {time !== "終日" && (
                              <Text style={{ 
                                fontSize: 10, 
                                color: "#ffffff",
                                opacity: 0.9,
                              }} numberOfLines={1}>
                                {shift.startTime}-{shift.endTime}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* 追加ボタン（Google風FAB） */}
      {onAddShift && (
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
            backgroundColor: "#1a73e8",
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={onAddShift}
        >
          <MaterialIcons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
};