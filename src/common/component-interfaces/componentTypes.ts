/**
 * 統合コンポーネントインターフェース定義
 * 全アプリケーションで使用されるコンポーネントの共通型とインターフェース
 * 
 * 特徴:
 * - TypeScriptの型安全性を維持
 * - アクセシビリティへの配慮
 * - パフォーマンス最適化
 * - 再利用可能なコンポーネント設計
 */

import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { ReactNode, ComponentType } from 'react';

/**
 * 表示バリアント
 * コンポーネントの外観と動作を定義する基本バリエーション
 */
export type Variant = 
  | "default"   // デフォルトスタイル
  | "primary"   // メインアクション用
  | "secondary" // サブアクション用
  | "accent"    // アクセント色用
  | "success"   // 成功メッセージ用
  | "warning"   // 警告メッセージ用
  | "error"     // エラーメッセージ用
  | "info"      // 情報メッセージ用
  | "card"      // カードスタイル
  | "outline"   // アウトラインスタイル
  | "outlined"  // outlinedの別名（後方互換性）
  | "ghost"     // 透明スタイル
  | "link";     // リンクスタイル

/**
 * パディング設定
 * コンポーネントの内部余白を定義
 */
export type Padding = 
  | "none"   // 0px
  | "xs"     // 4px
  | "small"  // 8px
  | "medium" // 16px
  | "large"  // 24px
  | "xl"     // 32px
  | "2xl";   // 48px

/**
 * マージン設定
 * コンポーネントの外部余白を定義
 */
export type Margin = 
  | "none"   // 0px
  | "xs"     // 4px
  | "small"  // 8px
  | "medium" // 16px
  | "large"  // 24px
  | "xl"     // 32px
  | "2xl"    // 48px
  | "auto";  // 自動調整

/**
 * 影の設定
 * コンポーネントの影の強度を定義
 */
export type Shadow = 
  | "none"   // 影なし
  | "xs"     // 微細な影
  | "small"  // 小さな影
  | "medium" // 中程度の影
  | "large"  // 大きな影
  | "xl"     // 非常に大きな影
  | "inner"; // 内影

/**
 * 汎用サイズ
 * コンポーネントの基本サイズバリエーション
 */
export type Size = 
  | "xs"      // 最小
  | "small"   // 小
  | "medium"  // 中（デフォルト）
  | "large"   // 大
  | "xl"      // 最大
  | "compact"; // コンパクト（狭いスペース用）

/**
 * ボタンサイズ
 */
export type ButtonSize = Size;

/**
 * ボタンバリアント
 * ボタンコンポーネント専用のスタイルバリエーション
 */
export type ButtonVariant = 
  | "primary"   // メインアクションボタン
  | "secondary" // サブアクションボタン
  | "outline"   // アウトラインボタン
  | "ghost"     // 透明ボタン
  | "link"      // リンクスタイルボタン
  | "success"   // 成功アクションボタン
  | "warning"   // 警告アクションボタン
  | "danger"    // 危険アクション（削除等）
  | "info";     // 情報アクションボタン

/**
 * 入力フィールドバリアント
 * フォーム入力コンポーネントのスタイルバリエーション
 */
export type InputVariant = 
  | "default"    // デフォルトスタイル
  | "outline"    // アウトラインスタイル
  | "filled"     // 背景色ありスタイル
  | "underlined" // 下線のみスタイル
  | "ghost";     // 透明スタイル

/**
 * Flexboxコンテナのプロパティ
 * React NativeのFlexレイアウトシステムを抽象化
 */
export interface FlexContainerProps {
  /**
   * フレックス方向
   * @default "column"
   */
  direction?: "row" | "column" | "row-reverse" | "column-reverse";

  /**
   * 交差軸方向のアライメント（alignItems）
   * @default "stretch"
   */
  align?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline" | "start" | "end";

