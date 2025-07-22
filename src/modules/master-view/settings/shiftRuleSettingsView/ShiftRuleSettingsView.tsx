import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ShiftRuleValuePicker } from "../ShiftRuleValuePicker";
import { shiftRuleSettingsViewStyles as styles } from "./ShiftRuleSettingsView.styles";
import type { ShiftRuleSettingsViewProps } from "./ShiftRuleSettingsView.types";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const FOOTER_HEIGHT = 80; // フッターの高さ
const HEADER_HEIGHT = 60; // ヘッダーの高さ

export const ShiftRuleSettingsView: React.FC<ShiftRuleSettingsViewProps> = ({
  settings,
  loading,
  onChange,
  onSave,
  picker,
  setPicker,
}) => {
  // 値リスト
  const maxWorkHoursList = Array.from({ length: 13 }, (_, i) => i + 6);
  const minBreakList = [30, 45, 60, 90, 120];
  const maxConsecutiveList = [3, 4, 5, 6, 7, 8, 9, 10];
  const weekStartDayList = [
    { value: 0, label: "日曜日" },
    { value: 1, label: "月曜日" },
  ];
  const shiftTimeUnitList = [15, 30, 60];
  const maxOvertimeHoursList = Array.from({ length: 8 }, (_, i) => i + 1);
  const minShiftHoursList = Array.from({ length: 8 }, (_, i) => i + 1);

  // 週の開始日を選択
  const selectWeekStartDay = () => {
    Alert.alert("週の開始日を選択", "", [
      {
        text: "日曜日",
        onPress: () => onChange({ ...settings, weekStartDay: 0 }),
      },
      {
        text: "月曜日",
        onPress: () => onChange({ ...settings, weekStartDay: 1 }),
      },
      { text: "キャンセル", style: "cancel" },
    ]);
  };

  const containerStyle = [
    styles.container,
    isTablet && styles.containerTablet,
    isDesktop && styles.containerDesktop,
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }
  return (
    <View style={containerStyle}>
      <Stack.Screen
        options={{ title: "シフトルール設定", headerShown: false }}
      />

      {/* スクロール可能なコンテンツ部分 */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isDesktop ? 24 : isTablet ? 20 : 16,
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>シフトルール</Text>

          {/* 最大勤務時間 */}
          <View style={styles.listItemRow}>
            <Text style={styles.listText}>1日の最大勤務時間</Text>
            <View style={styles.valueRow}>
              <TouchableOpacity
                onPress={() =>
                  onChange({
                    ...settings,
                    maxWorkHours: Math.max(6, settings.maxWorkHours - 1),
                  })
                }
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={isDesktop ? 32 : isTablet ? 30 : 28}
                  color={isDesktop ? "#1976D2" : "#1976D2"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPicker("maxWorkHours")}
                style={styles.valueTouchable}
              >
                <Text style={styles.valueText}>
                  {settings.maxWorkHours}時間
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  onChange({
                    ...settings,
                    maxWorkHours: Math.min(18, settings.maxWorkHours + 1),
                  })
                }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={isDesktop ? 32 : isTablet ? 30 : 28}
                  color="#1976D2"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 最小休憩時間 */}
          <View style={styles.listItemRow}>
            <Text style={styles.listText}>最小休憩時間</Text>
            <View style={styles.valueRow}>
              <TouchableOpacity
                onPress={() =>
                  onChange({
                    ...settings,
                    minBreakMinutes: Math.max(30, settings.minBreakMinutes - 5),
                  })
                }
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={isDesktop ? 32 : isTablet ? 30 : 28}
                  color="#1976D2"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPicker("minBreakMinutes")}
                style={styles.valueTouchable}
              >
                <Text style={styles.valueText}>
                  {settings.minBreakMinutes}分
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  onChange({
                    ...settings,
                    minBreakMinutes: Math.min(
                      120,
                      settings.minBreakMinutes + 5
                    ),
                  })
                }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={isDesktop ? 32 : isTablet ? 30 : 28}
                  color="#1976D2"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 連勤制限 */}
          <View style={styles.listItemRow}>
            <Text style={styles.listText}>連勤制限</Text>
            <View style={styles.valueRow}>
              <TouchableOpacity
                onPress={() =>
                  onChange({
                    ...settings,
                    maxConsecutiveDays: Math.max(
                      3,
                      settings.maxConsecutiveDays - 1
                    ),
                  })
                }
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={isDesktop ? 32 : isTablet ? 30 : 28}
                  color="#1976D2"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPicker("maxConsecutiveDays")}
                style={styles.valueTouchable}
              >
                <Text style={styles.valueText}>
                  {settings.maxConsecutiveDays}日
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  onChange({
                    ...settings,
                    maxConsecutiveDays: Math.min(
                      10,
                      settings.maxConsecutiveDays + 1
                    ),
                  })
                }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={isDesktop ? 32 : isTablet ? 30 : 28}
                  color="#1976D2"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 週の開始日 */}
          <View style={styles.listItemRow}>
            <Text style={styles.listText}>週の開始日</Text>
            <View style={styles.valueRow}>
              <TouchableOpacity
                onPress={selectWeekStartDay}
                style={styles.valueTouchable}
              >
                <Text style={styles.valueText}>
                  {settings.weekStartDay === 0 ? "日曜日" : "月曜日"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* シフト時間単位 */}
          <View style={styles.listItemRow}>
            <Text style={styles.listText}>シフト時間単位</Text>
            <View style={styles.valueRow}>
              <TouchableOpacity
                onPress={() => setPicker("shiftTimeUnit")}
                style={styles.valueTouchable}
              >
                <Text style={styles.valueText}>{settings.shiftTimeUnit}分</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 残業許可 */}
          <View style={styles.listItemRow}>
            <Text style={styles.listText}>残業許可</Text>
            <TouchableOpacity
              onPress={() =>
                onChange({
                  ...settings,
                  allowOvertime: !settings.allowOvertime,
                })
              }
              style={styles.switchButton}
            >
              <Ionicons
                name={settings.allowOvertime ? "toggle" : "toggle-outline"}
                size={isDesktop ? 36 : isTablet ? 32 : 30}
                color={settings.allowOvertime ? "#007AFF" : "#C7C7CC"}
              />
            </TouchableOpacity>
          </View>

          {/* 最大残業時間（残業許可時のみ表示） */}
          {settings.allowOvertime && (
            <View style={styles.listItemRow}>
              <Text style={styles.listText}>最大残業時間</Text>
              <View style={styles.valueRow}>
                <TouchableOpacity
                  onPress={() =>
                    onChange({
                      ...settings,
                      maxOvertimeHours: Math.max(
                        1,
                        settings.maxOvertimeHours - 1
                      ),
                    })
                  }
                >
                  <Ionicons
                    name="remove-circle-outline"
                    size={isDesktop ? 32 : isTablet ? 30 : 28}
                    color="#1976D2"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPicker("maxOvertimeHours")}
                  style={styles.valueTouchable}
                >
                  <Text style={styles.valueText}>
                    {settings.maxOvertimeHours}時間
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    onChange({
                      ...settings,
                      maxOvertimeHours: Math.min(
                        8,
                        settings.maxOvertimeHours + 1
                      ),
                    })
                  }
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={isDesktop ? 32 : isTablet ? 30 : 28}
                    color="#1976D2"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 最小シフト時間 */}
          <View style={styles.listItemRow}>
            <Text style={styles.listText}>最小シフト時間</Text>
            <View style={styles.valueRow}>
              <TouchableOpacity
                onPress={() =>
                  onChange({
                    ...settings,
                    minShiftHours: Math.max(1, settings.minShiftHours - 1),
                  })
                }
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={isDesktop ? 32 : isTablet ? 30 : 28}
                  color="#1976D2"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPicker("minShiftHours")}
                style={styles.valueTouchable}
              >
                <Text style={styles.valueText}>
                  {settings.minShiftHours}時間
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  onChange({
                    ...settings,
                    minShiftHours: Math.min(8, settings.minShiftHours + 1),
                  })
                }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={isDesktop ? 32 : isTablet ? 30 : 28}
                  color="#1976D2"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>

        {/* モーダルピッカー */}
        <ShiftRuleValuePicker
          visible={picker === "maxWorkHours"}
          values={maxWorkHoursList}
          value={settings.maxWorkHours}
          unit="時間"
          title="1日の最大勤務時間"
          onSelect={(v) => onChange({ ...settings, maxWorkHours: v })}
          onClose={() => setPicker(null)}
        />
        <ShiftRuleValuePicker
          visible={picker === "minBreakMinutes"}
          values={minBreakList}
          value={settings.minBreakMinutes}
          unit="分"
          title="最小休憩時間"
          onSelect={(v) => onChange({ ...settings, minBreakMinutes: v })}
          onClose={() => setPicker(null)}
        />
        <ShiftRuleValuePicker
          visible={picker === "maxConsecutiveDays"}
          values={maxConsecutiveList}
          value={settings.maxConsecutiveDays}
          unit="日"
          title="連勤制限"
          onSelect={(v) => onChange({ ...settings, maxConsecutiveDays: v })}
          onClose={() => setPicker(null)}
        />
        <ShiftRuleValuePicker
          visible={picker === "shiftTimeUnit"}
          values={shiftTimeUnitList}
          value={settings.shiftTimeUnit}
          unit="分"
          title="シフト時間単位"
          onSelect={(v) => onChange({ ...settings, shiftTimeUnit: v })}
          onClose={() => setPicker(null)}
        />
        <ShiftRuleValuePicker
          visible={picker === "maxOvertimeHours"}
          values={maxOvertimeHoursList}
          value={settings.maxOvertimeHours}
          unit="時間"
          title="最大残業時間"
          onSelect={(v) => onChange({ ...settings, maxOvertimeHours: v })}
          onClose={() => setPicker(null)}
        />
        <ShiftRuleValuePicker
          visible={picker === "minShiftHours"}
          values={minShiftHoursList}
          value={settings.minShiftHours}
          unit="時間"
          title="最小シフト時間"
          onSelect={(v) => onChange({ ...settings, minShiftHours: v })}
          onClose={() => setPicker(null)}
        />
      </ScrollView>
    </View>
  );
};
