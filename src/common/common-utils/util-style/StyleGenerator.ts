/**
 * @file StyleGenerator.ts
 * @description React NativeのViewStyleを動的に生成するスタイルジェネレーター関数群。
 *              カード、ボタン、ヘッダー、フッター、インプット、モーダル等のスタイルを生成する。
 *
 * 【このファイルの位置づけ】
 * - LayoutConstants.ts, ShadowConstants.ts, ColorConstants.ts からデザイントークンを取得
 * - コンポーネントのスタイル定義で使用される
 * - 関連ファイル: LayoutConstants.ts（レイアウト定数）, ShadowConstants.ts（影定数）,
 *                ColorConstants.ts（色定数）
 *
 * 【なぜスタイルジェネレーター関数が必要か】
 * StyleSheet.create() は静的なスタイルしか定義できない。
 * コンポーネントの状態（フォーカス中、エラー中等）に応じて動的にスタイルを変えたい場合、
 * 関数でスタイルオブジェクトを生成する必要がある。
 *
 * 【ViewStyle とは】
 * React Nativeの View コンポーネントに適用可能なスタイルの型。
 * CSS のプロパティに似ているが、React Native 固有のプロパティも含む。
 *
 * 【keyof typeof の解説】
 * - `typeof layout.borderRadius` → layout.borderRadius の型を取得
 *   → { small: number, medium: number, large: number, ... }
 * - `keyof typeof layout.borderRadius` → そのオブジェクトのキーのユニオン型
 *   → "small" | "medium" | "large" | ...
 * これにより、引数に無効なキー名が渡されることをコンパイル時に防げる。
 */
import { ViewStyle } from "react-native";
import { layout } from "../../common-constants/LayoutConstants";
import { shadows } from "../../common-constants/ShadowConstants";
import { colors } from "../../common-constants/ColorConstants";

/**
 * withBorderRadius - 既存のスタイルに角丸を適用する
 *
 * スプレッド構文（...baseStyle）で元のスタイルをコピーし、
 * borderRadius プロパティを追加・上書きする。
 *
 * @param baseStyle - ベースとなるスタイル
 * @param radius - 角丸のサイズ（layout.borderRadiusのキー名。デフォルト: "medium"）
 * @returns 角丸が適用された新しいスタイルオブジェクト
 */
export const withBorderRadius = (
  baseStyle: ViewStyle,
  radius: keyof typeof layout.borderRadius = "medium"
): ViewStyle => ({
  ...baseStyle,
  borderRadius: layout.borderRadius[radius],
});

/**
 * withShadow - 既存のスタイルにシャドウ（影）を適用する
 *
 * shadows[shadowType] はプラットフォーム別の影プロパティを含むオブジェクト。
 * スプレッド構文で影の全プロパティ（shadowColor, shadowOffset等）をマージする。
 *
 * @param baseStyle - ベースとなるスタイル
 * @param shadowType - シャドウのタイプ（shadowsのキー名。デフォルト: "medium"）
 * @returns シャドウが適用された新しいスタイルオブジェクト
 */
export const withShadow = (
  baseStyle: ViewStyle,
  shadowType: keyof typeof shadows = "medium"
): ViewStyle => ({
  ...baseStyle,
  ...shadows[shadowType],
});

/**
 * withPadding - 既存のスタイルにパディング（内側の余白）を適用する
 *
 * @param baseStyle - ベースとなるスタイル
 * @param paddingSize - パディングのサイズ（layout.paddingのキー名。デフォルト: "medium"）
 * @returns パディングが適用された新しいスタイルオブジェクト
 */
export const withPadding = (
  baseStyle: ViewStyle,
  paddingSize: keyof typeof layout.padding = "medium"
): ViewStyle => ({
  ...baseStyle,
  padding: layout.padding[paddingSize],
});

/**
 * createCardStyle - カード用のスタイルを生成する
 *
 * カードは「浮き上がったコンテナ」で、角丸、影、背景色、パディングを持つ。
 * Material Design では Elevated Card に相当する。
 *
 * @param borderRadius - 角丸のサイズ（デフォルト: "medium"）
 * @param shadowType - シャドウのタイプ（デフォルト: "card"）
 * @param backgroundColor - 背景色（デフォルト: colors.background）
 * @returns カード用のスタイルオブジェクト
 */
