/**
 * iOS風リストアイテムコンポーネント
 * 
 * iOS設定アプリ風のリストアイテム
 * - 44pt最小高さ
 * - システムセパレーター使用
 * - アクセサリー対応
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { iosTheme } from '@/common/common-constants/IOSTheme';

export interface IOSListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  rightAccessory?: 'chevron' | 'checkmark' | 'info' | React.ReactNode;
  style?: ViewStyle;
  showSeparator?: boolean;
}

export const IOSListItem: React.FC<IOSListItemProps> = ({
  title,
  subtitle,
  onPress,
  leftIcon,
  leftIconColor = iosTheme.colors.systemBlue,
  rightAccessory = 'chevron',
  style,
  showSeparator = true,
}) => {
  const Component = onPress ? TouchableOpacity : View;
  
  const renderRightAccessory = () => {
    if (React.isValidElement(rightAccessory)) {
      return rightAccessory;
    }
    
    switch (rightAccessory) {
      case 'chevron':
        return (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={iosTheme.colors.tertiaryLabel}
          />
        );
      case 'checkmark':
        return (
          <Ionicons
            name="checkmark"
            size={20}
            color={iosTheme.colors.systemBlue}
          />
        );
      case 'info':
        return (
          <Ionicons
            name="information-circle"
            size={20}
            color={iosTheme.colors.systemBlue}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={style}>
      <Component
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.6}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={leftIcon}
              size={20}
              color={leftIconColor}
            />
          </View>
        )}
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        
        {/* Right Accessory */}
        {rightAccessory && (
          <View style={styles.rightAccessory}>
            {renderRightAccessory()}
          </View>
        )}
      </Component>
      
      {/* Separator */}
      {showSeparator && <View style={styles.separator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: iosTheme.spacing.cellMinHeight,
    paddingHorizontal: iosTheme.spacing.md,
    paddingVertical: iosTheme.spacing.sm,
    backgroundColor: iosTheme.colors.secondarySystemGroupedBackground,
  },
  
  leftIconContainer: {
    width: 29,
    height: 29,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iosTheme.spacing.sm,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  
  title: {
    fontSize: iosTheme.typography.body.fontSize,
    lineHeight: iosTheme.typography.body.lineHeight,
    fontWeight: iosTheme.typography.body.fontWeight,
    color: iosTheme.colors.label,
  },
  
  subtitle: {
    fontSize: iosTheme.typography.footnote.fontSize,
    lineHeight: iosTheme.typography.footnote.lineHeight,
    fontWeight: iosTheme.typography.footnote.fontWeight,
    color: iosTheme.colors.secondaryLabel,
    marginTop: 2,
  },
  
  rightAccessory: {
    marginLeft: iosTheme.spacing.sm,
  },
  
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: iosTheme.colors.separator,
    marginLeft: iosTheme.spacing.md + 29 + iosTheme.spacing.sm, // Align with content
  },
});