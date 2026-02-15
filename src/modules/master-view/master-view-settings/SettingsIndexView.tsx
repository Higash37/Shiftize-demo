import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { createSettingsIndexViewStyles } from "./SettingsIndexView.styles";
import type { SettingsIndexViewProps } from "./SettingsIndexView.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";

export const SettingsIndexView: React.FC<SettingsIndexViewProps> = ({
  onNavigate,
}) => {
  const styles = useThemedStyles(createSettingsIndexViewStyles);
  const { isTablet, isDesktop } = useBreakpoint();

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
        <View
          style={[
            styles.listContainer,
            isTablet && styles.listContainerTablet,
            isDesktop && styles.listContainerDesktop,
          ]}
        >
          {/* アカウント連携 */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => onNavigate("/(main)/master/master-settings/account-linking")}
          >
            <Text style={styles.listText}>アカウント連携</Text>
            <Text style={styles.chevronText}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          {/* アプリバージョン管理 */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => onNavigate("/(main)/master/master-settings/app-version")}
          >
            <Text style={styles.listText}>アプリバージョン管理</Text>
            <Text style={styles.chevronText}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
