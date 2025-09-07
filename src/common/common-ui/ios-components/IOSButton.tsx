/**
 * iOS風ボタンコンポーネント
 * 
 * Apple Human Interface Guidelinesに準拠したボタン
 * - 44pt最小タッチエリア
 * - iOS標準のタイポグラフィ
 * - システムカラー使用
 * - ハプティックフィードバック対応準備
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { iosTheme } from '@/common/common-constants/IOSTheme';

export type IOSButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type IOSButtonSize = 'small' | 'medium' | 'large';

export interface IOSButtonProps {
  title: string;
  onPress: () => void;
  variant?: IOSButtonVariant;
  size?: IOSButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const IOSButton: React.FC<IOSButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles],
    styles[`${size}Text` as keyof typeof styles],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.6}
      // ハプティックフィードバックは後で追加
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? iosTheme.colors.systemBackground : iosTheme.colors.systemBlue}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: iosTheme.borderRadius.sm,
    minHeight: iosTheme.spacing.buttonMinHeight,
    paddingHorizontal: iosTheme.spacing.md,
    ...iosTheme.shadows.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: iosTheme.colors.systemBlue,
  },
  secondary: {
    backgroundColor: iosTheme.colors.secondarySystemFill,
    borderWidth: 1,
    borderColor: iosTheme.colors.separator,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: iosTheme.colors.systemRed,
  },
  
  // Sizes
  small: {
    minHeight: 32,
    paddingHorizontal: iosTheme.spacing.sm,
  },
  medium: {
    minHeight: iosTheme.spacing.buttonMinHeight,
    paddingHorizontal: iosTheme.spacing.md,
  },
  large: {
    minHeight: 50,
    paddingHorizontal: iosTheme.spacing.lg,
  },
  
  fullWidth: {
    alignSelf: 'stretch',
  },
  
  disabled: {
    opacity: 0.3,
  },
  
  // Text styles
  text: {
    textAlign: 'center',
  },
  
  primaryText: {
    color: iosTheme.colors.systemBackground,
    fontSize: iosTheme.typography.body.fontSize,
    fontWeight: iosTheme.typography.headline.fontWeight,
  },
  
  secondaryText: {
    color: iosTheme.colors.systemBlue,
    fontSize: iosTheme.typography.body.fontSize,
    fontWeight: iosTheme.typography.body.fontWeight,
  },
  
  tertiaryText: {
    color: iosTheme.colors.systemBlue,
    fontSize: iosTheme.typography.body.fontSize,
    fontWeight: iosTheme.typography.body.fontWeight,
  },
  
  destructiveText: {
    color: iosTheme.colors.systemBackground,
    fontSize: iosTheme.typography.body.fontSize,
    fontWeight: iosTheme.typography.headline.fontWeight,
  },
  
  smallText: {
    fontSize: iosTheme.typography.footnote.fontSize,
  },
  
  mediumText: {
    fontSize: iosTheme.typography.body.fontSize,
  },
  
  largeText: {
    fontSize: iosTheme.typography.headline.fontSize,
  },
  
  disabledText: {
    color: iosTheme.colors.tertiaryLabel,
  },
});