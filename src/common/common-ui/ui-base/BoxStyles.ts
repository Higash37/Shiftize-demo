/** @file BoxStyles.ts @description Boxコンポーネントのテーマ連動スタイル定義 */
import { StyleSheet, ViewStyle } from "react-native";
import { MD3Theme } from "../../common-theme/md3/MD3Theme.types";
import { BoxStyleName } from "./BoxTypes";

export const createBoxStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: theme.shape.medium,
    },
    default: {
      backgroundColor: theme.colorScheme.surface,
    },
    primary: {
      backgroundColor: theme.colorScheme.primary,
    },
    secondary: {
      backgroundColor: theme.colorScheme.secondary,
    },
    card: {
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.medium,
      ...theme.elevation.level1.shadow,
    },
    outlined: {
      backgroundColor: theme.colorScheme.surface,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.medium,
      ...theme.elevation.level1.shadow,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colorScheme.outline,
      borderRadius: theme.shape.medium,
    },
    surface: {
      backgroundColor: theme.colorScheme.surface,
    },
    surfaceContainer: {
      backgroundColor: theme.colorScheme.surfaceContainer,
    },
    surfaceContainerHigh: {
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
    },
    surfaceContainerLow: {
      backgroundColor: theme.colorScheme.surfaceContainerLow,
    },
    padding_small: {
      padding: theme.spacing.sm,
    },
    padding_medium: {
      padding: theme.spacing.lg,
    },
    padding_large: {
      padding: theme.spacing.xxl,
    },
    padding_none: {
      padding: 0,
    },
    margin_small: {
      margin: theme.spacing.sm,
    },
    margin_medium: {
      margin: theme.spacing.lg,
    },
    margin_large: {
      margin: theme.spacing.xxl,
    },
    margin_none: {
      margin: 0,
    },
  }) as Record<BoxStyleName, ViewStyle>;
