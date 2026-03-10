/**
 * @file WelcomeScreen.tsx
 * @description ウェルカム画面（初回起動時やログアウト後に表示される画面）。
 *
 * この画面が表示するもの:
 *   - アプリロゴとキャッチコピー（ヘッダー部分）
 *   - 「新規グループを作成」ボタン → グループ作成画面へ遷移
 *   - 「グループに参加」ボタン → ログイン画面へ遷移
 *   - サービス紹介モーダル（?アイコンから開く）
 *   - フッターの案内テキスト
 *
 * 画面遷移の流れ:
 *   ウェルカム画面 → 「新規グループを作成」 → CreateGroupScreen
 *   ウェルカム画面 → 「グループに参加」    → LoginForm（ログイン画面）
 *
 * React.FC:
 *   `React.FC` は React Function Component の型。
 *   Props がない場合は `React.FC` だけで OK（ジェネリクス不要）。
 */

import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// SafeAreaView: iPhoneのノッチやAndroidのステータスバーを避けて表示するためのコンポーネント
import { SafeAreaView } from "react-native-safe-area-context";
// router: expo-routerの画面遷移用オブジェクト。push()で遷移、replace()で履歴を置き換え
import { router } from "expo-router";
// AntDesign: Ant Design のアイコンライブラリ
import { AntDesign } from "@expo/vector-icons";
// 再利用可能なボタンコンポーネント
import Button from "@/common/common-ui/ui-forms/FormButton";
// カード風のUIラッパーコンポーネント
import Box from "@/common/common-ui/ui-base/BoxComponent";
// サービス紹介モーダル（アプリの機能説明を表示する）
import { ServiceIntroModal } from "@/modules/reusable-widgets/service-intro/ServiceIntroModal";
// MD3テーマ関連
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const WelcomeScreen: React.FC = () => {
  // --- Hooks ---

  // テーマオブジェクトを取得（色、フォント、スペーシング等）
  const theme = useMD3Theme();

  // ブレークポイント情報を取得
  // bp = { isMobile: boolean, isTablet: boolean, isDesktop: boolean }
  const bp = useBreakpoint();

  // 分割代入で isDesktop だけ取り出す
  const { isDesktop } = bp;

  // --- State ---

  // サービス紹介モーダルの表示/非表示を管理する state
  const [showServiceIntro, setShowServiceIntro] = useState(false);

  // useMemo でテーマとブレークポイントが変わったときだけスタイルを再生成
  const styles = useMemo(() => createWelcomeStyles(theme, bp), [theme, bp]);

  // テーマから colorScheme を取り出す（JSX内で短く書くため）
  const { colorScheme } = theme;

  // --- Handlers ---

  /**
   * 「新規グループを作成」ボタンのハンドラ。
   * router.push() は画面遷移。戻るボタンで元の画面に戻れる。
   * ※ router.replace() だと履歴を上書きするので戻れなくなる
   */
  const handleCreateGroup = () => {
    router.push("/(auth)/auth-create-group");
  };

  /**
   * 「グループに参加」ボタンのハンドラ。
   * ログイン画面へ遷移する。
   */
  const handleJoinGroup = () => {
    router.push("/(auth)/login");
  };

  // --- Render ---

  return (
    <SafeAreaView style={styles.container}>
      {/* Header: アプリロゴとキャッチコピーを表示する領域 */}
      <Box variant="primary" padding="large" style={styles.header}>
        <View style={styles.headerContainer}>
          {/* Left: Spacer（右側のアイコンとバランスを取るための空白領域） */}
          <View style={styles.headerSpacer} />

          {/* Center: Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.logo}>Shiftize</Text>
            <Text style={styles.subtitle}>シフト管理を簡単に</Text>
          </View>

          {/* Right: ヘルプアイコン */}
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowServiceIntro(true)}
            >
              {/* AntDesign アイコン: question-circle（?マーク付き丸アイコン） */}
              <AntDesign
                name="question-circle"
                size={24}
                color={colorScheme.onPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Box>

      {/* Content: メイン領域 */}
      <Box variant="default" padding="large" style={styles.content}>
        <Text style={styles.welcomeText}>始めましょう</Text>
        <Text style={styles.description}>
          {/* {"\n"} はJSX内で改行を入れるための書き方 */}
          新しいグループを作成するか、{"\n"}既存のグループに参加してください
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/*
           * Button コンポーネントの主要Props:
           *   - variant: ボタンのスタイル種別 "primary" | "outline" | "secondary" 等
           *   - size: ボタンサイズ "small" | "medium" | "large"
           *   - fullWidth: trueにすると横幅いっぱいに広がる
           *   - style: 追加のカスタムスタイル
           */}
          <Button
            title="新規グループを作成"
            onPress={handleCreateGroup}
            variant="primary"
            size="large"
            // デスクトップでなければ横幅いっぱい、デスクトップなら固定幅
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

      {/* Footer: 案内テキスト */}
      <Box variant="default" padding="medium" style={styles.footer}>
        <Text style={styles.footerText}>
          既にアカウントをお持ちの場合は{"\n"}
          「グループに参加」からログインしてください
        </Text>
      </Box>

      {/*
       * サービス紹介モーダル
       * visible が true のとき表示される。
       * onClose が呼ばれたら state を false にして閉じる。
       */}
      <ServiceIntroModal
        visible={showServiceIntro}
        onClose={() => setShowServiceIntro(false)}
      />
    </SafeAreaView>
  );
};

