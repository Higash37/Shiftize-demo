/**
 * @file Breakpoints.ts
 * @description MD3準拠のブレークポイント定義とレスポンシブ判定フック
 */
import { useWindowDimensions } from "react-native";

/** 画面幅の閾値（px） */
export const breakpoints = {
  /** モバイル: 0-599 */
  mobile: 0,
  /** タブレット: 600-1023 */
  tablet: 600,
  /** デスクトップ: 1024+ */
  desktop: 1024,
} as const;

/** ブレークポイント名 */
export type Breakpoint = "mobile" | "tablet" | "desktop";

/** 現在の画面幅からブレークポイントを判定して返すフック */
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
