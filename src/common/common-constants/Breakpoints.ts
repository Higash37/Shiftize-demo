import { useWindowDimensions } from "react-native";

/**
 * MD3準拠のブレークポイント定義
 * アプリ全体で統一されたレスポンシブ判定に使用
 */
export const breakpoints = {
  /** モバイル: 0-599 */
  mobile: 0,
  /** タブレット: 600-1023 */
  tablet: 600,
  /** デスクトップ: 1024+ */
  desktop: 1024,
} as const;

export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * 現在のブレークポイントを返すフック
 *
 * @example
 * const { isMobile, isTablet, isDesktop, breakpoint } = useBreakpoint();
 * if (isDesktop) { ... }
 */
export const useBreakpoint = () => {
  const { width } = useWindowDimensions();

  const isMobile = width < breakpoints.tablet;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
  const isDesktop = width >= breakpoints.desktop;

  const breakpoint: Breakpoint = isDesktop
    ? "desktop"
    : isTablet
      ? "tablet"
      : "mobile";

  return { isMobile, isTablet, isDesktop, breakpoint, width } as const;
};
