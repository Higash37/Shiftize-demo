import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { format, addMonths, subMonths, addDays, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { getStatusColor } from "../../calendar/calendar-utils/calendar.utils";
import { Ionicons } from "@expo/vector-icons";
import { ShiftCalendar } from "../../calendar/calendar-components/calendar-main/ShiftCalendar";

interface MobileVerticalViewProps {
  shifts: ShiftItem[];
  users: Array<{
    uid: string;
    nickname: string;
    color?: string;
    hourlyWage?: number;
  }>;
  selectedDate: Date;
  onShiftPress?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  onEmptyCellClick?: (date: string, time: string, userId: string) => void;
  colorMode: "status" | "user";
  styles: any;
}

export const MobileVerticalView: React.FC<MobileVerticalViewProps> = ({
  shifts,
  users,
  selectedDate,
  onShiftPress,
  onMonthChange,
  onEmptyCellClick,
  colorMode,
  styles,
}) => {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    format(selectedDate, "yyyy-MM-dd")
  );
  const [hideEarlyHours, setHideEarlyHours] = useState(false);

  // 画面サイズを取得
  const screenWidth = Dimensions.get("window").width;

  // 選択された日付の表示用文字列
  const displayDate =
    selectedCalendarDate || format(selectedDate, "yyyy-MM-dd");

  // 選択された日のシフトを取得
  const selectedDayShifts = useMemo(() => {
    const targetDate = displayDate;
    return shifts.filter(
      (shift) =>
        shift.date === targetDate &&
        shift.status !== "deleted" &&
        shift.status !== "purged"
    );
  }, [shifts, displayDate]);

  // その日にシフトがあるユーザーのみ取得
  const usersWithShifts = useMemo(() => {
    const userIdsWithShifts = new Set(
      selectedDayShifts.map((shift) => shift.userId)
    );
    return users.filter((user) => userIdsWithShifts.has(user.uid));
  }, [users, selectedDayShifts]);

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
    return shifts.map((shift) => ({
      ...shift,
      duration:
        typeof shift.duration === "string"
          ? parseFloat(shift.duration)
          : shift.duration,
    }));
  }, [shifts]);

  // 時間のラベル（9:00〜22:00、30分刻み または 13:00〜22:00、30分刻み）
  const timeLabels = useMemo(() => {
    const labels = [];
    const startHour = hideEarlyHours ? 13 : 9;
    for (let hour = startHour; hour <= 22; hour++) {
      labels.push(`${hour}:00`);
      if (hour < 22) {
        // 最後の時間は30分を追加しない
        labels.push(`${hour}:30`);
      }
    }
    return labels;
  }, [hideEarlyHours]);

  // 特定日のユーザーのシフトを検索
  const getShiftForUser = (userId: string) => {
    return selectedDayShifts.find((shift) => shift.userId === userId);
  };

  // シフトの色を取得
  const getShiftColor = useCallback(
    (shift: ShiftItem) => {
      if (colorMode === "user") {
        const user = users.find((u) => u.uid === shift.userId);
        return user?.color || "#90caf9";
      }
      return getStatusColor(shift.status);
    },
    [colorMode, users]
  );

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

  // 前日・翌日移動ハンドラー
  const handlePrevDay = () => {
    if (selectedCalendarDate) {
      const currentDate = new Date(selectedCalendarDate);
      const prevDate = subDays(currentDate, 1);
      const prevDateStr = format(prevDate, "yyyy-MM-dd");
      setSelectedCalendarDate(prevDateStr);
    }
  };

  const handleNextDay = () => {
    if (selectedCalendarDate) {
      const currentDate = new Date(selectedCalendarDate);
      const nextDate = addDays(currentDate, 1);
      const nextDateStr = format(nextDate, "yyyy-MM-dd");
      setSelectedCalendarDate(nextDateStr);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 左右分割レイアウト（モバイル用） */}
      <View style={{ flexDirection: "row", flex: 1, height: "100%" }}>
        {/* 左側：カレンダー */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            paddingRight: 2,
            borderRightWidth: 1,
            borderRightColor: "#e0e0e0",
          }}
        >
          <View style={{ height: 310, overflow: "hidden" }}>
            <View
              style={{
                transform: [{ scale: 0.6 }],
                height: 330,
                marginTop: -50,
              }}
            >
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

        {/* 右側：1日ガントチャート */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            paddingLeft: 2,
          }}
        >
          {/* ヘッダー：選択日表示 */}
          <View
            style={{
              backgroundColor: "#f5f5f5",
              borderBottomWidth: 1,
              borderBottomColor: "#e0e0e0",
              paddingVertical: 8,
              paddingHorizontal: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* 左側：日付ナビゲーション */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                justifyContent: "center",
                marginRight: -60,
              }}
            >
              <TouchableOpacity
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
                onPress={handlePrevDay}
              >
                <Text
                  style={{ fontSize: 16, color: "#2196f3", fontWeight: "bold" }}
                >
                  {"<"}
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#333",
                  marginHorizontal: 8,
                }}
              >
                {displayDate
                  ? format(new Date(displayDate), "M月d日(E)", { locale: ja })
                  : "日付を選択"}
              </Text>

              <TouchableOpacity
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
                onPress={handleNextDay}
              >
                <Text
                  style={{ fontSize: 16, color: "#2196f3", fontWeight: "bold" }}
                >
                  {">"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 右側：時間範囲切り替えボタン */}
            <TouchableOpacity
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: hideEarlyHours ? "#ff9800" : "#e0e0e0",
                borderRadius: 12,
              }}
              onPress={() => setHideEarlyHours(!hideEarlyHours)}
            >
              <Text
                style={{
                  color: hideEarlyHours ? "#fff" : "#333",
                  fontWeight: hideEarlyHours ? "bold" : "normal",
                  fontSize: 10,
                }}
              >
                {hideEarlyHours ? "13:00-22:00" : "9:00-12:30省略"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 1日ビュー（行：時間、列：人名） */}
          <ScrollView style={{ flex: 1 }}>
            <View style={{ flexDirection: "row" }}>
              {/* 時間軸 */}
              <View style={{ width: 30 }}>
                <View style={{ height: 30 }} />
                {timeLabels.map((time) => (
                  <View
                    key={time}
                    style={{
                      height: 20,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#666",
                        fontWeight: "bold",
                      }}
                    >
                      {time}
                    </Text>
                  </View>
                ))}
              </View>

              {/* ユーザー列 */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row" }}>
                  {usersWithShifts.length > 0 ? (
                    usersWithShifts
                      .sort((a, b) => {
                        const shiftA = getShiftForUser(a.uid);
                        const shiftB = getShiftForUser(b.uid);
                        if (!shiftA || !shiftB) return 0;
                        return shiftA.startTime.localeCompare(shiftB.startTime);
                      })
                      .map((user, userIndex) => {
                        const userShift = getShiftForUser(user.uid);

                        return (
                          <View
                            key={user.uid}
                            style={{
                              width: Math.max(
                                45,
                                (screenWidth / 2 - 30) * 0.25
                              ),
                            }}
                          >
                            {/* ユーザー名ヘッダー */}
                            <View
                              style={{
                                height: 30,
                                borderRightWidth: 1,
                                borderRightColor: "#e0e0e0",
                                borderBottomWidth: 1,
                                borderBottomColor: "#e0e0e0",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#f9f9f9",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: "bold",
                                  color: "#333",
                                  textAlign: "center",
                                }}
                                numberOfLines={1}
                              >
                                {user.nickname}
                              </Text>
                            </View>

                            {/* 時間スロット */}
                            <View style={{ position: "relative" }}>
                              {timeLabels.map((time, timeIndex) => (
                                <TouchableOpacity
                                  key={time}
                                  style={{
                                    height: 20,
                                    borderRightWidth: 1,
                                    borderRightColor: "#f0f0f0",
                                    borderBottomWidth: 1,
                                    borderBottomColor:
                                      timeIndex % 2 === 0
                                        ? "#f0f0f0"
                                        : "#f5f5f5",
                                    zIndex: 1, // シフトバーより下に配置
                                  }}
                                  onPress={() =>
                                    onEmptyCellClick?.(displayDate, time, "")
                                  }
                                />
                              ))}

                              {/* シフトバー */}
                              {userShift &&
                                (() => {
                                  const [startHour, startMin] =
                                    userShift.startTime.split(":").map(Number);
                                  const [endHour, endMin] = userShift.endTime
                                    .split(":")
                                    .map(Number);

                                  // 30分刻みでの位置計算
                                  const baseHour = hideEarlyHours ? 13 : 9;
                                  const startSlots =
                                    (startHour - baseHour) * 2 +
                                    (startMin >= 30 ? 1 : 0);
                                  const endSlots =
                                    (endHour - baseHour) * 2 +
                                    (endMin >= 30 ? 1 : 0);
                                  const top = startSlots * 20;
                                  const height = (endSlots - startSlots) * 20;

                                  return (
                                    <TouchableOpacity
                                      style={{
                                        position: "absolute",
                                        top,
                                        left: 1,
                                        right: 1,
                                        height,
                                        backgroundColor:
                                          getShiftColor(userShift),
                                        borderRadius: 2,
                                        padding: 1,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        elevation: 1,
                                        zIndex: 10, // 空白セルより上に配置
                                      }}
                                      onPress={() => onShiftPress?.(userShift)}
                                    >
                                      <Text
                                        style={{
                                          fontSize: 11,
                                          fontWeight: "bold",
                                          color: "#000",
                                          textAlign: "center",
                                        }}
                                        numberOfLines={1}
                                      >
                                        {user.nickname}
                                      </Text>
                                      <Text
                                        style={{
                                          fontSize: 10,
                                          fontWeight: "bold",
                                          color: "#000",
                                          textAlign: "center",
                                        }}
                                        numberOfLines={1}
                                      >
                                        {userShift.startTime}
                                      </Text>
                                      <Text
                                        style={{
                                          fontSize: 10,
                                          fontWeight: "bold",
                                          color: "#000",
                                          textAlign: "center",
                                        }}
                                        numberOfLines={1}
                                      >
                                        {userShift.endTime}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })()}
                            </View>
                          </View>
                        );
                      })
                  ) : (
                    // シフトがない場合の表示（タップで追加モーダル）
                    <TouchableOpacity
                      style={{
                        width: screenWidth / 2 - 30,
                        height: 100,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() =>
                        onEmptyCellClick?.(displayDate, "09:00", "")
                      }
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#999",
                          textAlign: "center",
                          marginBottom: 4,
                        }}
                      >
                        この日はシフトがありません
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          color: "#2196f3",
                          textAlign: "center",
                        }}
                      >
                        タップしてシフトを追加
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
