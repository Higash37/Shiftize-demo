import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useAuth } from "@/services/auth/useAuth";

type Provider = "google" | "apple";

interface LinkedIdentity {
  provider: string;
  email?: string;
}

export const AccountLinkingSection: React.FC = () => {
  const { user } = useAuth();
  const [identities, setIdentities] = useState<LinkedIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Provider | null>(null);

  const loadIdentities = useCallback(async () => {
    try {
      const data = await ServiceProvider.auth.getLinkedIdentities();
      setIdentities(data);
    } catch (_) {
      // 取得失敗は空配列のまま
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIdentities();
  }, [loadIdentities]);

  const isLinked = (provider: Provider) =>
    identities.some((id) => id.provider === provider);

  const getLinkedEmail = (provider: Provider) =>
    identities.find((id) => id.provider === provider)?.email;

  const handleLink = async (provider: Provider) => {
    setActionLoading(provider);
    try {
      await ServiceProvider.auth.linkOAuthIdentity(provider);
    } catch (error: any) {
      Alert.alert("エラー", error.message || "連携に失敗しました");
      setActionLoading(null);
    }
  };

  const handleUnlink = (provider: Provider) => {
    const providerName = provider === "google" ? "Google" : "Apple";
    Alert.alert(
      "連携解除",
      `${providerName}アカウントの連携を解除しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "解除",
          style: "destructive",
          onPress: async () => {
            setActionLoading(provider);
            try {
              // Google解除時はカレンダーデータもクリア
              if (provider === "google" && user) {
                await ServiceProvider.googleCalendar
                  .clearCalendarData(user.uid)
                  .catch(() => {});
              }
              await ServiceProvider.auth.unlinkOAuthIdentity(provider);
              await loadIdentities();
            } catch (error: any) {
              Alert.alert("エラー", error.message || "解除に失敗しました");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const renderGoogleRow = () => {
    const linked = isLinked("google");
    const email = getLinkedEmail("google");
    const isLoading = actionLoading === "google";

    return (
      <TouchableOpacity
        style={styles.settingsItem}
        onPress={linked ? undefined : () => handleLink("google")}
        disabled={linked || isLoading}
        activeOpacity={linked ? 1 : 0.6}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.itemIcon, { backgroundColor: "#4285F4" }]}>
            <AntDesign name="google" size={18} color="#fff" />
          </View>
          <View style={styles.itemText}>
            <Text style={styles.itemTitle}>Google</Text>
            {linked && email ? (
              <Text style={styles.itemSubtitle}>{email}</Text>
            ) : (
              <Text style={styles.itemSubtitleMuted}>未連携</Text>
            )}
          </View>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : linked ? (
          <TouchableOpacity
            style={styles.unlinkButton}
            onPress={() => handleUnlink("google")}
          >
            <Text style={styles.unlinkButtonText}>解除</Text>
          </TouchableOpacity>
        ) : (
          <AntDesign name="right" size={13} color="#c7c7cc" />
        )}
      </TouchableOpacity>
    );
  };

  const renderAppleRow = () => {
    return (
      <View style={[styles.settingsItem, styles.settingsItemLast, styles.settingsItemDisabled]}>
        <View style={styles.itemLeft}>
          <View style={[styles.itemIcon, { backgroundColor: "#000" }]}>
            <MaterialCommunityIcons name="apple" size={18} color="#fff" />
          </View>
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: "#c7c7cc" }]}>Apple</Text>
            <Text style={styles.itemSubtitleMuted}>準備中</Text>
          </View>
        </View>
        <Text style={styles.comingSoonBadge}>準備中</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アカウント連携</Text>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>アカウント連携</Text>
      <View style={styles.settingsGroup}>
        {renderGoogleRow()}
        {renderAppleRow()}
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
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 1,
  },
  itemSubtitleMuted: {
    fontSize: 13,
    color: "#c7c7cc",
    marginTop: 1,
  },
  unlinkButton: {
    backgroundColor: "#f2f2f7",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  unlinkButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FF3B30",
  },
  comingSoonBadge: {
    fontSize: 12,
    color: "#FF9500",
    backgroundColor: "#FF9500" + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: "600" as const,
    overflow: "hidden" as const,
  },
  loadingCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 20,
    alignItems: "center" as const,
  },
};
