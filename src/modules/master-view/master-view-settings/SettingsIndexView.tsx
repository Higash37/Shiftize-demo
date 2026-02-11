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

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;

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
            style={[styles.listItem, styles.disabledItem]}
            onPress={() => {}}
          >
            <Text style={[styles.listText, styles.disabledText]}>シフトルール</Text>
            <Text style={styles.comingSoonBadge}>準備中</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* 祝日・特別日 */}
          <TouchableOpacity
            style={[styles.listItem, styles.disabledItem]}
            onPress={() => {}}
          >
            <Text style={[styles.listText, styles.disabledText]}>祝日・特別日</Text>
            <Text style={styles.comingSoonBadge}>準備中</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* 外観 */}
          <TouchableOpacity
            style={[styles.listItem, styles.disabledItem]}
            onPress={() => {}}
          >
            <Text style={[styles.listText, styles.disabledText]}>外観</Text>
            <Text style={styles.comingSoonBadge}>準備中</Text>
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
            style={[styles.listItem, styles.disabledItem]}
            onPress={() => {}}
          >
            <Text style={[styles.listText, styles.disabledText]}>バックアップ・復元</Text>
            <Text style={styles.comingSoonBadge}>準備中</Text>
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
          <View style={styles.separator} />

          {/* アカウント連携 */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => onNavigate("/(main)/master/master-settings/account-linking")}
          >
            <Text style={styles.listText}>アカウント連携</Text>
            <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* アプリバージョン管理 */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => onNavigate("/(main)/master/master-settings/app-version")}
          >
            <Text style={styles.listText}>アプリバージョン管理</Text>
            <Text style={{ fontSize: 20, color: '#ccc' }}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
