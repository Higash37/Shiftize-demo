/**
 * @file responsive.ts
 * @description レスポンシブデザイン用ユーティリティ。
 *              デバイスの画面幅に応じてサイズを自動切り替えする関数群を提供する。
 *
 * 【このファイルの位置づけ】
 * - BoundaryConstants.ts からブレークポイント（画面幅の閾値）を取得
 * - 各コンポーネントのスタイル定義で使用される
 * - 関連ファイル: BoundaryConstants.ts（BREAKPOINTS定数）
 *
 * 【レスポンシブデザインとは】
 * 画面サイズに応じてUIの表示を自動調整する設計手法。
 * スマートフォン、タブレット、PCなど、異なる画面サイズのデバイスで
 * 最適なUIを提供する。
 *
 * 【ブレークポイント（画面幅の分類）】
 * - Small Device（スマホ小）: 画面幅 < SMALL_DEVICE_MAX_WIDTH
 * - Normal（スマホ通常）: Small Device以上、Tablet未満
 * - Tablet:   TABLET_MIN_WIDTH 以上、TABLET_MAX_WIDTH 未満
 * - Large Tablet: TABLET_MAX_WIDTH 以上、DESKTOP_MIN_WIDTH 未満
 * - Desktop:  DESKTOP_MIN_WIDTH 以上
 *
 * 【Dimensions.get("window") の動作】
 * デバイスの画面サイズ（幅と高さ）を取得する React Native API。
 * ⚠️ 注意: この値はモジュール読み込み時に一度だけ取得される。
 * 画面回転時に値が更新されないため、動的な対応が必要な場合は
 * useWindowDimensions() フックを使用すること。
 */
import { Dimensions } from "react-native";
import { BREAKPOINTS } from "@/common/common-constants/BoundaryConstants";

// 画面サイズを取得（モジュール読み込み時に一度だけ実行）
// heightは現時点で未使用のため、widthのみ取得
const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * デバイスの種類を判定するフラグ定数
 *
 * 各フラグは画面幅に基づいて判定される。
 * BoundaryConstants.ts で定義されたブレークポイントを使用。
 *
 * 【EXCLUSIVE と INCLUSIVE の意味】
 * - _EXCLUSIVE（排他的）: その値を含まない（未満 <）
 * - _INCLUSIVE（包括的）: その値を含む（以上 >=）
 */

/** 小さいデバイス（狭い画面のスマートフォン）かどうか */
export const IS_SMALL_DEVICE = SCREEN_WIDTH < BREAKPOINTS.SMALL_DEVICE_MAX_WIDTH_EXCLUSIVE;
/** タブレットサイズかどうか（中程度の画面幅） */
export const IS_TABLET = SCREEN_WIDTH >= BREAKPOINTS.TABLET_MIN_WIDTH_INCLUSIVE && SCREEN_WIDTH < BREAKPOINTS.TABLET_MAX_WIDTH_EXCLUSIVE;
/** 大型タブレット（iPad Pro等）以上のサイズかどうか */
export const IS_LARGE_TABLET = SCREEN_WIDTH >= BREAKPOINTS.TABLET_MAX_WIDTH_EXCLUSIVE;
/** デスクトップ（PC）サイズかどうか */
export const IS_DESKTOP = SCREEN_WIDTH >= BREAKPOINTS.DESKTOP_MIN_WIDTH_INCLUSIVE;

/**
 * getResponsiveSize - デバイスサイズに応じた値を返すユーティリティ関数
 *
 * 画面幅に基づいて、5段階のサイズから適切な値を自動選択する。
 * 大きいデバイスから順にチェックし、最初にマッチした値を返す。
 *
 * 【使い方の例】
 * ```typescript
 * const padding = getResponsiveSize(8, 12, 16, 20, 24);
 * // スマホ小: 8, スマホ通常: 12, タブレット: 16, 大型タブレット: 20, PC: 24
 * ```
 *
 * @param smallSize - 小さいデバイス用の値
 * @param normalSize - 通常デバイス用の値
 * @param tabletSize - タブレット用の値（オプション）
 * @param largeTabletSize - 大型タブレット用の値（オプション）
 * @param desktopSize - デスクトップ用の値（オプション）
 * @returns デバイスに応じた値
 */
export const getResponsiveSize = (
  smallSize: number,
  normalSize: number,
  tabletSize?: number,
  largeTabletSize?: number,
  desktopSize?: number
): number => {
  // 大きいデバイスから順にチェック（デスクトップ → 大型タブレット → タブレット → 小 → 通常）
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
  // デフォルト（通常サイズのスマートフォン）
  return normalSize;
};

/**
 * getResponsiveFontSize - デバイスサイズに応じたフォントサイズを返す
 *
 * "small", "medium", "large" の3段階から選択し、
 * デバイスの画面幅に応じた具体的なピクセル数を返す。
 *
 * @param size - フォントサイズの段階（"small" | "medium" | "large"。デフォルト: "medium"）
 * @returns フォントサイズ（ピクセル数）
 */
export const getResponsiveFontSize = (
  size: "small" | "medium" | "large" = "medium"
): number => {
  if (size === "small") {
    // スマホ小:12, スマホ通常:14, タブレット:16, 大型タブレット:18, PC:20
    return getResponsiveSize(12, 14, 16, 18, 20);
  }
  if (size === "large") {
    return getResponsiveSize(16, 18, 22, 24, 28);
  }
  // medium（デフォルト）
  return getResponsiveSize(14, 16, 20, 22, 24);
};

/**
 * getResponsivePadding - デバイスサイズに応じたパディングを返す
 *
 * "small", "medium", "large" の3段階から選択し、
 * デバイスの画面幅に応じた具体的なピクセル数を返す。
 *
 * @param size - パディングの段階（"small" | "medium" | "large"。デフォルト: "medium"）
 * @returns パディング（ピクセル数）
 */
export const getResponsivePadding = (
  size: "small" | "medium" | "large" = "medium"
): number => {
  if (size === "small") {
    return getResponsiveSize(8, 12, 16, 20, 24);
  }
  if (size === "large") {
    return getResponsiveSize(16, 24, 32, 40, 48);
  }
  // medium（デフォルト）
  return getResponsiveSize(12, 16, 24, 32, 40);
};
