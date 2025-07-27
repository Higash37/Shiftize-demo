import { StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../../common-theme/ThemeDefinition";
import { layout } from "../../../common-constants/LayoutConstants";
import { shadows } from "../../../common-constants/ShadowConstants";
import { BoxStyleName } from "./BoxTypes";

/**
 * Box コンポーネントのスタイル定義
 */
export const styles = StyleSheet.create({
  base: {
    borderRadius: layout.borderRadius.medium,
  },
  default: {
    backgroundColor: theme.colors.background,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: layout.components.card,
    ...shadows.card,
  },
  outlined: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: layout.borderRadius.medium,
    ...shadows.small,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: layout.borderRadius.medium,
  },
  padding_small: {
    padding: layout.padding.small,
  },
  padding_medium: {
    padding: layout.padding.medium,
  },
  padding_large: {
    padding: layout.padding.large,
  },
  padding_none: {
    padding: 0,
  },
  margin_small: {
    margin: layout.padding.small,
  },
  margin_medium: {
    margin: layout.padding.medium,
  },
  margin_large: {
    margin: layout.padding.large,
  },
  margin_none: {
    margin: 0,
  },
}) as Record<BoxStyleName, ViewStyle>;
