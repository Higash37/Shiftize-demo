import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import Toast from "react-native-toast-message";
import {
  MaterialIcons,
  AntDesign,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { styles } from "./LayoutFooter.styles";
import { TabItem } from "./ui-layout-types";
import { FooterProps } from "./LayoutFooter.types";
import {
  ShiftSubmissionService,
  ShiftSubmissionPeriod,
} from "@/services/shift-submission/ShiftSubmissionService";
import { useAuth } from "@/services/auth/useAuth";
import { convertShadowForWeb } from "@/common/common-constants/ShadowConstants";
import { useExtendedFonts } from "@/common/common-utils/performance/fontLoader";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;

// 講師用フッターのタブ設定
const user_TABS: TabItem[] = [
  {
    name: "home",
    label: "ホーム",
    path: "/user/home",
    icon: (active: boolean) => (
      <MaterialIcons
        name="home"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  // ファイル機能は凍結中（使用率が低いため）
  // {
  //   name: "files",
  //   label: "ファイル",
  //   path: "/user/files",
  //   icon: (active: boolean) => (
  //     <MaterialIcons
  //       name="folder"
  //       size={IS_SMALL_DEVICE ? 20 : 24}
  //       color={active ? colors.primary : colors.text.secondary}
  //     />
  //   ),
  //   isUnderDevelopment: false,
  // },
  {
    name: "create",
    label: "シフト追加",
    path: "/user/shifts/create",
    icon: (active: boolean) => (
      // 通常のタブと同じ高さのデザイン
      <AntDesign
        name="plus"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "shifts",
    label: "シフト",
    path: "/user/shifts",
    icon: (active: boolean) => (
      <FontAwesome5
        name="calendar-alt"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "settings",
    label: "設定",
    path: "/user/settings",
    icon: (active: boolean) => (
      <Ionicons
        name="settings-outline"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
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

/**
 * Footer - 講師用フッターナビゲーションコンポーネント
 *
 * アプリケーションの下部に表示され、主要な画面間のナビゲーションを提供します。
 */
export function Footer(_props: Readonly<FooterProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // FontAwesome5フォントを遅延読み込み
  useExtendedFonts();

  const [period, setPeriod] = useState<ShiftSubmissionPeriod | null>(null);

  useEffect(() => {
    if (user?.storeId) {
      loadActivePeriod();
    }
  }, [user?.storeId]);

  const loadActivePeriod = async () => {
    try {
      const periods = await ShiftSubmissionService.getActivePeriods(
        user?.storeId || ""
      );
      setPeriod(periods.length > 0 ? periods[0] || null : null);
    } catch (error) {
      console.warn("Failed to load active period:", error);
    }
  };

  const getDaysUntilDeadline = (): number => {
    if (!period) return 0;
    return ShiftSubmissionService.getDaysUntilDeadline(period);
  };

  const isWithinPeriod = (): boolean => {
    if (!period) return false;
    return ShiftSubmissionService.isWithinPeriod(period);
  };

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

    // シフト追加タブの場合は期間チェックのみ実施
    if (tab.name === "create" && period) {
      const canSubmit = isWithinPeriod();
      const daysLeft = getDaysUntilDeadline();

      if (!canSubmit) {
        Toast.show({
          type: "error",
          text1: "募集期間外です",
          text2:
            daysLeft < 0
              ? "募集期間が終了しています"
              : "まだ募集期間ではありません",
          position: "bottom",
        });
        return;
      }
    }

    router.push(tab.path);
  };

  return (
    <>
      <View style={styles.footer}>
        {user_TABS.map((tab, index) => {
          // シフトタブは /user/shifts で始まるパスすべてをアクティブとする
          const active = tab.name === "shifts"
            ? pathname.startsWith(tab.path)
            : pathname === tab.path;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tab, tab.isUnderDevelopment && styles.disabledTab]}
              onPress={() => handleTabPress(tab)}
              disabled={tab.isUnderDevelopment}
            >
              {tab.icon(active)}
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
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
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
      </View>
      {isStandalonePWA() && Platform.OS === "web" && (
        <View
          style={{
            height: 10,
            width: "100%",
            backgroundColor: colors.footer.background,
          }}
        />
      )}
    </>
  );
}

export default Footer;
