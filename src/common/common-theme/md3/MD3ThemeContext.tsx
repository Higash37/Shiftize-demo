import React, { createContext, useContext } from "react";
import { MD3Theme } from "./MD3Theme.types";
import { lightColorScheme } from "./MD3Colors";
import { md3Typography } from "./MD3Typography";
import { md3Shape } from "./MD3Shape";
import { md3Elevation } from "./MD3Elevation";
import { md3Spacing } from "./MD3Spacing";

// ---------------------------------------------------------------------------
// Pre-built theme object (light only)
// ---------------------------------------------------------------------------

export const lightTheme: MD3Theme = {
  colorScheme: lightColorScheme,
  typography: md3Typography,
  shape: md3Shape,
  elevation: md3Elevation,
  spacing: md3Spacing,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const MD3ThemeContext = createContext<MD3Theme>(lightTheme);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * MD3ThemeProvider
 *
 * アプリのルートに配置し、子コンポーネントにテーマを提供する。
 * 常にライトテーマを使用する。
 */
export const MD3ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <MD3ThemeContext.Provider value={lightTheme}>
    {children}
  </MD3ThemeContext.Provider>
);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * 現在のMD3テーマを取得するフック
 *
 * @example
 * ```tsx
 * const { colorScheme, typography, shape } = useMD3Theme();
 * <Text style={[typography.bodyLarge, { color: colorScheme.onSurface }]}>
 *   Hello
 * </Text>
 * ```
 */
export const useMD3Theme = (): MD3Theme => {
  return useContext(MD3ThemeContext);
};