export const createCardStyle = (
  borderRadius: keyof typeof layout.borderRadius = "medium",
  shadowType: keyof typeof shadows = "card",
  backgroundColor: string = colors.background
): ViewStyle => ({
  borderRadius: layout.borderRadius[borderRadius],
  backgroundColor,
  ...shadows[shadowType],         // 影のプロパティを展開
  padding: layout.padding.medium, // 内側の余白
});

/**
 * createButtonStyle - ボタン用のスタイルを生成する
 *
 * バリアント（primary/secondary/outline）とサイズ（small/medium/large）の
 * 組み合わせでスタイルを生成する。
 *
 * 【バリアントの説明】
 * - primary:   主要アクション用。背景色=プライマリカラー、影あり
 * - secondary: 副次アクション用。背景色=セカンダリカラー、影あり
 * - outline:   テキストボタン風。背景透明、枠線あり
 *
 * @param variant - ボタンのバリアント（デフォルト: "primary"）
 * @param size - ボタンのサイズ（デフォルト: "medium"）
 * @returns ボタン用のスタイルオブジェクト
 */
export const createButtonStyle = (
  variant: "primary" | "secondary" | "outline" = "primary",
  size: "small" | "medium" | "large" = "medium"
): ViewStyle => {
  // サイズ別のパディング定義
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

  // バリアント別の色と影の定義
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
    alignItems: "center",      // 子要素を水平中央に配置
    justifyContent: "center",  // 子要素を垂直中央に配置
    ...sizeMap[size],           // サイズ別のパディングを展開
    ...variantMap[variant],     // バリアント別のスタイルを展開
  };
};

/**
 * createHeaderStyle - ヘッダー用のスタイルを生成する
 *
 * 画面上部のヘッダーバーのスタイル。
 * 下部の角丸はデフォルトで適用され、上部の角丸はオプション。
 *
 * @param backgroundColor - 背景色（デフォルト: colors.primary）
 * @param withTopRadius - 上部の角丸を適用するか（デフォルト: false）
 * @returns ヘッダー用のスタイルオブジェクト
 */
export const createHeaderStyle = (
  backgroundColor: string = colors.primary,
  withTopRadius: boolean = false
): ViewStyle => ({
  backgroundColor,
  // 三項演算子: withTopRadius が true なら角丸、false なら 0（角丸なし）
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
 * createFooterStyle - フッター用のスタイルを生成する
 *
 * 画面下部のフッターバーのスタイル。
 * 上部の角丸はデフォルトで適用され、下部の角丸はオプション。
 *
 * @param backgroundColor - 背景色（デフォルト: colors.background）
 * @param withBottomRadius - 下部の角丸を適用するか（デフォルト: false）
 * @returns フッター用のスタイルオブジェクト
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
 * createInputStyle - 入力フィールド用のスタイルを生成する
 *
 * フォーカス状態とエラー状態に応じてボーダー色とボーダー幅を動的に変更する。
 *
 * 【ボーダーカラーの優先順位】
 * エラー > フォーカス > デフォルト
 * エラー状態とフォーカス状態が同時に存在する場合、エラー色（赤）が優先される。
 *
 * @param focused - フォーカス状態か（デフォルト: false）
 * @param error - エラー状態か（デフォルト: false）
 * @returns インプット用のスタイルオブジェクト
 */
export const createInputStyle = (
  focused: boolean = false,
  error: boolean = false
): ViewStyle => {
  // ボーダーカラーの決定
  let borderColor = colors.border;    // デフォルト: グレー
  if (error) {
    borderColor = colors.error;       // エラー: 赤（最優先）
  } else if (focused) {
    borderColor = colors.primary;     // フォーカス: プライマリカラー
  }

  return {
    borderRadius: layout.components.input,
    borderWidth: focused ? 2 : 1, // フォーカス時は太いボーダー
    borderColor,
    backgroundColor: colors.background,
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.medium,
    ...shadows.small,
  };
};

/**
 * createModalStyle - モーダル用のスタイルを生成する
 *
 * フルスクリーンモードとポップアップモードの2パターンに対応。
 *
 * @param fullScreen - フルスクリーンモードか（デフォルト: false）
 * @returns モーダル用のスタイルオブジェクト
 */
export const createModalStyle = (fullScreen: boolean = false): ViewStyle => ({
  borderRadius: fullScreen ? 0 : layout.components.modal, // フルスクリーンなら角丸なし
  backgroundColor: colors.background,
  ...shadows.modal,
  margin: fullScreen ? 0 : layout.padding.large, // フルスクリーンなら余白なし
});
