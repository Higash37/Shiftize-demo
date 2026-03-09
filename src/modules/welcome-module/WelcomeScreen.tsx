import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import Button from "@/common/common-ui/ui-forms/FormButton";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { ServiceIntroModal } from "@/modules/reusable-widgets/service-intro/ServiceIntroModal";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const WelcomeScreen: React.FC = () => {
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const { isDesktop } = bp;
  const [showServiceIntro, setShowServiceIntro] = useState(false);
  const styles = useMemo(() => createWelcomeStyles(theme, bp), [theme, bp]);
  const { colorScheme } = theme;

  const handleCreateGroup = () => {
    router.push("/(auth)/auth-create-group");
  };

  const handleJoinGroup = () => {
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
            <Text style={styles.subtitle}>シフト管理を簡単に</Text>
          </View>

          {/* Right: Icons */}
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowServiceIntro(true)}
            >
              <AntDesign
                name="question-circle"
                size={24}
                color={colorScheme.onPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Box>

      {/* Content */}
      <Box variant="default" padding="large" style={styles.content}>
        <Text style={styles.welcomeText}>始めましょう</Text>
        <Text style={styles.description}>
          新しいグループを作成するか、{"\n"}既存のグループに参加してください
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
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

const createWelcomeStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean },
) => {
  const { isDesktop } = breakpoint;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    header: {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: theme.shape.large,
      borderBottomRightRadius: theme.shape.large,
      minHeight: 80,
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
      width: 80,
    },
    headerIcons: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    iconButton: {
      padding: theme.spacing.sm,
    },
    logo: {
      ...theme.typography.headlineMedium,
      color: theme.colorScheme.onPrimary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onPrimary,
      opacity: 0.9,
    },
    content: {
      flex: 1,
      justifyContent: "flex-start",
      paddingTop: theme.spacing.xxl,
      overflow: "hidden",
    },
    welcomeText: {
      ...theme.typography.headlineSmall,
      color: theme.colorScheme.onSurface,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    description: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: theme.spacing.xxxl,
    },
    buttonContainer: {
      gap: theme.spacing.lg,
      ...(isDesktop ? { alignItems: "center" as const } : {}),
    },
    buttonDesktop: {
      width: "40%",
    },
    footer: {
      minHeight: 80,
    },
    footerText: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: theme.spacing.lg,
      opacity: 0.7,
    },
  });
};
