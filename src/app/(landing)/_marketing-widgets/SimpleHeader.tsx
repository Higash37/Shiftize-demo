import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { responsive, responsiveStyles, deviceInfo } from "../utils/responsive";

const SimpleHeader = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <MaterialIcons name="schedule" size={24} color="#ffffff" />
            </View>
            <View style={styles.logoAccent}>
              <MaterialIcons name="business" size={12} color="#3b82f6" />
            </View>
          </View>
          {!deviceInfo.isMobile && (
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Shiftize</Text>
              <Text style={styles.tagline}>シフト管理システム</Text>
            </View>
          )}
        </View>

        <View style={styles.rightContainer}>
          <View style={styles.headerInfo}>
            <View style={styles.previewBadge}>
              <MaterialIcons name="preview" size={14} color="#ffffff" />
              <Text style={styles.previewBadgeText}>開発中（プレビュー）</Text>
            </View>
            <View style={styles.versionBadge}>
              <MaterialIcons
                name="code"
                size={14}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.versionBadgeText}>v3.2.0</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => router.push("/(auth)/login?demo=true")}
          >
            <MaterialIcons
              name="play-circle-outline"
              size={16}
              color="#ffffff"
            />
            <Text style={styles.demoButtonText}>デモを試す</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.appButton}
            onPress={() => router.push("/(auth)")}
          >
            <MaterialIcons name="launch" size={16} color="#3b82f6" />
            <Text style={styles.appButtonText}>アプリを開く</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#3b82f6",
    paddingTop: responsive({
      mobile: 50,
      tablet: 50,
      desktop: 30,
      default: 50,
    }),
    paddingBottom: responsive({
      mobile: 16,
      tablet: 20,
      desktop: 24,
      default: 16,
    }),
    borderBottomWidth: 1,
    borderBottomColor: "#2563eb",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: responsiveStyles.padding(20),
    maxWidth: responsiveStyles.maxWidth(),
    alignSelf: "center",
    width: "100%",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    position: "relative",
    marginRight: 16,
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    elevation: 0,
  },
  logoAccent: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 0,
  },
  titleContainer: {
    alignItems: "flex-start",
  },
  title: {
    fontSize: responsive({
      mobile: 18,
      tablet: 20,
      desktop: 24,
      default: 20,
    }),
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  tagline: {
    fontSize: responsive({
      mobile: 10,
      tablet: 11,
      desktop: 12,
      default: 11,
    }),
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerInfo: {
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-end",
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  previewBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  versionBadgeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 10,
    fontWeight: "600",
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 0,
  },
  demoButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  appButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 0,
  },
  appButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SimpleHeader;
