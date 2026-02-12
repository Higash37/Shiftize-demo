import React, { useState, Suspense, lazy } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Header } from "@/common/common-ui/ui-layout";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";

// LineAuthModalを遅延読み込み
const LineAuthModal = lazy(() =>
  import("@/modules/reusable-widgets/line-integration/LineAuthModal").then(module => ({ default: module.LineAuthModal }))
);
// AccountLinkingSectionを遅延読み込み
const AccountLinkingSection = lazy(() =>
  import("@/modules/reusable-widgets/account-linking/AccountLinkingSection").then(module => ({ default: module.AccountLinkingSection }))
);
// CalendarSyncToggleを遅延読み込み
const CalendarSyncToggle = lazy(() =>
  import("@/modules/reusable-widgets/calendar-sync/CalendarSyncToggle").then(module => ({ default: module.CalendarSyncToggle }))
);
import { useAuth } from "@/services/auth/useAuth";
import { AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { useRouter } from "expo-router";
import { AppVersion } from "../../../common/common-utils/util-version/AppVersion";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showLineAuthModal, setShowLineAuthModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // PC表示用の幅調整
  const { width: screenWidth } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";
  const isLargeScreen = screenWidth > 768;
  const contentWidth =
    isWeb && isLargeScreen ? screenWidth * 0.65 : screenWidth;

  const handleLogout = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const settingsItems = [
    {
      id: "line",
      title: "LINE連携",
      subtitle: "準備中",
      icon: <AntDesign name="wechat" size={18} color="#fff" />,
      onPress: () => {}, // 何もしない
      disabled: true,
    },
    {
      id: "password",
      title: "パスワード変更",
      icon: <MaterialIcons name="lock-outline" size={18} color="#fff" />,
      onPress: () => setShowPasswordModal(true),
    },
    {
      id: "logout",
      title: "ログアウト",
      icon: <MaterialIcons name="exit-to-app" size={18} color="#fff" />,
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f7" }}>
      <Header title="設定" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContainer,
          isWeb &&
            isLargeScreen && {
              alignItems: "center",
              paddingHorizontal: 0,
            },
        ]}
      >
        <View
          style={[
            styles.contentContainer,
            isWeb &&
              isLargeScreen && {
                width: contentWidth,
                maxWidth: 800,
              },
          ]}
        >
          {/* ユーザー情報セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>アカウント情報</Text>
            <View style={styles.userInfoCard}>
              <View style={styles.userIcon}>
                <Ionicons name="person" size={32} color={colors.primary} />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {user?.nickname || "ユーザー"}
                </Text>
                <Text style={styles.userRole}>
                  {user?.role === "master" ? "教室長" : "講師"}
                </Text>
                <Text style={styles.userId}>
                  ID: {user?.uid?.substring(0, 8)}...
                </Text>
              </View>
            </View>
          </View>

          {/* アカウント連携セクション */}
          <Suspense fallback={null}>
            <AccountLinkingSection />
          </Suspense>

          {/* Googleカレンダー同期セクション */}
          {user?.uid && (
            <Suspense fallback={null}>
              <CalendarSyncToggle uid={user.uid} />
            </Suspense>
          )}

          {/* 設定項目セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>設定</Text>
            <View style={styles.settingsGroup}>
              {settingsItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingsItem,
                    index === settingsItems.length - 1 &&
                      styles.settingsItemLast,
                    item.disabled && styles.settingsItemDisabled,
                  ]}
                  onPress={item.disabled ? undefined : item.onPress}
                  disabled={item.disabled}
                >
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.itemIcon,
                        item.id === "line" && { backgroundColor: "#00B900" },
                        item.id === "password" && {
                          backgroundColor: "#007AFF",
                        },
                        item.id === "logout" && { backgroundColor: "#FF3B30" },
                      ]}
                    >
                      {item.icon}
                    </View>
                    <View style={styles.itemText}>
                      <Text
                        style={[
                          styles.itemTitle,
                          item.isDestructive && { color: "#FF3B30" },
                          item.disabled && { color: "#c7c7cc" },
                        ]}
                      >
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text
                          style={[
                            styles.itemSubtitle,
                            item.disabled && { color: "#c7c7cc" },
                          ]}
                        >
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <AntDesign name="right" size={13} color="#c7c7cc" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* アプリ情報セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>アプリ情報</Text>
            <View style={styles.appInfoCard}>
              <Text style={styles.appName}>{AppVersion.getAppName()}</Text>
              <Text style={styles.appVersion}>{AppVersion.getFormattedVersion()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* LINE連携モーダル - 現在無効化 */}
      {false && showLineAuthModal && (
        <Suspense fallback={null}>
          <LineAuthModal
            visible={showLineAuthModal}
            onClose={() => setShowLineAuthModal(false)}
            onSuccess={() => {
              setShowLineAuthModal(false);
              Alert.alert("成功", "LINE連携が完了しました！");
            }}
          />
        </Suspense>
      )}

      {/* パスワード変更モーダル */}
      {showPasswordModal && (
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
      )}
    </View>
  );
}

const styles = {
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 0,
  },
  contentContainer: {
    flex: 1,
    width: "100%" as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: colors.text.secondary,
    marginHorizontal: 16,
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  userInfoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  userIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f2f2f7",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "400" as const,
    marginBottom: 2,
  },
  userId: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  settingsGroup: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 10,
  },
  settingsItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    borderBottomWidth: 0.5,
    borderBottomColor: "#c6c6c8",
  },
  settingsItemLast: {
    borderBottomWidth: 0,
  },
  settingsItemDisabled: {
    opacity: 0.6,
  },
  itemLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  itemIcon: {
    width: 29,
    height: 29,
    borderRadius: 6,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "400" as const,
    color: colors.text.primary,
  },
  itemSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 1,
  },
  appInfoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 20,
    alignItems: "center" as const,
  },
  appName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
};
