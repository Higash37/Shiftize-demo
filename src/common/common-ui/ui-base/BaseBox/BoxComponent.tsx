import React from "react";
import { View } from "react-native";
import { BoxProps, BoxStyleName } from "./BoxTypes";
import { styles } from "./BoxStyles";
import { theme } from "../../../common-theme/ThemeDefinition";

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
  direction = "column",
  align,
  justify,
  wrap,
  flex,
  gap,
  testID,
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant as BoxStyleName],
        styles[`padding_${padding}` as BoxStyleName],
        styles[`margin_${margin}` as BoxStyleName],
        shadow !== "none" &&
          theme.shadows[
            shadow === "small"
              ? "sm"
              : shadow === "medium"
              ? "md"
              : shadow === "large"
              ? "lg"
              : "none"
          ],
        direction && { flexDirection: direction },
        align && {
          alignItems:
            align === "start"
              ? "flex-start"
              : align === "end"
              ? "flex-end"
              : align === "center"
              ? "center"
              : align === "stretch"
              ? "stretch"
              : align === "baseline"
              ? "baseline"
              : "flex-start",
        },
        justify && {
          justifyContent:
            justify === "start"
              ? "flex-start"
              : justify === "end"
              ? "flex-end"
              : justify === "between"
              ? "space-between"
              : justify === "around"
              ? "space-around"
              : justify === "evenly"
              ? "space-evenly"
              : justify,
        },
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
