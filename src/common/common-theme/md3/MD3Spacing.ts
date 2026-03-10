/**
 * @file MD3Spacing.ts
 * @description Material Design 3 のスペーシング（余白）システムを定義するファイル。
 *   マージン、パディング、ギャップなど、全ての余白をこのスケールで統一する。
 *
 * 【このファイルの位置づけ】
 *   ■ 上位ファイル（このファイルをimportしている）:
 *     - MD3ThemeContext.tsx     … lightTheme.spacing に使用
 *     - md3/index.ts           … 再エクスポート
 *     - index.ts (common-theme) … レガシー Theme.spacing に使用
 *     - ThemeDefinition.ts     … レガシー theme.spacing に使用
 *   ■ 下位ファイル: なし
 *   ■ テーマシステム全体での役割:
 *     MD3Spacing ─→ MD3ThemeContext ─→ useMD3Theme() ─→ 各コンポーネント
 *     （余白定義）   （テーマ統合）     （フックで取得） （画面で使用）
 *
 *   使用例:
 *     const { spacing } = useMD3Theme();
 *     <View style={{ padding: spacing.lg, gap: spacing.sm }}>
 *
 * 【MD3 スペーシングの考え方】
 *   MD3 では 4dp (4ピクセル) をベースとしたグリッドシステムを採用している。
 *   全てのスペーシング値は 4 の倍数:
 *     4, 8, 12, 16, 20, 24, 32, 40, 48
 *   これにより、レイアウトに一貫したリズムが生まれ、整然としたUIになる。
 */

/**
 * MD3SpacingScale インターフェース
 *
 * margin, padding, gap などに指定する数値（ピクセル）の段階定義。
 * 各プロパティには想定される使用場面をコメントで記載している。
 */
export interface MD3SpacingScale {
  /** 0dp - 余白なし */
  none: number;
  /** 4dp - アイコン内部、密なグループ間の余白。最小の余白 */
  xs: number;
  /** 8dp - チップ内部パディング、密なリスト間。よく使う小さな余白 */
  sm: number;
  /** 12dp - カード内部パディング、入力フィールド内部 */
  md: number;
  /** 16dp - 標準パディング、セクション間。最も頻繁に使う余白 */
  lg: number;
  /** 20dp - カード間、リストアイテム間のスペース */
  xl: number;
  /** 24dp - セクション間、ダイアログの内側パディング */
  xxl: number;
  /** 32dp - 大きなセクション間のスペース */
  xxxl: number;
  /** 40dp - ページの上部余白 */
  xxxxl: number;
  /** 48dp - 大きなセパレーション。最大の余白 */
  xxxxxl: number;
}

/**
 * スペーシングスケールの実際の値
 *
 * 全て 4dp の倍数になっていることに注目。
 * 例: xs(4), sm(8), md(12), lg(16) ... → 4, 4x2, 4x3, 4x4 ...
 *
 * どのサイズを使うか迷ったら:
 *   - コンポーネント内部の余白 → sm(8) 〜 md(12)
 *   - コンポーネント間の余白 → lg(16) 〜 xl(20)
 *   - セクション間の余白 → xxl(24) 〜 xxxl(32)
 */
export const md3Spacing: MD3SpacingScale = {
  none: 0,       // 余白なし
  xs: 4,         // 4dp - 最小の余白
  sm: 8,         // 8dp - 小さな余白
  md: 12,        // 12dp - 中くらいの余白
  lg: 16,        // 16dp - 標準の余白（最も使用頻度が高い）
  xl: 20,        // 20dp - やや大きな余白
  xxl: 24,       // 24dp - 大きな余白
  xxxl: 32,      // 32dp - かなり大きな余白
  xxxxl: 40,     // 40dp - 非常に大きな余白
  xxxxxl: 48,    // 48dp - 最大の余白
};
