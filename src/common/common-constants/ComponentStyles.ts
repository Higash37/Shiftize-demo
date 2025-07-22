import { ViewStyle } from "react-native";
import { layout } from "./LayoutConstants";
import { shadows } from "./ShadowConstants";
import { colors } from "@/common/common-theme/ThemeColors";

/**
 * 共通コンポーネントスタイル定義
 * アプリ全体で統一されたデザインを適用するためのスタイルセット
 */

// カードスタイル
export const cardStyles: ViewStyle = {
  borderRadius: layout.components.card,
  backgroundColor: colors.background,
  ...shadows.card,
  padding: layout.padding.medium,
};

// ボタンスタイル
export const buttonStyles = {
  primary: {
    borderRadius: layout.components.button,
    ...shadows.button,
    backgroundColor: colors.primary,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.large,
  } as ViewStyle,

  secondary: {
    borderRadius: layout.components.button,
    ...shadows.button,
    backgroundColor: colors.secondary,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.large,
  } as ViewStyle,

  outline: {
    borderRadius: layout.components.button,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "transparent",
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.large,
  } as ViewStyle,
};

// 入力フィールドスタイル
export const inputStyles: ViewStyle = {
  borderRadius: layout.components.input,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.background,
  paddingVertical: layout.padding.medium,
  paddingHorizontal: layout.padding.medium,
  ...shadows.small,
};

// モーダルスタイル
export const modalStyles: ViewStyle = {
  borderRadius: layout.components.modal,
  backgroundColor: colors.background,
  ...shadows.modal,
  margin: layout.padding.large,
};

// ヘッダースタイル
export const headerStyles: ViewStyle = {
  backgroundColor: colors.primary,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: layout.headerFooter.borderRadius.header,
  borderBottomRightRadius: layout.headerFooter.borderRadius.header,
  ...shadows.header,
  padding: layout.padding.large,
};

// フッタースタイル
export const footerStyles: ViewStyle = {
  backgroundColor: colors.background,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  borderTopLeftRadius: layout.headerFooter.borderRadius.footer,
  borderTopRightRadius: layout.headerFooter.borderRadius.footer,
  ...shadows.footer,
  padding: layout.padding.medium,
};

// コンテナスタイル
export const containerStyles = {
  // 基本コンテナ
  basic: {
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.background,
    padding: layout.padding.medium,
  } as ViewStyle,

  // 影付きコンテナ
  elevated: {
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.background,
    padding: layout.padding.medium,
    ...shadows.card,
  } as ViewStyle,

  // 大きな角丸コンテナ
  rounded: {
    borderRadius: layout.borderRadius.xlarge,
    backgroundColor: colors.background,
    padding: layout.padding.large,
    ...shadows.card,
  } as ViewStyle,
};

// リストアイテムスタイル
export const listItemStyles: ViewStyle = {
  borderRadius: layout.borderRadius.medium,
  backgroundColor: colors.background,
  padding: layout.padding.medium,
  marginVertical: layout.padding.small / 2,
  ...shadows.small,
};

// 全体的なページスタイル
export const pageStyles = {
  // 標準ページ
  standard: {
    flex: 1,
    backgroundColor: colors.surface,
  } as ViewStyle,

  // パディング付きページ
  withPadding: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: layout.padding.medium,
  } as ViewStyle,

  // 中央寄せページ
  centered: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    padding: layout.padding.large,
  } as ViewStyle,
};