  /**
   * 主軸方向の配置（justifyContent）
   * @default "flex-start"
   */
  justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | "start" | "end" | "between" | "around" | "evenly";

  /**
   * フレックスラップ
   * @default "nowrap"
   */
  wrap?: "nowrap" | "wrap" | "wrap-reverse";

  /**
   * フレックス値
   */
  flex?: number;

  /**
   * アイテム間のギャップ（ピクセル値）
   */
  gap?: number;

  /**
   * 水平方向のギャップ
   */
  rowGap?: number;

  /**
   * 垂直方向のギャップ
   */
  columnGap?: number;

  /**
   * alignSelfプロパティ
   */
  alignSelf?: "auto" | "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
}

/**
 * 基本コンポーネントプロパティ
 * 全コンポーネントが継承すべき基本プロパティ
 */
export interface BaseComponentProps {
  /**
   * テスト用識別子（自動テスト用）
   */
  testID?: string;

  /**
   * カスタムスタイルの上書き
   */
  style?: ViewStyle | TextStyle | ImageStyle | (ViewStyle | TextStyle | ImageStyle)[];

  /**
   * 子要素コンテンツ
   */
  children?: ReactNode;

  /**
   * アクセシビリティラベル
   */
  accessibilityLabel?: string;

  /**
   * アクセシビリティヒント
   */
  accessibilityHint?: string;

  /**
   * アクセシビリティロール
   */
  accessibilityRole?: 'button' | 'link' | 'search' | 'image' | 'keyboardkey' | 'text' | 'adjustable' | 'imagebutton' | 'header' | 'summary' | 'alert' | 'checkbox' | 'combobox' | 'menu' | 'menubar' | 'menuitem' | 'progressbar' | 'radio' | 'radiogroup' | 'scrollbar' | 'spinbutton' | 'switch' | 'tab' | 'tablist' | 'timer' | 'toolbar' | 'none';

  /**
   * アクセシビリティ状態
   */
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };

  /**
   * アクセシビリティ値
   */
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}

/**
 * エラーメッセージプロパティ
 * エラー表示コンポーネント用のインターフェース
 */
export interface ErrorMessageProps extends BaseComponentProps {
  /**
   * エラーメッセージテキスト
   */
  message?: string;

  /**
   * エラーの表示状態
   * @default false
   */
  visible?: boolean;

  /**
   * エラータイプ（スタイルやアイコンの変更用）
   * @default "error"
   */
  type?: "error" | "warning" | "info";

  /**
   * エラーアイコンの表示制御
   * @default true
   */
  showIcon?: boolean;

  /**
   * エラー解決のためのアクションボタン
   */
  action?: {
    label: string;
    onPress: () => void;
  };

  /**
   * エラーの自動非表示時間（ミリ秒）
   */
  autoHide?: number;

  /**
   * エラーが自動非表示された時のコールバック
   */
  onAutoHide?: () => void;
}

/**
 * ローディング状態プロパティ
 * ローディング状態を持つコンポーネント用
 */
export interface LoadingProps {
  /**
   * ローディング中かどうか
   * @default false
   */
  loading?: boolean;

  /**
   * ローディング中に表示するテキスト
   * @default "読み込み中..."
   */
  loadingText?: string;

  /**
   * ローディングインジケーターのサイズ
   * @default "medium"
   */
  loadingSize?: "small" | "medium" | "large";

  /**
   * ローディングインジケーターの色
   */
  loadingColor?: string;

  /**
   * ローディング時に他のコンテンツを非表示にするか
   * @default false
   */
  hideContentWhileLoading?: boolean;

  /**
   * ローディングオーバーレイの背景色
   */
  overlayColor?: string;

  /**
   * ローディングタイムアウト（ミリ秒）
   */
  timeout?: number;

  /**
   * タイムアウト時のコールバック
   */
  onTimeout?: () => void;
}

/**
 * コンポーネントの状態管理
 * 状態を持つコンポーネント用の共通インターフェース
 */
