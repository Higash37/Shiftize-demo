/**
 * @file MD3Shape.ts
 * @description Material Design 3 のシェイプスケール（角丸の大きさ）を定義するファイル。
 *   UI要素の角の丸みを統一的に管理する。
 *
 * 【このファイルの位置づけ】
 *   ■ 上位ファイル（このファイルをimportしている）:
 *     - MD3ThemeContext.tsx     … lightTheme.shape に使用
 *     - md3/index.ts           … 再エクスポート
 *     - index.ts (common-theme) … レガシー Theme.borderRadius に使用
 *     - ThemeDefinition.ts     … レガシー theme.borderRadius に使用
 *   ■ 下位ファイル: なし（このファイルは他をimportしていない）
 *   ■ テーマシステム全体での役割:
 *     MD3Shape ─→ MD3ThemeContext ─→ useMD3Theme() ─→ 各コンポーネント
 *     （角丸定義）  （テーマ統合）     （フックで取得） （画面で使用）
 *
 *   使用例:
 *     const { shape } = useMD3Theme();
 *     <View style={{ borderRadius: shape.medium }}>  // 角丸12px
 *
 * 【MD3 シェイプの考え方】
 *   MD3 ではコンポーネントのサイズや重要度に応じて角丸の大きさが決まる:
 *   - 小さいUI要素 → 小さい角丸（extraSmall: 4px）
 *   - 中くらいのUI要素 → 中くらいの角丸（medium: 12px）
 *   - 大きいUI要素 → 大きい角丸（extraLarge: 28px）
 *   - 完全な円形 → full: 9999px（どんなサイズでも円になる）
 */

/**
 * MD3ShapeScale インターフェース
 *
 * borderRadius に指定する数値（ピクセル）の段階定義。
 * 数値が大きいほど角が丸くなる。
 */
export interface MD3ShapeScale {
  /** 0px - 角丸なし。完全な直角 */
  none: number;
  /** 4px - チップ、スナックバー。ほんのわずかな丸み */
  extraSmall: number;
  /** 8px - ボタン、テキストフィールド。控えめな丸み */
  small: number;
  /** 12px - カード、ダイアログ。標準的な丸み */
  medium: number;
  /** 16px - FAB、ナビゲーションドロワー。しっかりした丸み */
  large: number;
  /** 28px - ボトムシート。大きな丸み */
  extraLarge: number;
  /** 9999px - アバター、バッジ。完全な円形（値を大きくすることで確実に丸くなる） */
  full: number;
}

/**
 * シェイプスケールの実際の値
 *
 * CSS/React Native の borderRadius プロパティに使う数値。
 * 例: borderRadius: md3Shape.medium → 角が12pxの丸みになる
 *
 * full: 9999 について:
 *   borderRadius に非常に大きい値を指定すると、要素が正方形なら完全な円になる。
 *   高さの半分以上の値を指定すれば丸くなるので、9999 ならどんなサイズでもOK。
 */
export const md3Shape: MD3ShapeScale = {
  none: 0,          // 直角（角丸なし）
  extraSmall: 4,    // ほんのり丸い
  small: 8,         // 控えめに丸い
  medium: 12,       // 標準的な丸み
  large: 16,        // しっかり丸い
  extraLarge: 28,   // かなり丸い
  full: 9999,       // 完全な円形
};
