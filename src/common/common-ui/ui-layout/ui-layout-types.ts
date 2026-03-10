/** @file ui-layout-types.ts @description レイアウト系コンポーネントの共通型定義 */
import { ReactNode } from "react";

/** ヘッダーコンポーネントの共通Props */
export interface HeaderBaseProps {
  /** 画面タイトル */
  title: string;
  /** 戻るボタンを表示するか */
  showBackButton?: boolean;
  /** 戻るボタン押下時のコールバック */
  onBack?: () => void;
}

/** フッターナビゲーションの各タブ定義 */
export interface TabItem {
  /** タブの識別名 */
  name: string;
  /** タブに表示するラベル */
  label: string;
  /** 遷移先のルートパス */
  path: string;
  /** アクティブ状態に応じたアイコンを返す関数 */
  icon: (active: boolean) => ReactNode;
  /** 開発中フラグ。trueの場合タブは無効化される */
  isUnderDevelopment?: boolean;
}
