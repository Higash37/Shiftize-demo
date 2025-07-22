import { ViewStyle, TextStyle } from "react-native";
import { layout } from "./LayoutConstants";
import { colors } from "./ColorConstants";
import { typography } from "./TypographyConstants";
import { shadows } from "./ShadowConstants";

/**
 * 包括的なデザインシステム定義
 * ウェルカムページのような統一された美しいデザインを全体に適用
 */

// ページ全体のレイアウトスタイル
export const pageStyles = {
  // メインコンテナ
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  } as ViewStyle,

  // 安全エリア付きコンテナ
  safeContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  } as ViewStyle,

  // コンテンツエリア
  content: {
    flex: 1,
    padding: layout.padding.large,
  } as ViewStyle,

  // 中央寄せコンテンツ
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: layout.padding.large,
  } as ViewStyle,
};

// ヘッダー・フッター専用スタイル
export const layoutStyles = {
  // 標準ヘッダー（下部角丸）
  header: {
    backgroundColor: colors.primary,
    paddingVertical: layout.padding.large,
    paddingHorizontal: layout.padding.large,
    borderBottomLeftRadius: layout.headerFooter.borderRadius.header,
    borderBottomRightRadius: layout.headerFooter.borderRadius.header,
    ...shadows.header,
  } as ViewStyle,

  // プライマリヘッダー（ウェルカムページスタイル）
  headerPrimary: {
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingVertical: layout.padding.large,
    paddingHorizontal: layout.padding.large,
    borderBottomLeftRadius: layout.borderRadius.large,
    borderBottomRightRadius: layout.borderRadius.large,
    ...shadows.medium,
  } as ViewStyle,

  // 標準フッター（上部角丸）
  footer: {
    backgroundColor: colors.background,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.large,
    borderTopLeftRadius: layout.headerFooter.borderRadius.footer,
    borderTopRightRadius: layout.headerFooter.borderRadius.footer,
    ...shadows.footer,
  } as ViewStyle,

  // フッターボタンコンテナ
  footerButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: layout.padding.medium,
  } as ViewStyle,
};

// カード・コンテナスタイル
export const cardStyles = {
  // 基本カード
  card: {
    backgroundColor: colors.background,
    borderRadius: layout.components.card,
    padding: layout.padding.medium,
    ...shadows.card,
  } as ViewStyle,

  // エレベーションカード
  elevatedCard: {
    backgroundColor: colors.background,
    borderRadius: layout.components.card,
    padding: layout.padding.large,
    ...shadows.elevated,
  } as ViewStyle,

  // アウトラインカード
  outlineCard: {
    backgroundColor: colors.background,
    borderRadius: layout.components.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: layout.padding.medium,
    ...shadows.small,
  } as ViewStyle,

  // プライマリカード
  primaryCard: {
    backgroundColor: colors.primary,
    borderRadius: layout.components.card,
    padding: layout.padding.large,
    ...shadows.card,
  } as ViewStyle,

  // ウェルカムカード（特別なデザイン）
  welcomeCard: {
    backgroundColor: colors.background,
    borderRadius: layout.special.welcome,
    padding: layout.padding.large,
    ...shadows.elevated,
  } as ViewStyle,

  // リストアイテムカード
  listItemCard: {
    backgroundColor: colors.background,
    borderRadius: layout.components.listItem,
    padding: layout.padding.medium,
    ...shadows.listItem,
  } as ViewStyle,

  // チップ・バッジスタイル
  chip: {
    backgroundColor: colors.surface,
    borderRadius: layout.components.chip,
    paddingVertical: layout.padding.small / 2,
    paddingHorizontal: layout.padding.small,
    ...shadows.chip,
  } as ViewStyle,
};