/**
 * WelcomeScreen のスタイルファクトリ関数。
 * テーマとブレークポイントを受け取り、StyleSheetを返す。
 *
 * @param theme      - MD3テーマオブジェクト（色、フォント、スペーシング等）
 * @param breakpoint - 画面サイズ判定 { isMobile, isTablet, isDesktop }
 * @returns StyleSheet.create() で生成されたスタイルオブジェクト
 */
const createWelcomeStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean },
) => {
  const { isDesktop } = breakpoint;

  return StyleSheet.create({
    container: {
      flex: 1, // flex: 1 で親コンテナの残り領域を全て占有する
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
    },
    header: {
      // 上の角だけ丸くせず、下の角だけ丸くすることで、画面上部にピッタリくっつく形にする
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: theme.shape.large,
      borderBottomRightRadius: theme.shape.large,
      minHeight: 80,
    },
    headerContainer: {
      flexDirection: "row", // 子要素を横並びにする
      alignItems: "center", // 縦方向の中央揃え
      justifyContent: "space-between", // 左端・中央・右端に均等配置
      width: "100%",
    },
    titleContainer: {
      alignItems: "center",
      flex: 1, // 残りスペースを全て使う（中央に配置するため）
    },
    headerSpacer: {
      width: 80, // 右側のアイコン幅と同じにして左右バランスを取る
    },
    headerIcons: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md, // 子要素間のスペース（CSS gapと同じ）
    },
    iconButton: {
      padding: theme.spacing.sm, // タップ領域を広げるためのパディング
    },
    logo: {
      ...theme.typography.headlineMedium, // スプレッド演算子でフォントスタイルを展開
      color: theme.colorScheme.onPrimary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onPrimary,
      opacity: 0.9, // わずかに透明にしてサブテキスト感を出す
    },
    content: {
      flex: 1,
      justifyContent: "flex-start", // 上詰め配置
      paddingTop: theme.spacing.xxl,
      overflow: "hidden", // はみ出した要素を隠す
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
      // デスクトップのみ中央寄せ。スプレッド演算子でオブジェクトを条件付きマージ
      ...(isDesktop ? { alignItems: "center" as const } : {}),
    },
    buttonDesktop: {
      width: "40%", // デスクトップではボタン幅を40%に制限
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
      opacity: 0.7, // 薄く表示して補助テキスト感を出す
    },
  });
};
