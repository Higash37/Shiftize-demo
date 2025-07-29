import React from "react";
import { ScrollView, ScrollViewProps } from "react-native";

/**
 * スクロールバーを非表示にするカスタムScrollViewコンポーネント
 * アプリ全体で統一的に使用することでスクロールバーを非表示にできます
 */
export const CustomScrollView: React.FC<ScrollViewProps> = (props) => {
  const { children, showsVerticalScrollIndicator = false, showsHorizontalScrollIndicator = false, ...rest } = props;

  return (
    <ScrollView
      {...rest}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
    >
      {children}
    </ScrollView>
  );
};

export default CustomScrollView;
