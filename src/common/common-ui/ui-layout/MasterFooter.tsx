/** @file MasterFooter.tsx @description 管理者用フッターナビゲーション。ホーム/業務/当日/追加/今月/来月/ユーザー/設定のタブを提供 */
import React, { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, Text, Dimensions, Alert } from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { createFooterStyles } from "./LayoutFooter.styles";
import { TabItem } from "./ui-layout-types";
import { MasterFooterProps } from "./LayoutFooter.types";
import { ServiceProvider } from "@/services/ServiceProvider";
import type { ShiftSubmissionPeriod } from "@/services/interfaces/IShiftSubmissionService";
import { useAuth } from "@/services/auth/useAuth";
import { convertShadowForWeb } from "@/common/common-constants/ShadowConstants";
import { useExtendedFonts } from "@/common/common-utils/performance/fontLoader";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { MD3ColorScheme } from "@/common/common-theme/md3/MD3Colors";
import { useTodoBadge } from "@/common/common-context/TodoBadgeContext";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** 管理者用フッタータブをテーマカラーに応じて生成 */
const createMasterTabs = (cs: MD3ColorScheme): TabItem[] => [
  {
    name: "home",
    label: "ホーム",
    path: "/master/home",
    icon: (active: boolean) => (
      <MaterialIcons
        name="home"
        size={24}
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "info",
    label: "業務",
    path: "/master/info",
    icon: (active: boolean) => (
      <Ionicons
        name="information-circle"
        size={24}
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "today",
    label: "当日",
    path: "/master/today",
    icon: (active: boolean) => (
      <Ionicons
        name="today"
        size={24}
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "create",
    label: "追加",
    path: "/master/shifts/create",
    icon: (active: boolean) => (
      <AntDesign
        name="plus"
        size={24}
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "thisMonth",
    label: "今月",
    path: "/master/shifts/this-month",
    icon: (active: boolean) => (
      <FontAwesome5
        name="calendar-alt"
        size={24}
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "nextMonth",
    label: "来月",
    path: "/master/shifts/next-month",
    icon: (active: boolean) => (
      <FontAwesome5
        name="calendar"
        size={24}
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "users",
    label: "ユーザー",
    path: "/master/users",
    icon: (active: boolean) => (
      <MaterialIcons
        name="people"
        size={24}
        color={active ? cs.primary : cs.onSurfaceVariant}
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
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: true,
  },
];
function isStandalonePWA() {
  if (globalThis.window !== undefined) {
    return (
      globalThis.window.matchMedia("(display-mode: standalone)").matches ||
      (globalThis.window.navigator as any).standalone === true
    );
  }
  return false;
}

/** 管理者用フッターナビゲーション。募集期間のツールチップ表示にも対応 */
export function MasterFooter(_props: Readonly<MasterFooterProps>) {
  // --- Hooks ---
  const router = useRouter();
  const styles = useThemedStyles(createFooterStyles);
  const { colorScheme } = useMD3Theme();
  const masterTabs = useMemo(() => createMasterTabs(colorScheme), [colorScheme]);
  const { todayUnreadCount } = useTodoBadge();
  useExtendedFonts();
  const pathname = usePathname();
  const { user } = useAuth();

  // --- State ---
  const [period, setPeriod] = useState<ShiftSubmissionPeriod | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (user?.storeId) {
      loadActivePeriod();
    }
  }, [user?.storeId]);

  const loadActivePeriod = async () => {
    try {
      const periods = await ServiceProvider.shiftSubmissions.getActivePeriods(
        user?.storeId || ""
      );
      setPeriod(periods?.[0] ?? null);
    } catch (error) {
      console.warn("Failed to load active period:", error);
    }
  };

  // --- Handlers ---
  const getDaysUntilDeadline = (): number => {
    if (!period) return 0;
    return ServiceProvider.shiftSubmissions.getDaysUntilDeadline(period);
  };

  const isWithinPeriod = (): boolean => {
    if (!period) return false;
    return ServiceProvider.shiftSubmissions.isWithinPeriod(period);
  };

  const handleTabPress = (tab: TabItem) => {
    if (tab.isUnderDevelopment) {
      Alert.alert("開発中です！", "この機能は現在開発中です。");
      return;
    }

    // シフト追加タブの場合は期間チェックのみ実施
    if (tab.name === "create" && period) {
      const canSubmit = isWithinPeriod();
      const daysLeft = getDaysUntilDeadline();

      if (!canSubmit) {
        Alert.alert(
          "募集期間外です",
          daysLeft < 0 ? "募集期間が終了しています" : "まだ募集期間ではありません",
        );
        return;
      }
    }

    router.replace(tab.path);
  };

  // --- Render ---
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
      {masterTabs.map((tab, index) => {
        const active = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tab,
              tab.isUnderDevelopment && styles.disabledTab,
              {
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...(isPWA && {
                  minWidth: `${100 / masterTabs.length}%` as any,
                  maxWidth: `${100 / masterTabs.length}%` as any,
                }),
              },
            ]}
            onPress={() => handleTabPress(tab)}
            disabled={tab.isUnderDevelopment}
          >
            <View style={{ position: "relative" }}>
              {tab.icon(active)}
              {tab.name === "today" && todayUnreadCount > 0 && (
                <View style={{
                  position: "absolute", top: -4, right: -8,
                  minWidth: 16, height: 16, borderRadius: 8,
                  backgroundColor: "#D32F2F", justifyContent: "center", alignItems: "center",
                  paddingHorizontal: 3,
                }}>
                  <Text style={{ fontSize: 9, fontWeight: "700", color: "#fff" }}>
                    {todayUnreadCount > 99 ? "99+" : todayUnreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
                tab.isUnderDevelopment && styles.disabledLabel,
              ]}
            >
              {tab.label}
            </Text>

            {/* シフト追加アイコンの上にツールチップを表示 */}
            {tab.name === "create" && period && (
              <View
                style={{
                  position: "absolute",
                  bottom: "100%", // タブの真上
                  left: "50%", // タブの中央
                  transform: [{ translateX: -30 }], // ツールチップの中央を合わせる
                  backgroundColor: "#FF9800",
                  borderRadius: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  ...convertShadowForWeb({
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 6,
                  }),
                  zIndex: 1000,
                  marginBottom: 8,
                }}
              >
                {/* 吹き出しの三角形 */}
                <View
                  style={{
                    position: "absolute",
                    bottom: -6,
                    left: "50%",
                    marginLeft: -6,
                    width: 0,
                    height: 0,
                    borderLeftWidth: 6,
                    borderRightWidth: 6,
                    borderTopWidth: 6,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderTopColor: "#FF9800",
                  }}
                />

                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <Ionicons name="time-outline" size={12} color="#fff" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "#fff",
                    }}
                  >
                    {(() => {
                      if (isWithinPeriod()) {
                        return `締切まで ${getDaysUntilDeadline()}日`;
                      }
                      const daysLeft = getDaysUntilDeadline();
                      return daysLeft < 0 ? "募集期間終了" : "募集期間外";
                    })()}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
      {isPWA &&
        (globalThis.window?.document ? (
          <div className="pwa-footer-safearea master-footer-pwa" />
        ) : (
          <View
            style={{
              height: 10,
              width: "100%",
              backgroundColor: colorScheme.surfaceContainer,
            }}
          />
        ))}
    </View>
  );
}

export default MasterFooter;
