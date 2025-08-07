import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Stack } from "expo-router";
import { settingsIndexViewStyles as styles } from "./SettingsIndexView.styles";
import type { SettingsIndexViewProps } from "./SettingsIndexView.types";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const FOOTER_HEIGHT = 80; // フッターの高さ
const HEADER_HEIGHT = 60; // ヘッダーの高さ

export const SettingsIndexView: React.FC<SettingsIndexViewProps> = ({
  onNavigate,
}) => {
  const containerStyle = [
    styles.container,
    isTablet && styles.containerTablet,
    isDesktop && styles.containerDesktop,
  ];

  return (
    <View style={containerStyle}>
      <Stack.Screen options={{ title: "設定", headerShown: false }} />
      <Text style={styles.title}>設定</Text>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listContainer}>
          {/* シフトルール */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => onNavigate("/master/settings/shift-rule")}
          >
            <Text style={styles.listText}>シフトルール</Text>
            <Text style={styles.previewBadge}>プレビュー</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* 祝日・特別日 */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => onNavigate("/master/settings/shift-holiday")}
          >
            <Text style={styles.listText}>祝日・特別日</Text>
            <Text style={styles.previewBadge}>プレビュー</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* 外観 */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => onNavigate("/master/settings/shift-appearance")}
          >
            <Text style={styles.listText}>外観</Text>
            <Text style={styles.previewBadge}>プレビュー</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* シフトステータス */}
          <TouchableOpacity
            style={[styles.listItem, styles.disabledItem]}
            onPress={() => {}}
          >
            <Text style={[styles.listText, styles.disabledText]}>
              シフトステータス
            </Text>
            <Text style={styles.comingSoonBadge}>準備中</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* タスク管理 */}
          <TouchableOpacity
            style={[styles.listItem, styles.disabledItem]}
            onPress={() => {}}
          >
            <Text style={[styles.listText, styles.disabledText]}>
              タスク管理
            </Text>
            <Text style={styles.comingSoonBadge}>準備中</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* バックアップ・復元 */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => onNavigate("/master/settings/backup")}
          >
            <Text style={styles.listText}>バックアップ・復元</Text>
            <Text style={styles.previewBadge}>プレビュー</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* 詳細設定 */}
          <TouchableOpacity
            style={[styles.listItem, styles.disabledItem]}
            onPress={() => {}}
          >
            <Text style={[styles.listText, styles.disabledText]}>詳細設定</Text>
            <Text style={styles.comingSoonBadge}>準備中</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
