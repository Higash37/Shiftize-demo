import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { settingsBackupViewStyles as styles } from "./SettingsBackupView.styles";
import type { SettingsBackupViewProps } from "./SettingsBackupView.types";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;
const FOOTER_HEIGHT = 80; // フッターの高さ
const HEADER_HEIGHT = 60; // ヘッダーの高さ

export const SettingsBackupView: React.FC<SettingsBackupViewProps> = ({
  loading,
  onExport,
  onImport,
  onReset,
}) => {
  const containerStyle = [
    styles.container,
    isTablet && styles.containerTablet,
    isDesktop && styles.containerDesktop,
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>処理中...</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Stack.Screen
        options={{ title: "バックアップ・復元", headerShown: false }}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{
          paddingBottom: 20,
          justifyContent: "flex-start",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* バックアップ・復元セクション */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>バックアップ・復元</Text>
          <Text style={styles.sectionDescription}>
            設定をファイルとして保存したり、以前保存した設定を復元できます。
          </Text>

          {/* エクスポートボタン */}
          <TouchableOpacity style={styles.actionButton} onPress={onExport}>
            <View style={styles.buttonIcon}>
              <Ionicons name="download-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>設定をエクスポート</Text>
              <Text style={styles.buttonDescription}>
                現在の設定をJSONファイルとして保存します
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* インポートボタン */}
          <TouchableOpacity style={styles.actionButton} onPress={onImport}>
            <View style={styles.buttonIcon}>
              <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>設定をインポート</Text>
              <Text style={styles.buttonDescription}>
                保存された設定ファイルから設定を復元します
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 初期化セクション */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>初期化</Text>
          <Text style={styles.sectionDescription}>
            全ての設定を初期値にリセットします。この操作は元に戻すことができません。
          </Text>

          {/* リセットボタン */}
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={onReset}
          >
            <View style={styles.buttonIcon}>
              <Ionicons name="refresh-outline" size={24} color="#FF3B30" />
            </View>
            <View style={styles.buttonContent}>
              <Text style={[styles.buttonTitle, styles.dangerText]}>
                設定をリセット
              </Text>
              <Text style={styles.buttonDescription}>
                全ての設定を初期値に戻します
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 注意事項 */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#FF9500"
            />
            <Text style={styles.infoTitle}>注意事項</Text>
          </View>
          <Text style={styles.infoText}>
            •
            設定ファイルには個人情報は含まれませんが、安全な場所に保管してください。
          </Text>
          <Text style={styles.infoText}>
            • 設定をインポートすると、現在の設定は上書きされます。
          </Text>
          <Text style={styles.infoText}>
            • 設定のリセットは元に戻すことができません。
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
