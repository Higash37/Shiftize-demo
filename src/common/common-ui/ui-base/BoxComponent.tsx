/**
 * @file BoxComponent.tsx
 * @description 汎用コンテナコンポーネント。variant/padding/shadow等でスタイルを制御する
 *
 * ============================================================
 * 【なぜ "Component" という名前が付くのか — React コンポーネントの概念】
 * ============================================================
 *
 * ■ Component = UI の部品
 *   React のコンポーネントは「レゴブロック」のようなもの。
 *   小さな部品（ボタン、テキスト入力、カード）を組み合わせて、
 *   大きな画面（ダッシュボード、シフト管理画面）を構築する。
 *   各コンポーネントは独立しており、他の場所でも再利用できる。
 *
 * ■ React の基本思想: UI = f(state)
 *   React では UI は「状態（state）の関数」と考える。
 *   状態（variant, padding, shadow 等）が変わると、React が自動的に
 *   UI を再描画する。開発者は「この状態の時にどう見えるべきか」を宣言するだけで、
 *   DOM の差分更新は React が効率的に処理する。
 *
 * ■ なぜ Box という汎用コンポーネントを作るのか
 *   HTML の <div> に相当するが、以下の理由で独自の Box を作る:
 *
 *   1. テーマ対応: アプリのテーマ（ダークモード等）に自動で対応する。
 *      素の <div> はテーマを知らないが、Box は useMD3Theme() 経由で
 *      現在のテーマカラーや影のスタイルを取得し、自動適用する。
 *
 *   2. 一貫したスタイル: variant="card", padding="medium" のように
 *      プロパティで指定するだけで、アプリ全体で統一されたスタイルが適用される。
 *      各開発者が独自のスタイルを書く必要がなくなる。
 *
 *   3. React Native 対応: React Native には HTML の <div> が存在しない。
 *      代わりに <View> を使うが、Box がその差異を吸収している。
 *      将来 Web 版と Native 版を切り替える場合も、Box の内部だけ変更すればよい。
 *
 *   4. 「BoxComponent」と「Component」を名前に含める理由:
 *      同じフォルダに BoxTypes.ts, BoxStyles.ts があるため、
 *      ファイル名で「これはコンポーネント本体である」ことを明示している。
 * ============================================================
 */
import React from "react";
import { View } from "react-native";
import { BoxProps, BoxStyleName } from "./BoxTypes";
import { createBoxStyles } from "./BoxStyles";
import { useThemedStyles } from "../../common-theme/md3/useThemedStyles";
import { useMD3Theme } from "../../common-theme/md3/MD3ThemeContext";

/**
 * シャドウスタイルを取得するヘルパー関数
 */
const shadowMap = {
  small: "level1",
  medium: "level2",
  large: "level3",
} as const;

/**
 * alignItems値を取得するヘルパー関数
 */
const getAlignItems = (
  align: string
): "flex-start" | "flex-end" | "center" | "stretch" | "baseline" => {
  const alignMap: Record<
    string,
    "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
  > = {
    start: "flex-start",
    end: "flex-end",
    center: "center",
    stretch: "stretch",
    baseline: "baseline",
  };

  return alignMap[align] || "flex-start";
};

/**
 * justifyContent値を取得するヘルパー関数
 */
const getJustifyContent = (
  justify: string
):
  | "flex-start"
  | "flex-end"
  | "space-between"
  | "space-around"
  | "space-evenly" => {
  const justifyMap: Record<
    string,
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly"
  > = {
    start: "flex-start",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
  };

  return justifyMap[justify] || "flex-start";
};

/**
 * Box - 汎用的なコンテナコンポーネント
 *
 * 様々なスタイルバリエーションを持ち、コンテンツを囲むための基本的な要素として使用できます。
 * レイアウトの構成要素として、コンテンツをグループ化するのに適しています。
 *
 * @example
 * ```tsx
 * <Box
 *   variant="card"
 *   padding="medium"
 *   margin="small"
 *   shadow="md"
 * >
 *   <Text>カードコンテンツ</Text>
 * </Box>
 * ```
 */
const Box: React.FC<BoxProps> = ({
  variant = "default",
  padding = "medium",
  margin = "none",
  shadow = "none",
  style,
  children,
  testID,
  direction = "column",
  align,
  justify,
  wrap,
  flex,
  gap,
  ...props
}) => {
  // --- Hooks ---
  const styles = useThemedStyles(createBoxStyles);
  const { elevation } = useMD3Theme();

  // --- Render ---
  const shadowStyle =
    shadow !== "none"
      ? elevation[shadowMap[shadow as keyof typeof shadowMap] ?? "level0"]
          ?.shadow
      : null;

  return (
    <View
      style={[
        styles["base"],
        styles[variant as BoxStyleName],
        styles[`padding_${padding}` as BoxStyleName],
        styles[`margin_${margin}` as BoxStyleName],
        shadowStyle,
        direction && { flexDirection: direction },
        align && { alignItems: getAlignItems(align) },
        justify && { justifyContent: getJustifyContent(justify) },
        wrap && { flexWrap: wrap },
        flex !== undefined && { flex },
        gap !== undefined && { gap },
        style,
      ]}
      testID={testID}
      {...props}
    >
      {children}
    </View>
  );
};

export default Box;
