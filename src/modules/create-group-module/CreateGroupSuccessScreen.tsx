import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/common/common-constants/ColorConstants";
import { typography } from "@/common/common-constants/TypographyConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Button from "@/common/common-ui/ui-forms/FormButton";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { useAuth } from "@/services/auth/useAuth";

export const CreateGroupSuccessScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width > 768;
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // URL パラメーターからデータを取得
  const params = useLocalSearchParams();
  const groupName = (params["groupName"] as string) || "";
  const storeId = (params["storeId"] as string) || "";
  const memberCount = Number.parseInt((params["memberCount"] as string) || "0", 10);
  const adminNickname = (params["adminNickname"] as string) || "";
  const adminPassword = (params["adminPassword"] as string) || "";

  // メンバーデータをパース
  const membersData = params["membersData"]
    ? JSON.parse(params["membersData"] as string)
    : [];

  const [showPasswords, setShowPasswords] = useState(false);

  const handleGoToLogin = () => {
    router.replace("/(auth)/login");
  };

  const handleGoToManagement = async () => {
    if (isAuthenticated && user) {
      // 既にログイン済みの場合は直接管理画面へ
      router.replace("/(main)/master");
    } else {
      // ログインが必要な場合はログイン画面へ
      Alert.alert(
        "ログインが必要です",
        "管理画面にアクセスするにはログインしてください。",
        [
          {
            text: "ログインページへ",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    }
  };

  // ログイン情報をテキスト形式で生成
  const generateLoginInfoText = () => {
    let text = `グループ: ${groupName}\n店舗ID: ${storeId}\n\n`;
    text += `管理者情報:\n`;
    text += `ニックネーム: ${adminNickname}\n`;
    text += `ログイン方法: ${storeId}${adminNickname}\n`;
    text += `パスワード: ${adminPassword}\n\n`;

    if (membersData.length > 0) {
      text += `メンバー情報:\n`;
      membersData.forEach((member: any, index: number) => {
        text += `${index + 1}. ${member.nickname} (${
          member.role === "master" ? "管理者" : "一般ユーザー"
        })\n`;
        text += `   ログイン方法: ${storeId}${member.nickname}\n`;
        text += `   パスワード: ${member.password}\n`;
      });
    }

    text += `\nログイン手順:\n`;
    text += `1. アプリのログイン画面を開く\n`;
    text += `2. 「店舗ID + ニックネーム」欄に入力 (例: ${storeId}${adminNickname})\n`;
    text += `3. パスワードを入力してログイン\n`;

    return text;
  };

  // ログイン情報をテキスト形式で表示
  const showLoginInfo = () => {
    const text = generateLoginInfoText();
    Alert.alert(
      "ログイン情報",
      text,
      [
        {
          text: "閉じる",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Box variant="primary" padding="large" style={styles.header}>
        <Text style={styles.headerTitle}>グループ作成完了</Text>
      </Box>

      {/* Content */}
      <Box variant="default" padding="large" style={styles.content}>
        <View style={styles.successContainer}>
          {/* 成功アイコン */}
          <View style={styles.iconContainer}>
            <Text style={styles.successIcon}>✅</Text>
          </View>

          {/* 成功メッセージ */}
          <Text style={styles.successTitle}>
            グループが正常に作成されました！
          </Text>

          {/* 作成されたグループ情報 */}
          <View style={styles.groupInfoContainer}>
            <View style={styles.groupInfoItem}>
              <Text style={styles.groupInfoLabel}>グループ名</Text>
              <Text style={styles.groupInfoValue}>{groupName}</Text>
            </View>

            <View style={styles.groupInfoItem}>
              <Text style={styles.groupInfoLabel}>店舗ID</Text>
              <View style={styles.storeIdBox}>
                <Text style={styles.storeIdText}>{storeId}</Text>
              </View>
            </View>

            {memberCount > 0 && (
              <View style={styles.groupInfoItem}>
                <Text style={styles.groupInfoLabel}>初期メンバー数</Text>
                <Text style={styles.groupInfoValue}>
                  {memberCount}人が追加されました
                </Text>
              </View>
            )}

            {/* 認証状態デバッグ情報（開発時のみ表示） */}
            {__DEV__ && (
              <View style={styles.debugInfoContainer}>
                <Text style={styles.debugInfoTitle}>🔧 デバッグ情報</Text>
                <Text style={styles.debugInfoText}>
                  認証状態: {isAuthenticated ? "認証済み" : "未認証"}
                </Text>
                <Text style={styles.debugInfoText}>
                  ユーザーID: {user?.uid || "なし"}
                </Text>
                <Text style={styles.debugInfoText}>
                  ユーザーロール: {user?.role || "なし"}
                </Text>
                <Text style={styles.debugInfoText}>
                  ユーザー店舗ID: {user?.storeId || "なし"}
                </Text>
              </View>
            )}

            {/* ログイン情報セクション */}
            <View style={styles.loginInfoContainer}>
              <Text style={styles.loginInfoTitle}>📱 ログイン情報</Text>
              <Text style={styles.loginInfoDescription}>
                以下の情報をスタッフに共有してください
              </Text>

              {/* 管理者情報 */}
              <View style={styles.loginInfoCard}>
                <Text style={styles.loginInfoCardTitle}>👑 管理者</Text>
                <Text style={styles.loginInfoText}>
                  ニックネーム: {adminNickname}
                </Text>
                <Text style={styles.loginInfoText}>
                  ログイン: {storeId}
                  {adminNickname}
                </Text>
                <Text style={styles.loginInfoText}>
                  パスワード: {showPasswords ? adminPassword : "••••••••"}
                </Text>
              </View>

              {/* メンバー情報 */}
              {membersData.length > 0 && (
                <ScrollView style={styles.memberInfoScroll} nestedScrollEnabled>
                  <Text style={styles.memberInfoTitle}>
                    👥 メンバー ({membersData.length}人)
                  </Text>
                  {membersData.map((member: any, index: number) => (
                    <View key={index} style={styles.loginInfoCard}>
                      <View style={styles.memberInfoHeader}>
                        <View
                          style={[
                            styles.memberColorDot,
                            { backgroundColor: member.color },
                          ]}
                        />
                        <Text style={styles.loginInfoCardTitle}>
                          {member.nickname}{" "}
                          {member.role === "master" ? "(管理者)" : ""}
                        </Text>
                      </View>
                      <Text style={styles.loginInfoText}>
                        ログイン: {storeId}
                        {member.nickname}
                      </Text>
                      <Text style={styles.loginInfoText}>
                        パスワード:{" "}
                        {showPasswords ? member.password : "••••••••"}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* パスワード表示切替とコピーボタン */}
              <View style={styles.loginInfoActions}>
                <Button
                  title={
                    showPasswords ? "パスワードを隠す" : "パスワードを表示"
                  }
                  onPress={() => setShowPasswords(!showPasswords)}
                  variant="outline"
                  size="medium"
                  style={styles.togglePasswordButton}
                />
                <Button
                  title="情報を表示"
                  onPress={showLoginInfo}
                  variant="secondary"
                  size="medium"
                  style={styles.copyButton}
                />
              </View>
            </View>
          </View>

          {/* 注意事項 */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>📋 重要な情報</Text>
            <Text style={styles.noteText}>
              • この店舗IDをメンバーに共有してください{"\n"}•
              メンバーはこの店舗IDでログインできます{"\n"}•
              店舗IDは後から変更できません
            </Text>
          </View>

          {/* ボタン */}
          <View
            style={[
              styles.buttonContainer,
              isDesktop && styles.buttonContainerDesktop,
            ]}
          >
            <Button
              title="ログイン画面へ"
              onPress={handleGoToLogin}
              variant="outline"
              size="large"
              fullWidth={!isDesktop}
              style={isDesktop ? styles.buttonDesktop : undefined}
            />
            <Button
              title={
                isAuthenticated && user
                  ? "管理画面へ進む"
                  : "管理画面へログイン"
              }
              onPress={handleGoToManagement}
              variant="primary"
              size="large"
              loading={loading}
              fullWidth={!isDesktop}
              style={isDesktop ? styles.buttonDesktop : undefined}
            />
          </View>
        </View>
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.success,
    alignItems: "center",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: layout.borderRadius.large,
    borderBottomRightRadius: layout.borderRadius.large,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxlarge,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  successContainer: {
    alignItems: "center",
    gap: layout.padding.large,
  },
  iconContainer: {
    marginBottom: layout.padding.medium,
  },
  successIcon: {
    fontSize: 64,
  },
  successTitle: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: layout.padding.medium,
  },
  groupInfoContainer: {
    width: "100%",
    gap: layout.padding.medium,
    marginBottom: layout.padding.large,
  },
  groupInfoItem: {
    alignItems: "center",
  },
  groupInfoLabel: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
  },
  groupInfoValue: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
  storeIdBox: {
    backgroundColor: colors.selected,
    paddingHorizontal: layout.padding.large,
    paddingVertical: layout.padding.medium,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  storeIdText: {
    fontSize: typography.fontSize.xxlarge + 4,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.primary,
    letterSpacing: 4,
  },
  noteContainer: {
    backgroundColor: colors.background,
    padding: layout.padding.large,
    borderRadius: layout.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    width: "100%",
  },
  noteTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  noteText: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.small * 1.5,
  },
  buttonContainer: {
    gap: layout.padding.medium,
    width: "100%",
    marginTop: layout.padding.large,
  },
  buttonContainerDesktop: {
    flexDirection: "row",
    justifyContent: "center",
    width: "60%",
  },
  buttonDesktop: {
    flex: 1,
  },
  debugInfoContainer: {
    backgroundColor: colors.surface,
    padding: layout.padding.medium,
    borderRadius: layout.borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: layout.padding.medium,
    width: "100%",
  },
  debugInfoTitle: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
  },
  debugInfoText: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  loginInfoContainer: {
    backgroundColor: colors.surface,
    padding: layout.padding.medium,
    borderRadius: layout.borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: layout.padding.medium,
    width: "100%",
  },
  loginInfoTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  loginInfoDescription: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: layout.padding.medium,
  },
  loginInfoCard: {
    backgroundColor: colors.selected,
    padding: layout.padding.medium,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: layout.padding.medium,
  },
  loginInfoCardTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  loginInfoText: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  memberInfoScroll: {
    maxHeight: 150,
    marginTop: layout.padding.small,
  },
  memberInfoTitle: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
  },
  memberInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  memberColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: layout.padding.small,
  },
  loginInfoActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: layout.padding.medium,
  },
  togglePasswordButton: {
    flex: 1,
    marginRight: layout.padding.small,
  },
  copyButton: {
    flex: 1,
  },
});
