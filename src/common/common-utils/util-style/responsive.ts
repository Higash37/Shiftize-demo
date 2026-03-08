// スマホ/タブレット/PC判定の共通ユーティリティ
// 他のresponsive-constants.tsから移植・共通化
import { Dimensions } from "react-native";
import { BREAKPOINTS } from "@/common/common-constants/BoundaryConstants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
export const IS_SMALL_DEVICE = SCREEN_WIDTH < BREAKPOINTS.SMALL_DEVICE_MAX_WIDTH_EXCLUSIVE;
export const IS_TABLET = SCREEN_WIDTH >= BREAKPOINTS.TABLET_MIN_WIDTH_INCLUSIVE && SCREEN_WIDTH < BREAKPOINTS.TABLET_MAX_WIDTH_EXCLUSIVE;
export const IS_LARGE_TABLET = SCREEN_WIDTH >= BREAKPOINTS.TABLET_MAX_WIDTH_EXCLUSIVE;
export const IS_DESKTOP = SCREEN_WIDTH >= BREAKPOINTS.DESKTOP_MIN_WIDTH_INCLUSIVE;

export const getResponsiveSize = (
  smallSize: number,
  normalSize: number,
  tabletSize?: number,
  largeTabletSize?: number,
  desktopSize?: number
): number => {
  if (IS_DESKTOP && desktopSize !== undefined) {
    return desktopSize;
  }
  if (IS_LARGE_TABLET && largeTabletSize !== undefined) {
    return largeTabletSize;
  }
  if (IS_TABLET && tabletSize !== undefined) {
    return tabletSize;
  }
  if (IS_SMALL_DEVICE) {
    return smallSize;
  }
  return normalSize;
};

export const getResponsiveFontSize = (
  size: "small" | "medium" | "large" = "medium"
): number => {
  if (size === "small") {
    return getResponsiveSize(12, 14, 16, 18, 20);
  }
  if (size === "large") {
    return getResponsiveSize(16, 18, 22, 24, 28);
  }
  return getResponsiveSize(14, 16, 20, 22, 24);
};

export const getResponsivePadding = (
  size: "small" | "medium" | "large" = "medium"
): number => {
  if (size === "small") {
    return getResponsiveSize(8, 12, 16, 20, 24);
  }
  if (size === "large") {
    return getResponsiveSize(16, 24, 32, 40, 48);
  }
  return getResponsiveSize(12, 16, 24, 32, 40);
};
