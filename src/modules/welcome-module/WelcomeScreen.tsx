import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { typography } from "@/common/common-constants/TypographyConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Button from "@/common/common-ui/ui-forms/FormButton";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { ServiceIntroModal } from "@/modules/reusable-widgets/service-intro/ServiceIntroModal";

export const WelcomeScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width > 768; // PC画面の判定
  const [showServiceIntro, setShowServiceIntro] = useState(false);
  const handleCreateGroup = () => {
    // 新規グループ作成画面に遷移
    router.push("/(auth)/create-group");
  };

  const handleJoinGroup = () => {
    // ログイン画面に遷移
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Box variant="primary" padding="large" style={styles.header}>
        <View style={styles.headerContainer}>
          {/* Left: Spacer */}
          <View style={styles.headerSpacer} />
          
          {/* Center: Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.logo}>Shiftize</Text>
            <Text style={styles.subtitle}>シフト管理をもっと簡単に</Text>
          </View>
          
          {/* Right: Icons */}
          <View style={styles.headerIcons}>
            {/* Help/Support Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowServiceIntro(true)}
            >
              <AntDesign name="questioncircleo" size={24} color="white" />
            </TouchableOpacity>
            
            {/* Landing Page Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/(landing)")}
            >
              <AntDesign name="home" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Box>

      {/* Content */}
      <Box variant="default" padding="large" style={styles.content}>
        <Text style={styles.welcomeText}>始めましょう</Text>
        <Text style={styles.description}>
          新しいグループを作成するか、{"\n"}
          既存のグループに参加してください
        </Text>

        {/* Buttons */}
        <View
          style={[
            styles.buttonContainer,
            isDesktop && styles.buttonContainerDesktop,
          ]}
        >
          <Button
            title="新規グループを作成"
            onPress={handleCreateGroup}
            variant="primary"
            size="large"
            fullWidth={!isDesktop}
            style={isDesktop ? styles.buttonDesktop : undefined}
          />

          <Button
            title="グループに参加"
            onPress={handleJoinGroup}
            variant="outline"
            size="large"
            fullWidth={!isDesktop}
            style={isDesktop ? styles.buttonDesktop : undefined}
          />
        </View>
      </Box>

      {/* Footer */}
      <Box variant="default" padding="medium" style={styles.footer}>
        <Text style={styles.footerText}>
          既にアカウントをお持ちの場合は{"\n"}
          「グループに参加」からログインしてください
        </Text>
      </Box>

      {/* サービス紹介モーダル */}
      <ServiceIntroModal
        visible={showServiceIntro}
        onClose={() => setShowServiceIntro(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: layout.borderRadius.large,
    borderBottomRightRadius: layout.borderRadius.large,
    minHeight: Platform.OS === "web" ? 120 : undefined, // PWA時の固定高さ
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  titleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 80, // アイコン2つ分の幅 + gap + padding (24 * 2 + 12 + 8 * 2)
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  logo: {
    fontSize: typography.fontSize.xxlarge + 8, // 32px equivalent
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.white,
    marginBottom: layout.padding.small,
  },
  subtitle: {
    fontSize: typography.fontSize.large,
    color: colors.text.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: Platform.OS === "web" ? "flex-start" : "center", // PWA時は上揃え
    paddingTop: Platform.OS === "web" ? layout.padding.large : 0, // PWA時の上部余白
    overflow: Platform.OS === "web" ? "hidden" : "visible", // PWA時のoverflow制御
  },
  welcomeText: {
    fontSize: typography.fontSize.xxlarge,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: layout.padding.medium,
  },
  description: {
    fontSize: typography.fontSize.large,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: layout.padding.large * 1.5,
  },
  buttonContainer: {
    gap: layout.padding.medium,
  },
  buttonContainerDesktop: {
    alignItems: "center",
  },
  buttonDesktop: {
    width: "40%",
  },
  footer: {
    minHeight: Platform.OS === "web" ? 80 : undefined, // PWA時の固定高さ
  },
  footerText: {
    fontSize: typography.fontSize.small + 2, // 14px equivalent
    color: colors.text.disabled,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
});
