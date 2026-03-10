/** @file LayoutHeader.types.ts @description Header/MasterHeaderコンポーネントの型定義 */
import { HeaderBaseProps } from "./ui-layout-types";

/** 講師用ヘッダーのProps */
export interface HeaderProps extends HeaderBaseProps {
  /** 設定ボタン押下時のコールバック。未指定の場合ボタン非表示 */
  onPressSettings?: () => void;
}

/** 管理者用ヘッダーのProps */
export interface MasterHeaderProps extends HeaderBaseProps {
}
