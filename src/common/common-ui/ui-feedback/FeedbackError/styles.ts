import { StyleSheet } from "react-native";
import { theme } from "../../../common-theme/ThemeDefinition";
import { layout } from "../../../common-constants/LayoutConstants";

/**
 * ErrorMessageコンポーネントのスタイル定義
 */
export const styles = StyleSheet.create({
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.small,
    marginTop: layout.padding.small,
    fontWeight: "500",
  },
});
