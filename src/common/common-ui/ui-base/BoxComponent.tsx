import React from "react";
import { View } from "react-native";
import { BoxProps, BoxStyleName } from "./BoxTypes";
import { styles } from "./BoxStyles";
import { theme } from "../../common-theme/ThemeDefinition";

/**
 * シャドウスタイルを取得するヘルパー関数
 */
const getShadowStyle = (shadow: string) => {
  if (shadow === "none") {
    return null;
  }

  const shadowMap: Record<string, "sm" | "md" | "lg" | "none"> = {
    small: "sm",
    medium: "md",
    large: "lg",
  };

  const shadowKey = shadowMap[shadow] || "none";
  return theme.shadows[shadowKey];
};

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
  const shadowStyle = getShadowStyle(shadow);

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
