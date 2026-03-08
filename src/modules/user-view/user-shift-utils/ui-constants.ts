import { colors } from "@/common/common-theme/ThemeColors";
import { StyleSheet, Dimensions } from "react-native";
import { BREAKPOINTS } from "@/common/common-constants/BoundaryConstants";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < BREAKPOINTS.SMALL_DEVICE_MAX_WIDTH_EXCLUSIVE;
const IS_TABLET = SCREEN_WIDTH >= BREAKPOINTS.TABLET_MIN_WIDTH_INCLUSIVE && SCREEN_WIDTH < BREAKPOINTS.TABLET_MAX_WIDTH_EXCLUSIVE;


/**
 * シフトUI用の共通スタイル定数
 */
export const shiftUIConstants = {
  spacing: {
    xs: IS_SMALL_DEVICE ? 2 : 4,
    sm: IS_SMALL_DEVICE ? 6 : 8,
    md: IS_SMALL_DEVICE ? 12 : 16,
    lg: IS_SMALL_DEVICE ? 20 : 24,
    xl: IS_SMALL_DEVICE ? 28 : 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  fontSize: {
    sm: IS_SMALL_DEVICE ? 10 : 12,
    md: IS_SMALL_DEVICE ? 12 : 14,
    lg: IS_SMALL_DEVICE ? 14 : 16,
    xl: IS_SMALL_DEVICE ? 16 : 18,
  },
};

/**
 * 共通のスタイルミキシン
 */
export const shiftUIStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: shiftUIConstants.borderRadius.md,
    padding: shiftUIConstants.spacing.md,
  },
  section: {
    marginBottom: shiftUIConstants.spacing.lg,
  },
  title: {
    fontSize: shiftUIConstants.fontSize.lg,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: shiftUIConstants.spacing.sm,
  },
  label: {
    fontSize: shiftUIConstants.fontSize.md,
    color: colors.text.secondary,
    marginBottom: shiftUIConstants.spacing.xs,
  },
  input: {
    padding: shiftUIConstants.spacing.md,
    backgroundColor: colors.surface,
    borderRadius: shiftUIConstants.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    padding: shiftUIConstants.spacing.md,
    backgroundColor: colors.primary,
    borderRadius: shiftUIConstants.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.text.white,
    fontSize: shiftUIConstants.fontSize.md,
    fontWeight: "bold",
  },
  icon: {
    color: colors.text.primary,
  },
});
