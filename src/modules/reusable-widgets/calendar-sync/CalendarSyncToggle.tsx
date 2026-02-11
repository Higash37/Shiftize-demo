import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ServiceProvider } from "@/services/ServiceProvider";

interface CalendarSyncToggleProps {
  uid: string;
}

export const CalendarSyncToggle: React.FC<CalendarSyncToggleProps> = ({ uid }) => {
  const [enabled, setEnabled] = useState(false);
  const [hasTokens, setHasTokens] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const status = await ServiceProvider.googleCalendar.getSyncStatus(uid);
      setEnabled(status.enabled);
      setHasTokens(status.hasTokens);
    } catch (_) {
      // 読み込み失敗は無視
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleToggle = async (value: boolean) => {
    setToggling(true);
    try {
      if (value && !hasTokens) {
        // トークンがない → Calendar scopeでOAuth再認証
        await ServiceProvider.auth.linkGoogleWithCalendarScope();
        // リダイレクトされるのでここには戻らない
        return;
      }

      await ServiceProvider.googleCalendar.setSyncEnabled(uid, value);
      setEnabled(value);
    } catch (error: any) {
      Alert.alert("エラー", error.message || "設定の変更に失敗しました");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>カレンダー同期</Text>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>カレンダー同期</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingsItem}>
          <View style={styles.itemLeft}>
            <View style={[styles.itemIcon, { backgroundColor: "#4285F4" }]}>
              <MaterialIcons name="event" size={18} color="#fff" />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Googleカレンダー同期</Text>
              <Text style={styles.itemSubtitle}>
                {enabled
                  ? "承認済みシフトを自動同期中"
                  : "承認済みシフトをGoogleカレンダーに同期"}
              </Text>
            </View>
          </View>
          {toggling ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ false: "#e9e9ea", true: "#34C759" }}
              thumbColor="#fff"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = {
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
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 1,
  },
  loadingCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 20,
    alignItems: "center" as const,
  },
};
