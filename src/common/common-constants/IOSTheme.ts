/**
 * iOS風テーマシステム
 * 
 * Apple Human Interface Guidelinesに準拠したテーマ設定
 * 既存システムに影響せず、段階的に適用可能
 */

import { Platform } from 'react-native';
import { convertShadowForWeb } from './ShadowConstants';

export interface IOSTheme {
  colors: IOSColors;
  typography: IOSTypography;
  spacing: IOSSpacing;
  borderRadius: IOSBorderRadius;
  shadows: IOSShadows;
  layout: IOSLayout;
}

// iOS System Colors準拠
export interface IOSColors {
  // System Colors
  systemBlue: string;
  systemGreen: string;
  systemIndigo: string;
  systemOrange: string;
  systemPink: string;
  systemPurple: string;
  systemRed: string;
  systemTeal: string;
  systemYellow: string;
  
  // Semantic Colors (Light Mode)
  label: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  quaternaryLabel: string;
  
  systemBackground: string;
  secondarySystemBackground: string;
  tertiarySystemBackground: string;
  
  systemGroupedBackground: string;
  secondarySystemGroupedBackground: string;
  tertiarySystemGroupedBackground: string;
  
  systemFill: string;
  secondarySystemFill: string;
  tertiarySystemFill: string;
  quaternarySystemFill: string;
  
  separator: string;
  opaqueSeparator: string;
  
  link: string;
  placeholderText: string;
  
  // Custom Shift Colors
  shift: {
    draft: string;
    pending: string;
    approved: string;
    rejected: string;
    deleted: string;
    completed: string;
    deletion_requested: string;
    purged: string;
  };
}

// iOS Typography Scale
export interface IOSTypography {
  // Text Styles
  largeTitle: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  title1: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  title2: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  title3: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  headline: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  body: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  callout: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  subhead: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  footnote: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  caption1: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
  caption2: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  };
}

// iOS 8pt Grid System
export interface IOSSpacing {
  xs: number;    // 4pt
  sm: number;    // 8pt
  md: number;    // 16pt
  lg: number;    // 24pt
  xl: number;    // 32pt
  xxl: number;   // 40pt
  xxxl: number;  // 48pt
  
  // Component specific
  buttonMinHeight: number; // 44pt minimum touch target
  cellMinHeight: number;   // 44pt minimum cell height
  navigationBarHeight: number; // 44pt
  tabBarHeight: number;    // 49pt
}

// iOS Border Radius
export interface IOSBorderRadius {
  none: number;
  xs: number;    // 4pt
  sm: number;    // 8pt
  md: number;    // 12pt
  lg: number;    // 16pt
  xl: number;    // 20pt
  full: number;  // 9999pt
}

// iOS Shadows (subtle)
export interface IOSShadows {
  none: any;
  xs: any;     // Very subtle
  sm: any;     // Subtle
  md: any;     // Default card shadow
  lg: any;     // Modal shadow
  xl: any;     // Heavy shadow
}

// iOS Layout Constants
export interface IOSLayout {
  screenEdgeInset: number;    // 16pt standard screen margin
  readableWidth: number;      // 375pt readable content width
  compactWidth: number;       // 320pt compact width
  regularWidth: number;       // 768pt regular width
}

// iOS Theme Implementation
export const iosTheme: IOSTheme = {
  colors: {
    // System Colors
    systemBlue: '#007AFF',
    systemGreen: '#34C759',
    systemIndigo: '#5856D6',
    systemOrange: '#FF9500',
    systemPink: '#FF2D92',
    systemPurple: '#AF52DE',
    systemRed: '#FF3B30',
    systemTeal: '#30D158',
    systemYellow: '#FFCC00',
    
    // Semantic Colors
    label: '#000000',
    secondaryLabel: '#3C3C4399',           // 60% opacity
    tertiaryLabel: '#3C3C434C',            // 30% opacity
    quaternaryLabel: '#3C3C432D',          // 18% opacity
    
    systemBackground: '#FFFFFF',
    secondarySystemBackground: 'rgba(255, 255, 255, 0.94)',
    tertiarySystemBackground: '#FFFFFF',
    
    systemGroupedBackground: 'rgba(255, 255, 255, 0.94)',
    secondarySystemGroupedBackground: '#FFFFFF',
    tertiarySystemGroupedBackground: 'rgba(255, 255, 255, 0.94)',
    
    systemFill: '#78788033',               // 20% opacity
    secondarySystemFill: '#78788028',      // 16% opacity
    tertiarySystemFill: '#7676801F',       // 12% opacity
    quaternarySystemFill: '#74748014',     // 8% opacity
    
    separator: '#3C3C4349',                // 29% opacity
    opaqueSeparator: '#C6C6C8',
    
    link: '#007AFF',
    placeholderText: '#3C3C4399',          // 60% opacity
    
    // Custom Shift Colors using iOS System Colors
    shift: {
      draft: '#FFFFFF',           // ios26 White
      pending: '#FF9500',         // System Orange
      approved: '#007AFF',        // System Blue
      rejected: '#FF3B30',        // System Red
      deleted: '#FFFFFF',         // ios26 White
      completed: '#34C759',       // System Green
      deletion_requested: '#FF9500', // System Orange
      purged: '#FFFFFF',          // ios26 White (hidden)
    },
  },
  
  typography: {
    largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '400' as const },
    title1: { fontSize: 28, lineHeight: 34, fontWeight: '400' as const },
    title2: { fontSize: 22, lineHeight: 28, fontWeight: '400' as const },
    title3: { fontSize: 20, lineHeight: 25, fontWeight: '400' as const },
    headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
    body: { fontSize: 17, lineHeight: 22, fontWeight: '400' as const },
    callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' as const },
    subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
    footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
    caption1: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
    caption2: { fontSize: 11, lineHeight: 13, fontWeight: '400' as const },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
    
    buttonMinHeight: 44,
    cellMinHeight: 44,
    navigationBarHeight: 44,
    tabBarHeight: 49,
  },
  
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  shadows: {
    none: convertShadowForWeb({
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    }),
    xs: convertShadowForWeb({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
    }),
    sm: convertShadowForWeb({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    }),
    md: convertShadowForWeb({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
    lg: convertShadowForWeb({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    }),
    xl: convertShadowForWeb({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    }),
  },
  
  layout: {
    screenEdgeInset: 16,
    readableWidth: 375,
    compactWidth: 320,
    regularWidth: 768,
  },
};

// Convenience exports
export const { colors: iosColors, typography: iosTypography, spacing: iosSpacing, borderRadius: iosBorderRadius, shadows: iosShadows } = iosTheme;
