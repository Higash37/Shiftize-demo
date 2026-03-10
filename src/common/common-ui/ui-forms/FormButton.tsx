/** @file FormButton.tsx @description MD3準拠の汎用ボタンコンポーネント */
// ============================================================================
// 【なぜ ".tsx" 拡張子なのか — .ts vs .tsx の使い分け】
// ============================================================================
// このファイルは「.tsx」だが、隣の FormButton.styles.ts は「.ts」になっている。
// この使い分けには明確な理由がある。
//
// ■ .ts（純粋な TypeScript）:
//   型定義、ユーティリティ関数、ロジックのみのファイルに使う。
//   例: FormButton.styles.ts, FormButton.types.ts, DateFormatter.ts
//
// ■ .tsx（TypeScript + JSX）:
//   JSX（HTMLライクな構文、例: <TouchableOpacity>）を含むファイルに使う。
//   例: FormButton.tsx, LoginForm.tsx
//
// ■ JSX の歴史:
//   Facebook が 2013年に React と一緒に発明した構文。
//   「HTMLをJavaScriptの中に書く」という当時は革新的な発想だった。
//   それ以前は document.createElement() や jQuery で DOM を操作するのが一般的で、
//   「JSの中にHTMLを混ぜるなんて汚い」と批判もあったが、
//   「UIの見た目（HTML）とロジック（JS）は本質的に結合している」という
//   React の哲学が広まり、今ではフロントエンド開発の標準となった。
//
// ■ なぜ拡張子を分けるのか:
//   TypeScript コンパイラが <Tag> という構文を見たとき、
//   .ts ファイルでは「型アサーション」（例: <string>value）として解釈し、
//   .tsx ファイルでは「JSX 要素」（例: <View>）として解釈する。
//   この曖昧さを避けるために拡張子で区別する。
//
// ■ ケースバイケース:
//   - UIコンポーネント（<View>, <Text> 等を使う）→ .tsx
//   - それ以外（型定義、スタイル、ユーティリティ）→ .ts
// ============================================================================
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { createButtonStyles } from "./FormButton.styles";
import { ButtonProps, ButtonStyleName } from "./FormButton.types";
import { useThemedStyles } from "../../common-theme/md3/useThemedStyles";
import { useMD3Theme } from "../../common-theme/md3/MD3ThemeContext";

/** MD3ボタン。variant/size/loading/disabledを制御可能。Props: ButtonProps */
const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}) => {
  // --- Hooks ---
  const styles = useThemedStyles(createButtonStyles);
  const { colorScheme } = useMD3Theme();

  // --- Render ---
  const indicatorColor =
    variant === "primary"
      ? colorScheme.onPrimary
      : colorScheme.primary;

  return (
    <TouchableOpacity
      style={[
        styles["base"],
        styles[variant],
        styles[`size_${size}` as ButtonStyleName],
        fullWidth && styles["fullWidth"],
        disabled && styles["disabled"],
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <Text
          style={[
            styles.text_base,
            styles[`text_${variant}` as ButtonStyleName],
            styles[`text_${size}` as ButtonStyleName],
          ]}
        >
          {typeof title === "string" ? title : "Button"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
