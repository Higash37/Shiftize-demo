import { StyleSheet } from "react-native";
import { theme } from "../../../common-theme/ThemeDefinition";
import { layout } from "../../../common-constants/LayoutConstants";
import { shadows } from "../../../common-constants/ShadowConstants";
import { InputStyleName } from "./types";

/**
 * Inputコンポーネントのスタイル定義
 */
export const styles = StyleSheet.create({
  container: {
    marginBottom: layout.padding.medium,
  },
  label: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text?.secondary,
    marginBottom: layout.padding.small,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: layout.components.input,
    padding: layout.padding.medium,
    fontSize: Math.max(theme.typography.fontSize.medium, 16), // ズーム防止のため16px以上
    color: theme.colors.text?.primary,
    // 影は削除（よりクリーンな見た目）
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  helperText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text?.secondary,
    marginTop: layout.padding.small,
  },
  errorText: {
    color: theme.colors.error,
  },
});
