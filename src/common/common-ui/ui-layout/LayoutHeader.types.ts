import { HeaderBaseProps } from "./ui-layout-types";

export interface HeaderProps extends HeaderBaseProps {
  // ここに追加のプロパティがあれば定義する
  onPressSettings?: () => void;
}

export interface MasterHeaderProps extends HeaderBaseProps {
  // マスター専用のヘッダープロパティがあれば定義する
}
