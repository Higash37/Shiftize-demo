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
import { getCurrentYearHolidays } from "@/common/common-utils/settings/japaneseHolidays";
import { shiftHolidaySettingsViewStyles as styles } from "./ShiftHolidaySettingsView.styles";
import type { ShiftHolidaySettingsViewProps } from "./ShiftHolidaySettingsView.types";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const FOOTER_HEIGHT = 80; // フッターの高さ
const HEADER_HEIGHT = 60; // ヘッダーの高さ

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

    if (isSpecialDay) {
      const newSpecialDay = {
        id: Date.now().toString(),
        date: dateString,
        name: newHolidayName.trim(),
        type: "special" as const,
        workingDay: false,
      };

      const updatedSpecialDays = [
        ...(settings.specialDays || []),
        newSpecialDay,
      ];
      onChange({
        ...settings,
        specialDays: updatedSpecialDays,
      });
    } else {
      const newHoliday = {
        id: Date.now().toString(),
        date: dateString,
        name: newHolidayName.trim(),
        type: "national" as const,
      };

      const updatedHolidays = [...(settings.holidays || []), newHoliday];
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
      const updatedHolidays = (settings.holidays || []).filter(
        (h) => h.id !== id
      );
      onChange({
        ...settings,
        holidays: updatedHolidays,
      });
    } else {
      const updatedSpecialDays = (settings.specialDays || []).filter(
        (s) => s.id !== id
      );
      onChange({
        ...settings,
        specialDays: updatedSpecialDays,
      });
    }
  };

  // 日本の祝日を一括追加
  const addJapaneseHolidays = () => {
    const currentYear = new Date().getFullYear();
    const japaneseHolidayData = getCurrentYearHolidays();

    // 祝日データをHoliday型に変換
    const japaneseHolidays = japaneseHolidayData.map((holiday) => ({
      id: `japanese-${holiday.date}`,
      date: holiday.date,
      name: holiday.name,
      type: "national" as const,
    }));

    // 重複チェック
    const existingDates = new Set((settings.holidays || []).map((h) => h.date));
    const newHolidays = japaneseHolidays.filter(
      (h) => !existingDates.has(h.date)
    );

    if (newHolidays.length === 0) {
      Alert.alert(
        "情報",
        `${currentYear}年・${
          currentYear + 1
        }年の日本の祝日は既に登録されています。`
      );
      return;
    }

    Alert.alert(
      "確認",
      `日本の祝日 ${
        newHolidays.length
      }件を追加しますか？\n（${currentYear}年・${currentYear + 1}年分）`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "追加",
          onPress: () => {
            const updatedHolidays = [
              ...(settings.holidays || []),
              ...newHolidays,
            ];
            onChange({
              ...settings,
              holidays: updatedHolidays,
            });
            Alert.alert(
              "完了",
              `${newHolidays.length}件の祝日を追加しました。`
            );
          },
        },
      ]
    );
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
    ...(settings.holidays || []).map((h) => ({
      ...h,
      type: "holiday" as const,
    })),
    ...(settings.specialDays || []).map((s) => ({
      ...s,
      type: "special" as const,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <View style={containerStyle}>
      <Stack.Screen
        options={{ title: "祝日・特別日設定", headerShown: false }}
      />

      <ScrollView
        style={[
          styles.scrollContainer,
          { maxHeight: height - FOOTER_HEIGHT - HEADER_HEIGHT },
        ]}
        contentContainerStyle={{
          paddingBottom: 20,
          justifyContent: "flex-start",
        }}
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

          {/* 日本の祝日一括追加ボタン */}
          <TouchableOpacity
            style={[styles.addButton, styles.bulkAddButton]}
            onPress={addJapaneseHolidays}
          >
            <Ionicons
              name="calendar"
              size={20}
              color="#007AFF"
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.addButtonText, styles.bulkAddButtonText]}>
              日本の祝日を一括追加
            </Text>
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
              placeholderTextColor="#999"
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
