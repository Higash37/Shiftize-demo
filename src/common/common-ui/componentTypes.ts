/**
 * コンポーネント共通の型定義
 */

/**
 * サイズバリエーション
 */
export type Size = "small" | "medium" | "large" | "compact";

/**
 * スタイルバリエーション
 */
export type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "outlined"
  | "default"
  | "card"
  | "surface"
  | "surfaceContainer"
  | "surfaceContainerHigh"
  | "surfaceContainerLow";

/**
 * パディングサイズ
 */
export type Padding = "small" | "medium" | "large" | "none";

/**
 * マージンサイズ
 */
export type Margin = "small" | "medium" | "large" | "none";

/**
 * 影の強さ
 */
export type Shadow = "none" | "small" | "medium" | "large";

/**
 * 主軸方向の配置位置（justifyContent用）
 */
export type JustifyContent =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

/**
 * 交差軸方向の配置位置（alignItems用）
 */
export type AlignItems = "start" | "center" | "end" | "stretch" | "baseline";

/**
 * 方向
 */
export type Direction = "row" | "column";

/**
 * フレックスコンテナプロパティ
 */
export interface FlexContainerProps {
  /**
   * フレックスの方向
   */
  direction?: Direction;

  /**
   * 主軸方向の配置（justifyContent）
   */
  justify?: JustifyContent;

  /**
   * 交差軸方向の配置（alignItems）
   */
  align?: AlignItems;

  /**
   * フレックスラップ
   */
  wrap?: "wrap" | "nowrap" | "wrap-reverse";

  /**
   * フレックス値
   */
  flex?: number;

  /**
   * アイテム間のギャップ
   */
  gap?: number;
}

/**
 * 基本コンポーネントプロパティ
 */
export interface BaseComponentProps {
  /**
   * スタイルのオーバーライド
   */
  style?: any;

  /**
   * テスト用ID
   */
  testID?: string | undefined;
}
