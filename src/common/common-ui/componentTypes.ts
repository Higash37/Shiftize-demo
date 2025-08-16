/**
 * 統合コンポーネント型定義
 * 全コンポーネント共通の型とインターフェースを定義
 * 
 * @deprecated このファイルは非推奨です。
 * 代わりに @/common/component-interfaces/componentTypes.ts を使用してください。
 * 後方互換性のために一時的に保持されています。
 */
import { ViewStyle, TextStyle } from "react-native";

// 新しい型定義ファイルから統合型をインポート
export type {
  Variant,
  Padding,
  Margin,
  Shadow,
  Size,
  ButtonSize,
  ButtonVariant,
  InputVariant,
  FlexContainerProps,
  BaseComponentProps,
  ErrorMessageProps,
  LoadingProps,
} from '@/common/component-interfaces/componentTypes';

/**
 * 後方互換性のための非推奨型
 * @deprecated FlexContainerProps を使用してください
 */
export type JustifyContent =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

/**
 * 後方互換性のための非推奨型
 * @deprecated FlexContainerProps を使用してください
 */
export type AlignItems =
  | "start"
  | "center"
  | "end"
  | "stretch"
  | "baseline";

/**
 * 後方互換性のための非推奨型
 * @deprecated JustifyContent を使用してください
 */
export type Alignment = JustifyContent;

/**
 * 後方互換性のための非推奨型
 * @deprecated FlexContainerProps の direction プロパティを使用してください
 */
export type Direction = "row" | "column";

/**
 * マイグレーション警告を表示するヘルパー関数
 */
if (__DEV__) {
  console.warn(
    'componentTypes.ts (common-ui) は非推奨です。' +
    '@/common/component-interfaces/componentTypes.ts を使用してください。'
  );
}