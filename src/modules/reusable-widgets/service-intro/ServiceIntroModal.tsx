import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Alert,
  StyleSheet,
  Pressable,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/common/common-constants/ThemeConstants";

interface ServiceIntroModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ServiceIntroModal({
  visible,
  onClose,
}: ServiceIntroModalProps) {
  const router = useRouter();

  const handleLinkPress = async (url: string, title: string) => {
    try {
      // 内部ルートの場合はExpo Routerを使用
      if (url.startsWith("/(")) {
        onClose();
        router.push(url as any);
      } else {
        // 外部URLの場合はLinkingを使用
        await Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert("エラー", `${title}を開けませんでした`);
    }
  };

  const menuItems = [
    {
      icon: "home",
      title: "サービス紹介サイト",
      description: "機能詳細や導入事例を確認",
      url: "/(landing)/home",
      color: colors.primary,
    },
    {
      icon: "play-circle",
      title: "デモ環境",
      description: "実際の操作を体験",
      url: "/(auth)/login?demo=true",
      color: "#4CAF50",
    },
    {
      icon: "book",
      title: "ヘルプ・使い方",
      description: "詳細な操作方法を確認",
      url: "https://github.com/Higashionna/shift-scheduler-app",
      color: "#FF9800",
    },
    {
      icon: "mail",
      title: "お問い合わせ",
      description: "ご質問・ご要望はこちら",
      url: "mailto:higashionna37@icloud.com",
      color: "#9C27B0",
    },
    {
      icon: "github",
      title: "開発について",
      description: "技術情報・開発ストーリー",
      url: "https://github.com/Higashionna",
      color: "#607D8B",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <AntDesign name="appstore-o" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Shiftize</Text>
                <Text style={styles.subtitle}>シフト管理システム</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* コンテンツ */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* 概要セクション */}
            <View style={styles.overviewSection}>
              <Text style={styles.overviewTitle}>このアプリについて</Text>
              <Text style={styles.overviewText}>
                大学3年生が開発した、塾・カフェ・小売店向けのシフト管理システムです。
                {"\n\n"}
                シフト時間の中に授業時間を埋め込めることが出来る。効率的な店舗運営をサポートします。
              </Text>

              {/* 統計 */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>81,631</Text>
                  <Text style={styles.statLabel}>行のコード</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>1</Text>
                  <Text style={styles.statLabel}>導入店舗</Text>
                </View>
              </View>
            </View>

            {/* メニュー */}
            <View style={styles.menuSection}>
              <Text style={styles.menuTitle}>詳細情報・関連リンク</Text>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handleLinkPress(item.url, item.title)}
                >
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <AntDesign
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <AntDesign
                    name="right"
                    size={16}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* 開発者情報 */}
            <View style={styles.developerSection}>
              <Text style={styles.developerTitle}>開発者</Text>
              <View style={styles.developerInfo}>
                <View style={styles.developerAvatar}>
                  <Text style={styles.developerAvatarText}>東</Text>
                </View>
                <View style={styles.developerContent}>
                  <Text style={styles.developerName}>青山学院大学生</Text>
                  <Text style={styles.developerDescription}>
                    3年生・次年度休学予定
                  </Text>
                  <Text style={styles.developerTech}>
                    React Native × TypeScript × Firebase
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%" as any,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold" as any,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  overviewSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: "bold" as any,
    color: colors.text.primary,
    marginBottom: 12,
  },
  overviewText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold" as any,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  menuSection: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold" as any,
    color: colors.text.primary,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: "600" as any,
    color: colors.text.primary,
  },
  menuItemDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  developerSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  developerTitle: {
    fontSize: 16,
    fontWeight: "bold" as any,
    color: colors.text.primary,
    marginBottom: 16,
  },
  developerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  developerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  developerAvatarText: {
    fontSize: 20,
    fontWeight: "bold" as any,
    color: "white",
  },
  developerContent: {
    flex: 1,
  },
  developerName: {
    fontSize: 16,
    fontWeight: "bold" as any,
    color: colors.text.primary,
  },
  developerDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  developerTech: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
    fontWeight: "500" as any,
  },
});
