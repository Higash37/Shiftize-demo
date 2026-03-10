/**
 * @file BoxTypes.ts
 * @description Boxコンポーネントの型定義
 *
 * ============================================================
 * 【なぜ ".types.ts" と ".styles.ts" を分けるのか — ファイル分割の設計思想】
 * ============================================================
 *
 * ■ 1ファイルに全部書く vs 分割する — ケースバイケースの判断基準
 *
 *   小さいコンポーネント（50行以下）:
 *     1ファイルでOK。型もスタイルもまとめて書く。
 *     例: シンプルなアイコンボタン、ラベル表示コンポーネント
 *     分割するとファイル数が増えすぎて逆に見通しが悪くなる。
 *
 *   中規模コンポーネント（100-300行）:
 *     .tsx + .types.ts + .styles.ts の3ファイルに分割する。← このBoxコンポーネントのパターン
 *     - BoxComponent.tsx: UIのロジックとレンダリング
 *     - BoxTypes.ts: 型定義（このファイル）
 *     - BoxStyles.ts: スタイル定義
 *     それぞれの責務が明確になり、変更時に影響範囲が分かりやすい。
 *
 *   大規模コンポーネント（300行以上）:
 *     さらに .hooks.ts（カスタムフック）、.utils.ts（ユーティリティ関数）に分割する。
 *     例: GanttChart のような複雑なコンポーネントは5-6ファイルに分かれることもある。
 *
 * ■ なぜ型定義を別ファイルにするか
 *   1. 再利用性: BoxProps を他のコンポーネントから import して使える。
 *      例えば BoxProps を extends して CardProps を作る、など。
 *   2. 循環参照の防止: A.tsx が B の型を必要とし、B.tsx が A の型を必要とする場合、
 *      型だけを別ファイルにしておけば .types.ts 同士で import でき、循環しない。
 *   3. ビルド最適化: `import type` で型だけを import すると、ビルド後の JavaScript には
 *      含まれない。型ファイルを分離すると、この最適化が自然に適用される。
 *   4. 見通しの良さ: 「このコンポーネントはどんな props を受け取るか？」を知りたい時に、
 *      .types.ts を見るだけで全体像が分かる。ロジックを読む必要がない。
 * ============================================================
 */
import { ViewProps } from "react-native";
import {
  Shadow,
  Variant,
  Padding,
  Margin,
  FlexContainerProps,
  BaseComponentProps,
} from "../componentTypes";

/**
 * Box コンポーネントのスタイル名
 */
export type BoxStyleName =
  | Variant
  | `padding_${Padding}`
  | `margin_${Margin}`
  | `shadow_${Shadow}`
  | "base";

/**
 * Box コンポーネントのプロパティ
 */
export interface BoxProps extends Omit<ViewProps, 'style'>, FlexContainerProps, BaseComponentProps {
  /**
   * 表示バリアント
   */
  variant?: Variant;

  /**
   * パディング設定
   */
  padding?: Padding;

  /**
   * マージン設定
   */
  margin?: Margin;

  /**
   * 影の設定
   */
  shadow?: Shadow;

  /**
   * 子要素
   */
  children?: React.ReactNode;
}