// ボタンスタイル
export const buttonStyles = {
  // プライマリボタン
  primary: {
    backgroundColor: colors.primary,
    borderRadius: layout.components.button,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.large,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  } as ViewStyle,

  // セカンダリボタン
  secondary: {
    backgroundColor: colors.secondary,
    borderRadius: layout.components.button,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.large,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  } as ViewStyle,

  // アウトラインボタン
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: layout.components.button,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.large,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.small,
  } as ViewStyle,

  // フローティングアクションボタン
  floating: {
    backgroundColor: colors.primary,
    borderRadius: layout.borderRadius.full,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.floatingButton,
  } as ViewStyle,

  // チップボタン
  chip: {
    backgroundColor: colors.surface,
    borderRadius: layout.components.chip,
    paddingVertical: layout.padding.small / 2,
    paddingHorizontal: layout.padding.small,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.chip,
  } as ViewStyle,

  // 大きなボタン
  large: {
    paddingVertical: layout.padding.large,
    paddingHorizontal: layout.padding.xlarge,
  } as ViewStyle,

  // 小さなボタン
  small: {
    paddingVertical: layout.padding.small,
    paddingHorizontal: layout.padding.medium,
  } as ViewStyle,

  // プレス時のスタイル
  pressed: {
    ...shadows.pressed,
    transform: [{ scale: 0.98 }],
  } as ViewStyle,
};

// 入力フィールドスタイル
export const inputStyles = {
  // 基本入力フィールド
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.components.input,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.medium,
    fontSize: Math.max(typography.fontSize.medium, 16), // ズーム防止のため16px以上
    color: colors.text.primary,
    // 影は削除（よりクリーンな見た目）
  } as ViewStyle,

  // フォーカス時の入力フィールド
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
    // フォーカス時も影なし
  } as ViewStyle,

  // エラー時の入力フィールド
  inputError: {
    borderWidth: 2,
    borderColor: colors.error,
  } as ViewStyle,
};

// モーダルスタイル
export const modalStyles = {
  // 基本モーダル
  modal: {
    backgroundColor: colors.background,
    borderRadius: layout.components.modal,
    padding: layout.padding.large,
    margin: layout.padding.large,
    ...shadows.modal,
  } as ViewStyle,

  // フルスクリーンモーダル
  fullscreenModal: {
    backgroundColor: colors.background,
    borderRadius: 0,
    flex: 1,
  } as ViewStyle,

  // モーダルオーバーレイ
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
};

// テキストスタイル
export const textStyles = {
  // ヘッダータイトル
  headerTitle: {
    fontSize: typography.fontSize.xxlarge + 8,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.white,
    textAlign: "center",
  } as TextStyle,

  // サブタイトル
  subtitle: {
    fontSize: typography.fontSize.large,
    color: colors.text.white,
    opacity: 0.9,
    textAlign: "center",
  } as TextStyle,

  // ウェルカムテキスト
  welcomeText: {
    fontSize: typography.fontSize.xxlarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: layout.padding.medium,
  } as TextStyle,

  // 説明テキスト
  description: {
    fontSize: typography.fontSize.large,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: layout.padding.large * 1.5,
  } as TextStyle,

  // フッターテキスト
  footerText: {
    fontSize: typography.fontSize.small + 2,
    color: colors.text.disabled,
    textAlign: "center",
    lineHeight: 20,
  } as TextStyle,

  // ボタンテキスト
  buttonText: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.white,
  } as TextStyle,

  // アウトラインボタンテキスト
  outlineButtonText: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  } as TextStyle,
};

// レスポンシブ対応のスタイル
export const responsiveStyles = {
  // デスクトップ用ボタンコンテナ
  desktopButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: layout.padding.large,
  } as ViewStyle,

  // デスクトップ用ボタン
  desktopButton: {
    minWidth: 200,
    maxWidth: 300,
  } as ViewStyle,

  // モバイル用ボタンコンテナ
  mobileButtonContainer: {
    gap: layout.padding.medium,
  } as ViewStyle,
};

// アニメーション関連の設定
export const animationConfigs = {
  // 標準トランジション
  defaultTransition: {
    duration: 300,
    useNativeDriver: true,
  },

  // 早いトランジション
  fastTransition: {
    duration: 150,
    useNativeDriver: true,
  },

  // 遅いトランジション
  slowTransition: {
    duration: 500,
    useNativeDriver: true,
  },
};

// 統合デザインシステム
export const designSystem = {
  page: pageStyles,
  layout: layoutStyles,
  card: cardStyles,
  button: buttonStyles,
  input: inputStyles,
  modal: modalStyles,
  text: textStyles,
  responsive: responsiveStyles,
  animation: animationConfigs,
};

export default designSystem;
