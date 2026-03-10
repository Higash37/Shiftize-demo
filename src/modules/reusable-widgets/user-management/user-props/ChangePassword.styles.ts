/** @file ChangePassword.styles.ts
 *  @description パスワード変更モーダルのスタイル定義。
 *    モーダルオーバーレイ、入力欄、成功/エラーメッセージ、ボタンを管理する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: react-native の StyleSheet / MD3Theme
 *  - 利用先: ChangePassword コンポーネント
 *  - テーマを引数に取るファクトリ関数パターン
 */
import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createChangePasswordStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContent: {
      width: "85%",
      maxWidth: 400,
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.medium,
      padding: theme.spacing.xl,
      ...theme.elevation.level3.shadow,
    },
    container: {
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    input: {
      height: 40,
      borderColor: theme.colorScheme.outlineVariant,
      borderWidth: 1,
      marginBottom: theme.spacing.sm,
      paddingLeft: theme.spacing.sm,
      borderRadius: theme.shape.small,
    },
    title: {
      ...theme.typography.titleLarge,
      fontWeight: "600",
      marginBottom: theme.spacing.lg,
      color: theme.colorScheme.onSurface,
    },
    label: {
      ...theme.typography.bodyLarge,
      marginBottom: theme.spacing.xs,
      color: theme.colorScheme.onSurface,
    },
    message: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      borderRadius: theme.shape.small,
    },
    successMessage: {
      backgroundColor: theme.colorScheme.success + "20",
      color: theme.colorScheme.success,
    },
    errorMessage: {
      backgroundColor: theme.colorScheme.error + "20",
      color: theme.colorScheme.error,
    },
    buttonContainer: {
      marginTop: theme.spacing.lg,
    },
  });
