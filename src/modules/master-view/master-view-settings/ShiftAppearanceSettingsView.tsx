import React, { useMemo } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { createShiftAppearanceSettingsViewStyles } from "./ShiftAppearanceSettingsView.styles";
import type { ShiftAppearanceSettingsViewProps } from "./ShiftAppearanceSettingsView.types";

const FOOTER_HEIGHT = 80;
const HEADER_HEIGHT = 60;

export const ShiftAppearanceSettingsView: React.FC<
  ShiftAppearanceSettingsViewProps
> = ({ settings, loading, onChange, onSave }) => {
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const { height } = useWindowDimensions();
  const styles = useMemo(
    () => createShiftAppearanceSettingsViewStyles(theme, bp),
    [theme, bp],
  );

  const containerStyle = [
    styles.container,
    bp.isTablet && styles.containerTablet,
    bp.isDesktop && styles.containerDesktop,
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

          {/* フォントサイズ */}
          <View style={styles.listItem}>
            <Text style={styles.listText}>フォントサイズ</Text>
            <TouchableOpacity
              onPress={selectFontSize}
              style={styles.valueButton}
            >
              <Text style={styles.valueText}>{getFontSizeLabel()}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colorScheme.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* コンパクトモード */}
          <View style={styles.listItem}>
            <Text style={styles.listText}>コンパクトモード</Text>
            <Switch
              value={settings.compactMode}
              onValueChange={(v) => onChange({ ...settings, compactMode: v })}
              trackColor={{ false: "#767577", true: theme.colorScheme.primaryContainer }}
              thumbColor={settings.compactMode ? theme.colorScheme.primary : "#f4f3f4"}
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
              trackColor={{ false: "#767577", true: theme.colorScheme.primaryContainer }}
              thumbColor={settings.showWeekNumbers ? theme.colorScheme.primary : "#f4f3f4"}
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
              <Ionicons name="chevron-forward" size={20} color={theme.colorScheme.onSurfaceVariant} />
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
              <Ionicons name="chevron-forward" size={20} color={theme.colorScheme.onSurfaceVariant} />
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
