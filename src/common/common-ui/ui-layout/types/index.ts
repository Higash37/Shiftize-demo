import { ReactNode } from "react";

// ヘッダーコンポーネントの共通プロパティ
export interface HeaderBaseProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

// フッターのタブ定義
export interface TabItem {
  name: string;
  label: string;
  path: string;
  icon: (active: boolean) => ReactNode;
  isUnderDevelopment?: boolean;
}
