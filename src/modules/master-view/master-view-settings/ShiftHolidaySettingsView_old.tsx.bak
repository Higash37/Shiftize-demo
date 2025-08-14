import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { shiftHolidaySettingsViewStyles as styles } from "./ShiftHolidaySettingsView.styles";
import type { ShiftHolidaySettingsViewProps } from "./ShiftHolidaySettingsView.types";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export const ShiftHolidaySettingsView: React.FC<
  ShiftHolidaySettingsViewProps
> = ({ settings, loading, onChange, onSave }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState(new Date());
  const [isSpecialDay, setIsSpecialDay] = useState(false);

  const containerStyle = [
    styles.container,
    isTablet && styles.containerTablet,
    isDesktop && styles.containerDesktop,
  ];

  // 祝日を追加
  const addHoliday = () => {
    if (!newHolidayName.trim()) {
      Alert.alert("エラー", "祝日名を入力してください");
      return;
    }

    const dateString = newHolidayDate.toISOString().split("T")[0];
    const newHoliday = {
      id: Date.now().toString(),
      date: dateString,
      name: newHolidayName.trim(),
      type: isSpecialDay ? ("special" as const) : ("national" as const),
    };

    if (isSpecialDay) {
      const updatedSpecialDays = [
        ...settings.specialDays,
        { ...newHoliday, workingDay: false },
      ];
      onChange({
        ...settings,
        specialDays: updatedSpecialDays,
      });
    } else {
      const updatedHolidays = [...settings.holidays, newHoliday];
      onChange({
        ...settings,
        holidays: updatedHolidays,
      });
    }

    // フォームをリセット
    setNewHolidayName("");
    setNewHolidayDate(new Date());
    setIsSpecialDay(false);
    setShowAddModal(false);
  };

  // 祝日を削除
  const removeHoliday = (id: string, type: "holiday" | "special") => {
    if (type === "holiday") {
      const updatedHolidays = settings.holidays.filter((h) => h.id !== id);
      onChange({
        ...settings,
        holidays: updatedHolidays,
      });
    } else {
      const updatedSpecialDays = settings.specialDays.filter(
        (s) => s.id !== id
      );
      onChange({
        ...settings,
        specialDays: updatedSpecialDays,
      });
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  const allHolidays = [
    ...settings.holidays.map((h) => ({ ...h, type: "holiday" as const })),
    ...settings.specialDays.map((s) => ({ ...s, type: "special" as const })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <View style={containerStyle}>
      <Stack.Screen
        options={{ title: "祝日・特別日設定", headerShown: true }}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>祝日・特別日</Text>

          {/* 追加ボタン */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>祝日・特別日を追加</Text>
          </TouchableOpacity>

          {/* 祝日リスト */}
          <View style={styles.holidayList}>
            {allHolidays.length > 0 ? (
              allHolidays.map((item) => (
                <View key={item.id} style={styles.holidayItem}>
                  <View style={styles.holidayInfo}>
                    <Text style={styles.holidayDate}>
                      {formatDate(item.date)}
                    </Text>
                    <Text style={styles.holidayName}>
                      {item.name}{" "}
                      {item.type === "special" ? "(特別日)" : "(祝日)"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeHoliday(item.id, item.type)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#f44336" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                祝日・特別日が登録されていません
              </Text>
            )}
          </View>

          {/* 保存ボタン */}
          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 追加モーダル */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              margin: 20,
              padding: 20,
              borderRadius: 10,
              width: isDesktop ? 400 : isTablet ? 350 : "90%",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}
            >
              祝日・特別日を追加
            </Text>

            {/* 祝日名入力 */}
            <Text style={{ marginBottom: 8, fontWeight: "500" }}>名前</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
              }}
              placeholder="祝日・特別日の名前を入力"
              value={newHolidayName}
              onChangeText={setNewHolidayName}
            />

            {/* 日付選択 */}
            <Text style={{ marginBottom: 8, fontWeight: "500" }}>日付</Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ fontSize: 16 }}>
                {formatDate(newHolidayDate.toISOString().split("T")[0])}
              </Text>
            </TouchableOpacity>

            {/* 種類選択 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 20,
                }}
                onPress={() => setIsSpecialDay(false)}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: "#1976D2",
                    marginRight: 8,
                    backgroundColor: !isSpecialDay ? "#1976D2" : "transparent",
                  }}
                />
                <Text>祝日</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => setIsSpecialDay(true)}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: "#1976D2",
                    marginRight: 8,
                    backgroundColor: isSpecialDay ? "#1976D2" : "transparent",
                  }}
                />
                <Text>特別日</Text>
              </TouchableOpacity>
            </View>

            {/* ボタン */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 8,
                  marginRight: 8,
                  alignItems: "center",
                }}
                onPress={() => setShowAddModal(false)}
              >
                <Text>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: "#1976D2",
                  borderRadius: 8,
                  marginLeft: 8,
                  alignItems: "center",
                }}
                onPress={addHoliday}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>追加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 日付ピッカー */}
      {showDatePicker && (
        <DateTimePicker
          value={newHolidayDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setNewHolidayDate(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
};

export const ShiftHolidaySettingsView: React.FC<
  ShiftHolidaySettingsViewProps
> = ({
  settings,
  loading,
  calendarMonth,
  selectedDate,
  showDayModal,
  setSettings,
  setCalendarMonth,
  setSelectedDate,
  setShowDayModal,
  saveSettings,
}) => {
  // 祝日・特別日追加/削除
  const toggleHoliday = (date: string) => {
    setSettings({
      ...settings,
      holidays: settings.holidays.includes(date)
        ? settings.holidays.filter((d) => d !== date)
        : [...settings.holidays, date],
    });
    setShowDayModal(false);
  };
  const toggleSpecial = (date: string) => {
    setSettings({
      ...settings,
      specialDays: settings.specialDays.includes(date)
        ? settings.specialDays.filter((d) => d !== date)
        : [...settings.specialDays, date],
    });
    setShowDayModal(false);
  };

  // 月ごとの祝日・特別日リスト（祝日定義も含める）
  const getMonthList = (type: "holidays" | "specialDays" | "holidaysAll") => {
    if (type === "holidaysAll") {
      let holidays = [...settings.holidays];
      try {
        const {
          HOLIDAYS,
        } = require("@/modules/calendar/calendar-constants/constants");
        holidays = Array.from(
          new Set([
            ...holidays,
            ...Object.keys(HOLIDAYS).filter((d) =>
              d.startsWith(calendarMonth.slice(0, 7))
            ),
          ])
        );
      } catch (e) {}
      return holidays
        .filter((d) => d.startsWith(calendarMonth.slice(0, 7)))
        .sort();
    }
    return settings[type].filter((d) =>
      d.startsWith(calendarMonth.slice(0, 7))
    );
  };

  if (loading)
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );

  // カレンダーのマーク
  const markedDates = (() => {
    const marks: Record<string, any> = {};
    try {
      const {
        HOLIDAYS,
      } = require("@/modules/calendar/calendar-constants/constants");
      Object.keys(HOLIDAYS).forEach((d) => {
        marks[d] = {
          marked: true,
          dotColor: "#e57373",
          customStyles: { container: { backgroundColor: "#ffeaea" } },
        };
      });
    } catch (e) {}
    settings.holidays.forEach((d) => {
      marks[d] = {
        marked: true,
        dotColor: "#1976D2",
        customStyles: { container: { backgroundColor: "#e3f2fd" } },
      };
    });
    settings.specialDays.forEach((d) => {
      marks[d] = {
        marked: true,
        dotColor: "#ff9800",
        customStyles: { container: { backgroundColor: "#ffe0b2" } },
      };
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        customStyles: {
          ...(marks[selectedDate]?.customStyles || {}),
          container: { backgroundColor: "#1976D2" },
          text: { color: "#fff", fontWeight: "bold" },
        },
      };
    }
    return marks;
  })();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: "祝日・特別日設定", headerShown: true }}
      />
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          alignItems: "flex-start",
          marginTop: 16,
          marginBottom: 8,
          gap: 32,
        }}
      >
        <View
          style={{
            flex: 1,
            minWidth: 320,
            maxWidth: 400,
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <ShiftCalendar
            shifts={[]}
            selectedDate={selectedDate || ""}
            currentMonth={calendarMonth}
            onDayPress={({ dateString }) => {
              setSelectedDate(dateString);
              setShowDayModal(true);
            }}
            onMonthChange={({ dateString }) => {
              setCalendarMonth(dateString.slice(0, 7) + "-01");
              setSelectedDate(null);
            }}
            markedDates={markedDates}
          />
        </View>
        <View
          style={{
            flex: 1,
            minWidth: 240,
            maxWidth: 400,
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: 14,
              padding: 12,
              marginTop: 8,
              marginBottom: 8,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
                marginTop: 4,
                marginBottom: 2,
                color: "#1976D2",
              }}
            >
              {calendarMonth.slice(0, 7)} の祝日
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexDirection: "row", marginBottom: 6 }}
            >
              {getMonthList("holidaysAll").length === 0 && (
                <Text
                  style={{ color: "#aaa", marginHorizontal: 8, fontSize: 14 }}
                >
                  祝日なし
                </Text>
              )}
              {getMonthList("holidaysAll").map((d) => (
                <View
                  key={d}
                  style={{
                    backgroundColor: "#e3f2fd",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    margin: 2,
                  }}
                >
                  <Text style={{ color: "#1976D2", fontWeight: "bold" }}>
                    {d}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
                marginTop: 4,
                marginBottom: 2,
                color: "#1976D2",
              }}
            >
              {calendarMonth.slice(0, 7)} の特別日
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexDirection: "row", marginBottom: 6 }}
            >
              {getMonthList("specialDays").length === 0 && (
                <Text
                  style={{ color: "#aaa", marginHorizontal: 8, fontSize: 14 }}
                >
                  特別日なし
                </Text>
              )}
              {getMonthList("specialDays").map((d) => (
                <View
                  key={d}
                  style={{
                    backgroundColor: "#ffe0b2",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    margin: 2,
                  }}
                >
                  <Text style={{ color: "#ff9800", fontWeight: "bold" }}>
                    {d}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#1976D2",
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          marginTop: 16,
          width: 240,
          alignSelf: "center",
          zIndex: 10,
        }}
        onPress={saveSettings}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          保存
        </Text>
      </TouchableOpacity>
      <Modal
        visible={showDayModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowDayModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              padding: 24,
              width: 320,
              maxWidth: "90%",
              maxHeight: "70%",
              alignItems: "center",
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}
            >
              {selectedDate} の設定
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#e3f2fd",
                borderRadius: 8,
                padding: 12,
                marginVertical: 8,
                width: 220,
                alignItems: "center",
              }}
              onPress={() => toggleHoliday(selectedDate!)}
            >
              <Text
                style={{ color: "#1976D2", fontWeight: "bold", fontSize: 16 }}
              >
                {settings.holidays.includes(selectedDate!)
                  ? "祝日設定を外す"
                  : "この日を祝日にする"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#ffe0b2",
                borderRadius: 8,
                padding: 12,
                marginVertical: 8,
                width: 220,
                alignItems: "center",
              }}
              onPress={() => toggleSpecial(selectedDate!)}
            >
              <Text
                style={{ color: "#ff9800", fontWeight: "bold", fontSize: 16 }}
              >
                {settings.specialDays.includes(selectedDate!)
                  ? "特別日設定を外す"
                  : "この日を特別日にする"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 8, padding: 10 }}
              onPress={() => setShowDayModal(false)}
            >
              <Text
                style={{ color: "#1976D2", fontSize: 16, fontWeight: "bold" }}
              >
                閉じる
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
