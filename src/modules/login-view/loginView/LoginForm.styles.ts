/**
 * @file LoginForm.styles.ts
 * @description LoginFormコンポーネントのスタイル定義ファイル。
 *
 * MD3（Material Design 3）テーマに基づくスタイルファクトリ関数を定義している。
 * 「ファクトリ関数」とは、テーマやブレークポイントを引数に受け取り、
 * それに応じたスタイルオブジェクトを「生成して返す」関数のこと。
 *
 * なぜファクトリ関数を使うのか:
 *   - ダークモード/ライトモードで色を切り替えるため
 *   - モバイル/タブレット/デスクトップでレイアウトを変えるため
 *   - テーマの値（spacing, typography等）を直接参照するため
 *
 * 画面サイズごとの分岐:
 *   - モバイル: デフォルトのスタイル（幅100%）
 *   - タブレット: 幅80%、最大600px
 *   - デスクトップ: 幅60%、最大500px
 */

import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

/**
 * LoginForm MD3スタイルファクトリ
 */
export const createLoginFormStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
) => {
  const { isTablet, isDesktop } = breakpoint;
  const isTabletOrDesktop = isTablet || isDesktop;

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
      // タブレット以上では中央寄せにする
      // `as const` は TypeScript に「この値は変わらないリテラル型だよ」と伝える書き方
      ...(isTabletOrDesktop ? { alignItems: "center" as const } : {}),
    },
    formCard: {
      marginBottom: theme.spacing.xl,
      // 三項演算子のネスト: タブレットなら80%幅、デスクトップなら60%幅、モバイルはデフォルト
      ...(isTablet
        ? { width: "80%", maxWidth: 600 }
        : isDesktop
          ? { width: "60%", maxWidth: 500 }
          : {}),
    },
    // ヘッダー
    titleContainer: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      ...theme.typography.headlineSmall,
      color: theme.colorScheme.onSurface,
      textAlign: "center", // "left" | "center" | "right" | "auto" | "justify" から選べる
    },
    // エラー
    errorContainer: {
      backgroundColor: theme.colorScheme.errorContainer,
      padding: theme.spacing.md,
      borderRadius: theme.shape.small,
      marginBottom: theme.spacing.lg,
    },
    errorText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onErrorContainer,
      textAlign: "center",
      fontWeight: "500", // "100"〜"900" | "normal" | "bold" から選べる
    },
    // 入力フィールド
    inputGroup: {
      marginBottom: theme.spacing.xl,
    },
    labelContainer: {
      flexDirection: "row", // "row" | "column" | "row-reverse" | "column-reverse" から選べる
      alignItems: "center", // "flex-start" | "center" | "flex-end" | "stretch" | "baseline" から選べる
      marginBottom: theme.spacing.sm,
    },
    labelIcon: {
      marginRight: theme.spacing.sm,
    },
    label: {
      ...theme.typography.bodyMedium,
      fontWeight: "500",
      color: theme.colorScheme.onSurfaceVariant,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colorScheme.outline,
      borderRadius: theme.shape.extraSmall,
      padding: theme.spacing.md,
      fontSize: 16,
      backgroundColor: "transparent",
      color: theme.colorScheme.onSurface,
    },
    // ログインボタン
    loginButton: {
      backgroundColor: theme.colorScheme.primary,
      padding: theme.spacing.lg,
      borderRadius: theme.shape.full,
      alignItems: "center",
      width: "100%",
      ...theme.elevation.level1.shadow,
    },
    loginButtonDisabled: {
      opacity: 0.38,
    },
    loginButtonText: {
      ...theme.typography.labelLarge,
      color: theme.colorScheme.onPrimary,
    },
    // デモリンク
    demoLink: {
      marginTop: theme.spacing.xl,
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    demoLinkText: {
      ...theme.typography.labelLarge,
      color: theme.colorScheme.primary,
      textDecorationLine: "underline",
      textAlign: "center",
    },
    // デモモーダル
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.32)",
      justifyContent: "center", // "flex-start" | "center" | "flex-end" | "space-between" | "space-around" から選べる
      alignItems: "center",
      padding: theme.spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      borderRadius: theme.shape.extraLarge,
      padding: theme.spacing.xxl,
      width: "100%",
      maxWidth: 400,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xl,
    },
    modalTitle: {
      ...theme.typography.titleLarge,
      color: theme.colorScheme.onSurface,
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalDescription: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      marginBottom: theme.spacing.xxl,
      textAlign: "center",
      lineHeight: 20,
    },
    modalButtonGroup: {
      gap: theme.spacing.md,
    },
    // デモボタン - 教室長
    demoButtonMaster: {
      backgroundColor: theme.colorScheme.primaryContainer,
      borderWidth: 2,
      borderColor: theme.colorScheme.primary,
      borderRadius: theme.shape.medium,
      padding: theme.spacing.lg,
      alignItems: "center",
    },
    demoButtonMasterTitle: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.primary,
      marginBottom: theme.spacing.xs,
    },
    // デモボタン - 講師
    demoButtonTeacher: {
      backgroundColor: theme.colorScheme.tertiaryContainer,
      borderWidth: 2,
      borderColor: theme.colorScheme.tertiary,
      borderRadius: theme.shape.medium,
      padding: theme.spacing.lg,
      alignItems: "center",
    },
    demoButtonTeacherTitle: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.tertiary,
      marginBottom: theme.spacing.xs,
    },
    demoButtonSub: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
    },
    demoButtonCaption: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: theme.spacing.xs,
    },
  });
};