export interface StatefulComponentProps {
  /**
   * 初期値
   */
  defaultValue?: any;

  /**
   * 制御された値（Controlled Component）
   */
  value?: any;

  /**
   * 値変更時のコールバック
   */
  onChange?: (value: any) => void;

  /**
   * 無効状態
   * @default false
   */
  disabled?: boolean;

  /**
   * 読み取り専用状態
   * @default false
   */
  readOnly?: boolean;
}

/**
 * フォーム入力コンポーネントのプロパティ
 * フォーム要素に共通するプロパティ
 */
export interface FormComponentProps extends BaseComponentProps, StatefulComponentProps {
  /**
   * フィールド名
   */
  name?: string;

  /**
   * ラベルテキスト
   */
  label?: string;

  /**
   * プレースホルダーテキスト
   */
  placeholder?: string;

  /**
   * ヘルプテキスト
   */
  helperText?: string;

  /**
   * エラーメッセージ
   */
  error?: string;

  /**
   * 必須フィールドかどうか
   * @default false
   */
  required?: boolean;

  /**
   * バリデーション関数
   */
  validate?: (value: any) => string | undefined;

  /**
   * フォーカス時のコールバック
   */
  onFocus?: () => void;

  /**
   * フォーカスが外れた時のコールバック
   */
  onBlur?: () => void;
}

/**
 * アニメーションプロパティ
 * アニメーションを持つコンポーネント用
 */
export interface AnimationProps {
  /**
   * アニメーションの有効/無効
   * @default true
   */
  animated?: boolean;

  /**
   * アニメーションの種類
   */
  animationType?: "fade" | "slide" | "scale" | "rotate" | "bounce";

  /**
   * アニメーションの期間（ミリ秒）
   * @default 300
   */
  animationDuration?: number;

  /**
   * アニメーションの遅延（ミリ秒）
   * @default 0
   */
  animationDelay?: number;

  /**
   * アニメーション終了時のコールバック
   */
  onAnimationComplete?: () => void;
}

/**
 * レスポンシブプロパティ
 * 画面サイズに応じた表示切り替え用
 */
export interface ResponsiveProps {
  /**
   * モバイル用スタイル
   */
  mobile?: ViewStyle;

  /**
   * タブレット用スタイル
   */
  tablet?: ViewStyle;

  /**
   * デスクトップ用スタイル
   */
  desktop?: ViewStyle;
}

/**
 * テーマプロバイダーのコンテキスト
 */
export interface ThemeContextValue {
  /**
   * 現在のテーマ
   */
  theme: 'light' | 'dark' | 'auto';

  /**
   * テーマ変更関数
   */
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;

  /**
   * ダークモードかどうか
   */
  isDark: boolean;

  /**
   * システムのダークモード設定かどうか
   */
  isSystemDark: boolean;
}

/**
 * ユーティリティ型定義
 */
export type ComponentRef<T = any> = ComponentType<T> | null;
export type StyleProp<T> = T | T[] | false | null | undefined;
export type ColorValue = string;
export type DimensionValue = number | string;

/**
 * コンポーネントのファクトリ関数用の型
 */
export interface ComponentFactory<TProps = {}> {
  (props: TProps): ReactNode;
  displayName?: string;
}

/**
 * 高階コンポーネント（HOC）用の型
 */
export type HigherOrderComponent<TInjectedProps, TOwnProps = {}> = (
  component: ComponentType<TInjectedProps & TOwnProps>
) => ComponentType<TOwnProps>;

/**
 * コンポーネントのプロパティ抽出用のユーティリティ型
 */
export type ExtractProps<TComponent> = TComponent extends ComponentType<infer P> ? P : never;

/**
 * コンポーネントのフォワードRef用の型
 */
export type ForwardRefComponent<TProps, TRef> = ComponentType<TProps & { ref?: React.Ref<TRef> }>;