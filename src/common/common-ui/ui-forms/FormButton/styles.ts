import { StyleSheet } from "react-native";
import { theme } from "../../../common-theme/ThemeDefinition";
import { layout } from "../../../common-constants/LayoutConstants";
import { shadows } from "../../../common-constants/ShadowConstants";
import { ButtonStyleName } from "./types";

/**
 * ボタンコンポーネントのスタイル定義
 */
export const styles = StyleSheet.create({
  base: {
    borderRadius: layout.components.button,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...shadows.small, // アウトラインボタンにも軽いシャドウ
  },
  size_small: {
    paddingVertical: layout.padding.small,
    paddingHorizontal: layout.padding.medium,
  },
  size_medium: {
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.large,
  },
  size_large: {
    paddingVertical: layout.padding.large,
    paddingHorizontal: layout.padding.xlarge,
  },
  size_compact: {
    paddingVertical: layout.padding.small * 2.04,
    paddingHorizontal: layout.padding.large,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "700", // bold
  },
  text_primary: {
    color: theme.colors.text?.white || "#FFFFFF",
  },
  text_secondary: {
    color: theme.colors.text?.white || "#FFFFFF",
  },
  text_outline: {
    color: theme.colors.primary,
  },
  text_small: {
    fontSize: theme.typography.fontSize.small,
  },
  text_medium: {
    fontSize: theme.typography.fontSize.medium,
  },
  text_large: {
    fontSize: theme.typography.fontSize.large,
  },
  text_compact: {
    fontSize: theme.typography.fontSize.medium,
  },
}) as Record<ButtonStyleName, any>;
