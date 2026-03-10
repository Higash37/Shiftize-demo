/** @file ScrollViewComponent.tsx @description スクロールバー非表示のカスタムScrollView */
import React from "react";
import { ScrollView, ScrollViewProps } from "react-native";

/** スクロールバーをデフォルト非表示にしたScrollViewラッパー */
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
