import { ViewStyle } from "react-native";
import { layout } from "../../common-constants/LayoutConstants";
import { shadows } from "../../common-constants/ShadowConstants";
import { colors } from "../../common-constants/ColorConstants";

/**
 * スタイルユーティリティ関数
 *
 * 動的にスタイルを生成するためのヘルパー関数群。
 * React NativeのViewStyleを生成・拡張するためのユーティリティです。
 */

/**
 * 角丸を適用する関数
 *
 * @param baseStyle - ベースとなるスタイル
 * @param radius - 角丸のサイズ（layout.borderRadiusのキー）
 * @returns 角丸が適用されたスタイル
 */
export const withBorderRadius = (
  baseStyle: ViewStyle,
  radius: keyof typeof layout.borderRadius = "medium"
): ViewStyle => ({
  ...baseStyle,
  borderRadius: layout.borderRadius[radius],
});

/**
 * シャドウを適用する関数
 *
 * @param baseStyle - ベースとなるスタイル
 * @param shadowType - シャドウのタイプ（shadowsのキー）
 * @returns シャドウが適用されたスタイル
 */
export const withShadow = (
  baseStyle: ViewStyle,
  shadowType: keyof typeof shadows = "medium"
): ViewStyle => ({
  ...baseStyle,
  ...shadows[shadowType],
});

/**
 * パディングを適用する関数
 *
 * @param baseStyle - ベースとなるスタイル
 * @param paddingSize - パディングのサイズ（layout.paddingのキー）
 * @returns パディングが適用されたスタイル
 */
export const withPadding = (
  baseStyle: ViewStyle,
  paddingSize: keyof typeof layout.padding = "medium"
): ViewStyle => ({
  ...baseStyle,
  padding: layout.padding[paddingSize],
});

/**
 * カードスタイルを生成する関数
 *
 * @param borderRadius - 角丸のサイズ（layout.borderRadiusのキー）
 * @param shadowType - シャドウのタイプ（shadowsのキー）
 * @param backgroundColor - 背景色（デフォルト: colors.background）
 * @returns カード用のスタイル
 */
export const createCardStyle = (
  borderRadius: keyof typeof layout.borderRadius = "medium",
  shadowType: keyof typeof shadows = "card",
  backgroundColor: string = colors.background
): ViewStyle => ({
  borderRadius: layout.borderRadius[borderRadius],
  backgroundColor,
  ...shadows[shadowType],
  padding: layout.padding.medium,
});

/**
 * ボタンスタイルを生成する関数
 *
 * @param variant - ボタンのバリアント（primary, secondary, outline）
 * @param size - ボタンのサイズ（small, medium, large）
 * @returns ボタン用のスタイル
 */
export const createButtonStyle = (
  variant: "primary" | "secondary" | "outline" = "primary",
  size: "small" | "medium" | "large" = "medium"
): ViewStyle => {
  const sizeMap = {
    small: {
      paddingVertical: layout.padding.small,
      paddingHorizontal: layout.padding.medium,
    },
    medium: {
      paddingVertical: layout.padding.medium,
      paddingHorizontal: layout.padding.large,
    },
    large: {
      paddingVertical: layout.padding.large,
      paddingHorizontal: layout.padding.xlarge,
    },
  };

  const variantMap = {
    primary: {
      backgroundColor: colors.primary,
      ...shadows.button,
    },
    secondary: {
      backgroundColor: colors.secondary,
      ...shadows.button,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary,
    },
  };

  return {
    borderRadius: layout.components.button,
    alignItems: "center",
    justifyContent: "center",
    ...sizeMap[size],
    ...variantMap[variant],
  };
};

/**
 * ヘッダー用スタイルを生成する関数
 *
 * @param backgroundColor - 背景色（デフォルト: colors.primary）
 * @param withTopRadius - 上部の角丸を適用するかどうか
 * @returns ヘッダー用のスタイル
 */
export const createHeaderStyle = (
  backgroundColor: string = colors.primary,
  withTopRadius: boolean = false
): ViewStyle => ({
  backgroundColor,
  borderTopLeftRadius: withTopRadius
    ? layout.headerFooter.borderRadius.header
    : 0,
  borderTopRightRadius: withTopRadius
    ? layout.headerFooter.borderRadius.header
    : 0,
  borderBottomLeftRadius: layout.headerFooter.borderRadius.header,
  borderBottomRightRadius: layout.headerFooter.borderRadius.header,
  ...shadows.header,
  padding: layout.padding.large,
});

/**
 * フッター用スタイルを生成する関数
 *
 * @param backgroundColor - 背景色（デフォルト: colors.background）
 * @param withBottomRadius - 下部の角丸を適用するかどうか
 * @returns フッター用のスタイル
 */
export const createFooterStyle = (
  backgroundColor: string = colors.background,
  withBottomRadius: boolean = false
): ViewStyle => ({
  backgroundColor,
  borderTopLeftRadius: layout.headerFooter.borderRadius.footer,
  borderTopRightRadius: layout.headerFooter.borderRadius.footer,
  borderBottomLeftRadius: withBottomRadius
    ? layout.headerFooter.borderRadius.footer
    : 0,
  borderBottomRightRadius: withBottomRadius
    ? layout.headerFooter.borderRadius.footer
    : 0,
  ...shadows.footer,
  padding: layout.padding.medium,
});

/**
 * インプット用スタイルを生成する関数
 *
 * ⚠️ 注意: ボーダーカラーの優先順位は「エラー > フォーカス > デフォルト」です。
 * エラー状態とフォーカス状態が同時に存在する場合、エラー状態が優先されます。
 *
 * @param focused - フォーカス状態かどうか
 * @param error - エラー状態かどうか
 * @returns インプット用のスタイル
 */
export const createInputStyle = (
  focused: boolean = false,
  error: boolean = false
): ViewStyle => {
  // ボーダーカラーを決定（エラー > フォーカス > デフォルトの優先順位）
  let borderColor = colors.border;
  if (error) {
    borderColor = colors.error;
  } else if (focused) {
    borderColor = colors.primary;
  }

  return {
    borderRadius: layout.components.input,
    borderWidth: focused ? 2 : 1,
    borderColor,
    backgroundColor: colors.background,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.medium,
    ...shadows.small,
  };
};

/**
 * モーダル用スタイルを生成する関数
 *
 * @param fullScreen - フルスクリーンモーダルかどうか
 * @returns モーダル用のスタイル
 */
export const createModalStyle = (fullScreen: boolean = false): ViewStyle => ({
  borderRadius: fullScreen ? 0 : layout.components.modal,
  backgroundColor: colors.background,
  ...shadows.modal,
  margin: fullScreen ? 0 : layout.padding.large,
});
