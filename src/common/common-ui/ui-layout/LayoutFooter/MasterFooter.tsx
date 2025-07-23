import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import Toast from "react-native-toast-message";
import { styles } from "./styles";
import { TabItem } from "../types";
import { MasterFooterProps } from "./types";

// 管理者用フッターのタブ設定
const MASTER_TABS: TabItem[] = [
  {
    name: "home",
    label: "ホーム",
    path: "/master/home",
    icon: (active: boolean) => (
      <MaterialIcons
        name="home"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "files",
    label: "ファイル",
    path: "/master/files",
    icon: (active: boolean) => (
      <MaterialIcons
        name="folder"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "info",
    label: "インフォ",
    path: "/master/info",
    icon: (active: boolean) => (
      <Ionicons
        name="information-circle"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "thisMonth",
    label: "今月のシフト",
    path: "/master/gantt-view",
    icon: (active: boolean) => (
      <FontAwesome5
        name="calendar-alt"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "create",
    label: "シフト追加",
    path: "/master/shifts/create",
    icon: (active: boolean) => (
      <View style={styles.addButtonContainer}>
        <AntDesign name="plus" size={24} color="white" />
      </View>
    ),
    isUnderDevelopment: false,
  },
  {
    name: "nextMonth",
    label: "来月シフト作成",
    path: "/master/gantt-edit",
    icon: (active: boolean) => (
      <FontAwesome5
        name="calendar"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "users",
    label: "ユーザー管理",
    path: "/master/users",
    icon: (active: boolean) => (
      <MaterialIcons
        name="people"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "settings",
    label: "設定",
    path: "/master/settings",
    icon: (active: boolean) => (
      <Ionicons
        name="settings"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
];
function isStandalonePWA() {
  if (typeof window !== "undefined") {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }
  return false;
}

/**
 * MasterFooter - 管理者用フッターナビゲーションコンポーネント
 *
 * 管理者画面の下部に表示され、主要な画面間のナビゲーションを提供します。
 */
export function MasterFooter({}: MasterFooterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (tab: TabItem) => {
    if (tab.isUnderDevelopment) {
      Toast.show({
        type: "info",
        text1: "開発中です！",
        text2: "この機能は現在開発中です。",
        position: "bottom",
      });
      return;
    }
    router.push(tab.path);
  };

  const isPWA = isStandalonePWA();

  return (
    <View
      style={[
        styles.footer,
        {
          position: "relative",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
          minWidth: "100%",
          ...(isPWA && {
            position: "fixed" as any,
            zIndex: 1000,
            width: "100vw" as any,
            minWidth: "100vw" as any,
            maxWidth: "100vw" as any,
          }),
        },
      ]}
    >
      {MASTER_TABS.map((tab, index) => {
        const active = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tab,
              tab.name === "create" && styles.createTab,
              tab.isUnderDevelopment && styles.disabledTab,
              {
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...(isPWA && {
                  minWidth: `${100 / MASTER_TABS.length}%` as any,
                  maxWidth: `${100 / MASTER_TABS.length}%` as any,
                }),
              },
            ]}
            onPress={() => handleTabPress(tab)}
            disabled={tab.isUnderDevelopment}
          >
            {tab.icon(active)}
            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
                tab.name === "create" && styles.createLabel,
                tab.isUnderDevelopment && styles.disabledLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      {isPWA &&
        (typeof window !== "undefined" && window.document ? (
          <div className="pwa-footer-safearea master-footer-pwa" />
        ) : (
          <View
            style={{
              height: 10,
              width: "100%",
              backgroundColor: colors.background,
            }}
          />
        ))}
    </View>
  );
}

export default MasterFooter;
