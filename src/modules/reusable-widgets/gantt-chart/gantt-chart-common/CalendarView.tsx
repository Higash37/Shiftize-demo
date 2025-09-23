import React, { useState, useMemo, useRef } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ShiftCalendar } from "../../calendar/main-calendar/ShiftCalendar";
import { PayrollList } from "./PayrollList";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { colors } from "@/common/common-theme/ThemeColors";
import { getStatusColor, getStatusText } from "../../calendar/calendar-utils/calendar.utils";

interface CalendarViewProps {
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string; hourlyWage?: number }>;
  selectedDate: Date;
  onShiftPress?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  styles: any;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  shifts,
  users,
  selectedDate,
  onShiftPress,
  onMonthChange,
  styles,
}) => {

  // ShiftItemからShiftへの変換
  const convertedShifts = useMemo(() => {
    return shifts.map(shift => ({
      ...shift,
      duration: typeof shift.duration === 'string' ? parseFloat(shift.duration) : shift.duration
    }));
  }, [shifts]);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    format(selectedDate, "yyyy-MM-dd")
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const shiftRefs = useRef<{ [key: string]: any }>({}).current;

  // 現在の月の文字列を生成（月変更で更新されるように状態管理）
  const [currentMonth, setCurrentMonth] = useState(format(selectedDate, "yyyy-MM-dd"));

  // 親コンポーネントのselectedDateが変更されたときにcurrentMonthを同期
  React.useEffect(() => {
    const newCurrentMonth = format(selectedDate, "yyyy-MM-dd");
    setCurrentMonth(newCurrentMonth);
    setSelectedCalendarDate(newCurrentMonth);
  }, [selectedDate]);

  // マークされた日付を生成（ShiftCalendarと同じロジック使用）
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 選択中の日付のスタイル
    if (selectedCalendarDate) {
      marks[selectedCalendarDate] = {
        selected: true,
        selectedColor: "#2196f3" + "20",
        selectedTextColor: "#333",
      };
    }

    
    // 日付ごとにシフトをグループ化（選択されたユーザーでフィルタリング）
    const shiftsByDate: Record<string, any[]> = {};
    shifts.forEach((shift) => {
      if (shift.status !== "deleted" && shift.status !== "purged") {
        // 選択されたユーザーがいる場合はそのユーザーのシフトのみ表示
        if (selectedUserId && shift.userId !== selectedUserId) {
          return;
        }
        
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
      
      // 各シフトの色を配列で保持（react-native-calendars仕様に合わせて調整）
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
  }, [shifts, selectedCalendarDate, selectedUserId]);

  // 選択された日のシフトを取得
  const selectedDateShifts = useMemo(() => {
    return shifts.filter(
      (shift) =>
        shift.date === selectedCalendarDate &&
        shift.status !== "deleted" &&
        shift.status !== "purged"
    );
  }, [shifts, selectedCalendarDate]);

  // 選択された月の全シフトを取得（日付順にソート）
  const monthShifts = useMemo(() => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth() + 1;
    
    return shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        const shiftYear = shiftDate.getFullYear();
        const shiftMonth = shiftDate.getMonth() + 1;
        
        return (
          shiftYear === selectedYear &&
          shiftMonth === selectedMonth &&
          shift.status !== "deleted" &&
          shift.status !== "purged" &&
          (selectedUserId ? shift.userId === selectedUserId : true)
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [shifts, selectedDate, selectedUserId]);

  const handleDayPress = (day: any) => {
    const targetDate = day.dateString;
    
    // 同じ日付をもう一度押したときに選択を解除
    if (selectedCalendarDate === targetDate) {
      setSelectedCalendarDate("");
      return;
    }
    
    setSelectedCalendarDate(targetDate);
    
    // 選択された日付のシフトまでスクロール
    const selectedShift = monthShifts.find(
      (shift) => shift.date === targetDate
    );
    
    if (selectedShift && shiftRefs[selectedShift.id]) {
      // 少し遅延を入れてスクロールを実行（レイアウト計算のため）
      setTimeout(() => {
        shiftRefs[selectedShift.id]?.measureLayout(
          // @ts-ignore
          scrollViewRef.current?._nativeRef,
          (x: number, y: number) => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          },
          () => {}
        );
      }, 100);
    }
  };

  const handleMonthChange = (month: any) => {
    const date = new Date(month.dateString);
    setCurrentMonth(month.dateString); // カレンダーの表示月を更新
    if (onMonthChange) {
      // 月の最初の日に設定して親コンポーネントのselectedDateを更新
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 }}>
      <View style={{ flexDirection: "row", flex: 1, marginTop: 10 }}>
        {/* 左側：給与リスト部分 */}
        <View style={{ flex: 1, backgroundColor: "#fff", paddingRight: 5, borderRadius: 8 }}>
          <PayrollList
            shifts={shifts}
            users={users}
            selectedDate={selectedDate}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
          />
        </View>

        {/* 中央：カレンダー部分 */}
        <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 5 }}>
          <ShiftCalendar
            key={`calendar-${currentMonth}-${selectedUserId || 'all'}`} // 月変更時に強制再レンダリング
            shifts={convertedShifts as any}
            selectedDate={selectedCalendarDate}
            currentMonth={currentMonth}
            currentUserStoreId={""} // マスター用なので空文字
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
          />
        </View>

        {/* 右側：月のシフトリスト部分 */}
        <View style={{ flex: 1, backgroundColor: "#fff", paddingLeft: 5, borderRadius: 8 }}>
          <View style={{ padding: 10, flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#333" }}>
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月のシフト
              {selectedUserId && (
                <Text style={{ fontSize: 14, color: "#2196f3" }}>
                  {" "}({users.find(u => u.uid === selectedUserId)?.nickname}のみ)
                </Text>
              )}
            </Text>
            <ScrollView 
              ref={scrollViewRef}
              style={{ flex: 1, padding: 8, backgroundColor: "#fff" }}
              showsVerticalScrollIndicator={false}
            >
              {monthShifts.map((shift, index) => {
                const borderColor = getStatusColor(shift.status);
                return (
                  <TouchableOpacity
                    key={shift.id}
                    ref={(ref) => {
                      if (ref) {
                        shiftRefs[shift.id] = ref;
                      }
                    }}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 8,
                      backgroundColor: colors.surface,
                      borderRadius: 6,
                      marginBottom: 6,
                      marginHorizontal: 3,
                      borderWidth: 1,
                      borderColor: borderColor,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                    onPress={() => onShiftPress && onShiftPress(shift)}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 8,
                    }}>
                      <AntDesign name="user" size={16} color={borderColor} />
                      <Text style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: colors.text.primary,
                      }} numberOfLines={1}>
                        {format(new Date(shift.date), "d日(E)", { locale: ja })}
                      </Text>
                      <Text style={{
                        fontSize: 11,
                        fontWeight: "bold",
                        color: colors.text.primary,
                      }} numberOfLines={1}>
                        {shift.nickname}
                      </Text>
                      <Text style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        color: borderColor,
                      }} numberOfLines={1}>
                        {getStatusText(shift.status)}
                      </Text>
                      <Text style={{
                        fontSize: 11,
                        fontWeight: "bold",
                        color: colors.text.primary,
                        flexShrink: 1,
                      }} numberOfLines={1}>
                        {shift.startTime} ~ {shift.endTime}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {monthShifts.length === 0 && (
                <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
                  この月にシフトはありません
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
};