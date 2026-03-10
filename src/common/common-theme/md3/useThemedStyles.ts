/**
 * @file useThemedStyles.ts
 * @description テーマに応じた動的スタイルを生成するカスタムフック。
 *
 * 【このファイルの位置づけ】
 * - MD3ThemeContext.tsx の useMD3Theme() を内部で使用
 * - 各コンポーネントでテーマ対応のスタイルを効率的に生成するために使う
 * - 関連ファイル: MD3ThemeContext.tsx, MD3Theme.types.ts
 *
 * 【なぜこのフックが必要か】
 * React Nativeでは StyleSheet.create() でスタイルを事前定義するのが一般的だが、
 * テーマの色やサイズを使いたい場合は動的にスタイルを生成する必要がある。
 * このフックは useMemo を使い、テーマが変更された時だけスタイルを再計算する。
 */

import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useMD3Theme } from "./MD3ThemeContext";
import { MD3Theme } from "./MD3Theme.types";

/**
 * useThemedStyles - テーマ対応の動的スタイル生成フック
 *
 * ファクトリ関数（スタイルを作る関数）を受け取り、テーマ変更時にのみ再計算する。
 *
 * 【パフォーマンス最適化】
 * - useMemo でメモ化しているため、テーマもfactoryも変わらない限り再計算されない
 * - ファクトリ関数はコンポーネント外で定義すれば、参照が安定して不要な再計算を防げる
 *
 * 【TypeScript構文の解説】
 * - `<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>`
 *   → ジェネリクス型パラメータ。Tは「StyleSheetの名前付きスタイル」を満たす任意の型。
 *   extendsは「Tがこの型を満たすこと」という制約（型制約）を意味する。
 *   これにより、factoryが返すオブジェクトがStyleSheet互換であることをコンパイル時に保証する。
 *
 * @param factory - テーマを受け取りスタイルオブジェクトを返す関数
 * @returns テーマ対応のスタイルオブジェクト
 *
 * @example
 * ```tsx
 * // コンポーネント外でファクトリ関数を定義（参照が安定する）
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
 * // コンポーネント内で使用:
 * const styles = useThemedStyles(createStyles);
 * ```
 */
export function useThemedStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(factory: (theme: MD3Theme) => T): T {
  // useMD3Theme() でContextからテーマを取得
  const theme = useMD3Theme();

  // useMemo: themeまたはfactoryが変わった時だけfactory(theme)を再実行する
  // [theme, factory] → 依存配列。この値が変わった時だけメモ化された値を再計算
  return useMemo(() => factory(theme), [theme, factory]);
}
