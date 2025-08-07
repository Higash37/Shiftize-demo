import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shiftAppearanceSettingsViewStyles as styles } from "./ShiftAppearanceSettingsView.styles";
import type { ShiftAppearanceSettingsViewProps } from "./ShiftAppearanceSettingsView.types";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const FOOTER_HEIGHT = 80; // フッターの高さ
const HEADER_HEIGHT = 60; // ヘッダーの高さ

export const ShiftAppearanceSettingsView: React.FC<
  ShiftAppearanceSettingsViewProps
> = ({ settings, loading, onChange, onSave }) => {
  const containerStyle = [
    styles.container,
    isTablet && styles.containerTablet,
    isDesktop && styles.containerDesktop,
  ];

  // フォントサイズ選択
  const selectFontSize = () => {
    Alert.alert("フォントサイズを選択", "", [
      {
        text: "小",
        onPress: () => onChange({ ...settings, fontSize: "small" }),
      },
      {
        text: "中",
        onPress: () => onChange({ ...settings, fontSize: "medium" }),
      },
      {
        text: "大",
        onPress: () => onChange({ ...settings, fontSize: "large" }),
      },
      { text: "キャンセル", style: "cancel" },
    ]);
  };

  // カレンダー表示選択
  const selectCalendarView = () => {
    Alert.alert("カレンダー表示を選択", "", [
      {
        text: "月表示",
        onPress: () => onChange({ ...settings, calendarView: "month" }),
      },
      {
        text: "週表示",
        onPress: () => onChange({ ...settings, calendarView: "week" }),
      },
      {
        text: "日表示",
        onPress: () => onChange({ ...settings, calendarView: "day" }),
      },
      { text: "キャンセル", style: "cancel" },
    ]);
  };

  // 言語選択
  const selectLanguage = () => {
    Alert.alert("言語を選択", "", [
      {
        text: "日本語",
        onPress: () => onChange({ ...settings, language: "ja" }),
      },
      {
        text: "English",
        onPress: () => onChange({ ...settings, language: "en" }),
      },
      { text: "キャンセル", style: "cancel" },
    ]);
  };

  // フォントサイズのラベル
  const getFontSizeLabel = () => {
    switch (settings.fontSize) {
      case "small":
        return "小";
      case "medium":
        return "中";
      case "large":
        return "大";
      default:
        return "中";
    }
  };

  // カレンダー表示のラベル
  const getCalendarViewLabel = () => {
    switch (settings.calendarView) {
      case "month":
        return "月表示";
      case "week":
        return "週表示";
      case "day":
        return "日表示";
      default:
        return "月表示";
    }
  };

  // 言語のラベル
  const getLanguageLabel = () => {
    switch (settings.language) {
      case "ja":
        return "日本語";
      case "en":
        return "English";
      default:
        return "日本語";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Stack.Screen options={{ title: "外観設定", headerShown: false }} />
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
          <Text style={styles.sectionTitle}>外観</Text>

          {/* ダークモード */}
          <View style={styles.listItem}>
            <Text style={styles.listText}>ダークモード</Text>
            <Switch
              value={settings.darkMode}
              onValueChange={(v) => onChange({ ...settings, darkMode: v })}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.darkMode ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          {/* フォントサイズ */}
          <View style={styles.listItem}>
            <Text style={styles.listText}>フォントサイズ</Text>
            <TouchableOpacity
              onPress={selectFontSize}
              style={styles.valueButton}
            >
              <Text style={styles.valueText}>{getFontSizeLabel()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* コンパクトモード */}
          <View style={styles.listItem}>
            <Text style={styles.listText}>コンパクトモード</Text>
            <Switch
              value={settings.compactMode}
              onValueChange={(v) => onChange({ ...settings, compactMode: v })}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.compactMode ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          {/* 週番号表示 */}
          <View style={styles.listItem}>
            <Text style={styles.listText}>週番号表示</Text>
            <Switch
              value={settings.showWeekNumbers}
              onValueChange={(v) =>
                onChange({ ...settings, showWeekNumbers: v })
              }
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.showWeekNumbers ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          {/* カレンダー表示 */}
          <View style={styles.listItem}>
            <Text style={styles.listText}>デフォルトカレンダー表示</Text>
            <TouchableOpacity
              onPress={selectCalendarView}
              style={styles.valueButton}
            >
              <Text style={styles.valueText}>{getCalendarViewLabel()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* 言語 */}
          <View style={styles.listItem}>
            <Text style={styles.listText}>言語</Text>
            <TouchableOpacity
              onPress={selectLanguage}
              style={styles.valueButton}
            >
              <Text style={styles.valueText}>{getLanguageLabel()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
