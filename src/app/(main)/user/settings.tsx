import React, { useState, useMemo, Suspense, lazy } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { Header } from "@/common/common-ui/ui-layout";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";

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
import { useRouter } from "expo-router";
import { AppVersion } from "../../../common/common-utils/util-version/AppVersion";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(() => createSettingsStyles(theme, bp), [theme, bp]);
  const { colorScheme } = theme;

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
      id: "line" as const,
      title: "LINE連携",
      subtitle: "準備中",
      icon: <AntDesign name="wechat" size={18} color={colorScheme.onPrimary} />,
      onPress: () => {},
      disabled: true,
    },
    {
      id: "password" as const,
      title: "パスワード変更",
      icon: <MaterialIcons name="lock-outline" size={18} color={colorScheme.onPrimary} />,
      onPress: () => setShowPasswordModal(true),
    },
    {
      id: "logout" as const,
      title: "ログアウト",
      icon: <MaterialIcons name="exit-to-app" size={18} color={colorScheme.onError} />,
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  const iconColors: Record<string, string> = {
    line: "#00B900",
    password: colorScheme.primary,
    logout: colorScheme.error,
  };

  return (
    <View style={styles.root}>
      <Header title="設定" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.contentContainer}>
          {/* ユーザー情報セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>アカウント情報</Text>
            <View style={styles.userInfoCard}>
              <View style={styles.userIcon}>
                <Ionicons name="person" size={32} color={colorScheme.primary} />
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
                        { backgroundColor: iconColors[item.id] },
                      ]}
                    >
                      {item.icon}
                    </View>
                    <View style={styles.itemText}>
                      <Text
                        style={[
                          styles.itemTitle,
                          item.isDestructive && styles.itemTitleDestructive,
                          item.disabled && styles.itemTitleDisabled,
                        ]}
                      >
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text
                          style={[
                            styles.itemSubtitle,
                            item.disabled && styles.itemTitleDisabled,
                          ]}
                        >
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <AntDesign
                    name="right"
                    size={13}
                    color={colorScheme.outlineVariant}
                  />
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

      {/* パスワード変更モーダル */}
      {showPasswordModal && (
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
      )}
    </View>
  );
}

const createSettingsStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
) => {
  const { isDesktop } = breakpoint;

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    scroll: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      alignItems: isDesktop ? "center" : undefined,
    },
    contentContainer: {
      flex: 1,
      width: "100%",
      ...(isDesktop ? { maxWidth: 800 } : {}),
    },
    section: {
      marginBottom: theme.spacing.xxxl,
    },
    sectionTitle: {
      ...theme.typography.titleMedium,
      fontWeight: "700",
      color: theme.colorScheme.onSurface,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    userInfoCard: {
      backgroundColor: theme.colorScheme.surface,
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.shape.small,
      padding: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      ...theme.elevation.level2.shadow,
    },
    userIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colorScheme.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.lg,
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.onSurface,
      marginBottom: 2,
    },
    userRole: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.primary,
      marginBottom: 2,
    },
    userId: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
    },
    settingsGroup: {
      backgroundColor: theme.colorScheme.surface,
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.shape.small,
      ...theme.elevation.level2.shadow,
    },
    settingsItem: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    settingsItemLast: {
      borderBottomWidth: 0,
    },
    settingsItemDisabled: {
      opacity: 0.5,
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    itemIcon: {
      width: 29,
      height: 29,
      borderRadius: theme.shape.small,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    itemText: {
      flex: 1,
    },
    itemTitle: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
    },
    itemTitleDestructive: {
      color: theme.colorScheme.error,
    },
    itemTitleDisabled: {
      color: theme.colorScheme.outlineVariant,
    },
    itemSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: 1,
    },
    appInfoCard: {
      backgroundColor: theme.colorScheme.surface,
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.shape.small,
      padding: theme.spacing.xl,
      alignItems: "center",
      ...theme.elevation.level2.shadow,
    },
    appName: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.xs,
    },
    appVersion: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
    },
  });
};
