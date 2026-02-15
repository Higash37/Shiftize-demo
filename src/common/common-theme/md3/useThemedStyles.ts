import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useMD3Theme } from "./MD3ThemeContext";
import { MD3Theme } from "./MD3Theme.types";

/**
 * テーマに応じた動的スタイルを生成するフック
 *
 * StyleSheet.create をテーマ変更時にのみ再計算する。
 * ファクトリ関数の参照が安定している限り、不要な再生成は行われない。
 *
 * @param factory テーマを受け取りスタイルオブジェクトを返す関数
 * @returns テーマ対応のスタイルオブジェクト
 *
 * @example
 * ```tsx
 * const createStyles = (theme: MD3Theme) => StyleSheet.create({
 *   container: {
 *     backgroundColor: theme.colorScheme.surface,
 *     padding: theme.spacing.lg,
 *     borderRadius: theme.shape.medium,
 *   },
 *   title: {
 *     ...theme.typography.titleLarge,
 *     color: theme.colorScheme.onSurface,
 *   },
 * });
 *
 * // コンポーネント内:
 * const styles = useThemedStyles(createStyles);
 * ```
 */
export function useThemedStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(factory: (theme: MD3Theme) => T): T {
  const theme = useMD3Theme();

  return useMemo(() => factory(theme), [theme, factory]);
}
