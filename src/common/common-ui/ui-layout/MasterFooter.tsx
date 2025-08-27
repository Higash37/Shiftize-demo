import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import Toast from "react-native-toast-message";
import { styles } from "./LayoutFooter.styles";
import { TabItem } from "./ui-layout-types";
import { MasterFooterProps } from "./LayoutFooter.types";
import { ShiftSubmissionService, ShiftSubmissionPeriod } from "@/services/shift-submission/ShiftSubmissionService";
import { useAuth } from "@/services/auth/useAuth";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
      <AntDesign
        name="plus"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
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
    path: "/master/master-settings",
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
  const { user } = useAuth();
  
  const [period, setPeriod] = useState<ShiftSubmissionPeriod | null>(null);

  useEffect(() => {
    if (user?.storeId) {
      loadActivePeriod();
    }
  }, [user?.storeId]);

  const loadActivePeriod = async () => {
    try {
      const periods = await ShiftSubmissionService.getActivePeriods(user?.storeId || "");
      console.log("MasterFooter - 読み込んだ期間:", periods);
      setPeriod(periods.length > 0 ? periods[0] : null);
    } catch (error) {
      console.error("期間の読み込みエラー:", error);
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
    
    // シフト追加タブの場合は期間チェック
    if (tab.name === "create" && period) {
      const canSubmit = isWithinPeriod();
      const daysLeft = getDaysUntilDeadline();
      
      if (!canSubmit) {
        Toast.show({
          type: "error",
          text1: "募集期間外です",
          text2: daysLeft < 0 ? "募集期間が終了しています" : "まだ募集期間ではありません",
          position: "bottom",
        });
        return;
      }
      
      if (daysLeft <= 3) {
        Toast.show({
          type: "info",
          text1: "締切間近！",
          text2: `締切まであと${daysLeft}日です`,
          position: "bottom",
        });
      }
    }
    
    router.push(tab.path);
  };

  const isPWA = isStandalonePWA();

  return (
    <>
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
                  backgroundColor: "#ff9800",
                  borderRadius: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 6,
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
                    borderTopColor: "#ff9800",
                  }}
                />
                
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Ionicons 
                    name="time-outline" 
                    size={12} 
                    color="#fff" 
                  />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "#fff"
                  }}>
                    {isWithinPeriod() 
                      ? `締切まで ${getDaysUntilDeadline()}日` 
                      : getDaysUntilDeadline() < 0 
                        ? "募集期間終了" 
                        : "募集期間外"}
                  </Text>
                </View>
              </View>
            )}
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
    </>
  );
}

export default MasterFooter;
