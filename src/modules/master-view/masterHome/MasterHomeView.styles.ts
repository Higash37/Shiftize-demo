import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { theme } from "@/common/common-theme/ThemeDefinition";
import { IS_TABLET, IS_SMALL_DEVICE } from "@/common/common-utils/util-style";

export const masterHomeViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    width: IS_TABLET ? 480 : "90%",
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    padding: IS_TABLET ? theme.spacing.lg : theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: IS_TABLET ? 40 : 10,
    marginBottom: IS_TABLET ? 40 : 10,
    minHeight: 250, // 高さバグ対策
  },
  title: {
    fontSize: IS_TABLET ? 32 : theme.typography.fontSize.large,
    fontWeight: "bold", // 型安全な値に修正
    color: colors.text.primary,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: IS_TABLET ? 20 : theme.typography.fontSize.medium,
    color: colors.text.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
    fontWeight: "400", // 追加: サブタイトルは通常
  },
});
