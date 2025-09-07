/**
 * iOS風カードコンポーネント
 * 
 * iOS標準の設定アプリのようなカードデザイン
 * - システム背景色使用
 * - 控えめなシャドウ
 * - iOS標準のボーダー半径
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { iosTheme } from '@/common/common-constants/IOSTheme';

export interface IOSCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'grouped';
  padding?: keyof typeof iosTheme.spacing;
}

export const IOSCard: React.FC<IOSCardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: iosTheme.spacing[padding] },
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: iosTheme.borderRadius.md,
    ...iosTheme.shadows.sm,
  },
  
  default: {
    backgroundColor: iosTheme.colors.secondarySystemBackground,
    marginHorizontal: iosTheme.spacing.md,
    marginVertical: iosTheme.spacing.sm,
  },
  
  grouped: {
    backgroundColor: iosTheme.colors.secondarySystemGroupedBackground,
    marginHorizontal: iosTheme.spacing.md,
    marginVertical: iosTheme.spacing.sm,
  },
});