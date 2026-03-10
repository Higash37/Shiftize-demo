/**
 * @file GanttHalfSwitch.tsx
 * @description ガントチャートの「前半／後半」切り替えトグルボタン。
 *   時間軸が長い場合に前半(9:00〜15:30)と後半(15:30〜22:00)を切り替える。
 *
 * 【このファイルの位置づけ】
 *   home-view > home-components > home-gantt 配下の UIパーツ。
 *   HomeGanttMobileScreen / HomeGanttTabletScreen から利用される。
 *
 * 主要Props:
 *   - showFirst: true=前半表示中、false=後半表示中
 *   - onChange: 切り替え時に親コンポーネントへ通知するコールバック
 */
import React from "react";
import { View, Pressable, Text } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

// --- Props定義 ---
interface GanttHalfSwitchProps {
  /** true なら前半が選択中 */
  showFirst: boolean;
  /** ユーザーが前半/後半を切り替えた時に呼ばれる */
  onChange: (showFirst: boolean) => void;
}

// --- Component ---
export const GanttHalfSwitch: React.FC<GanttHalfSwitchProps> = ({
  showFirst,
  onChange,
}) => {
  // MD3テーマからカラーやスペーシングを取得
  const theme = useMD3Theme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: theme.spacing.sm,
        gap: theme.spacing.sm,
      }}
    >
      <Pressable
        onPress={() => onChange(true)}
        style={{
          backgroundColor: showFirst
            ? theme.colorScheme.surface
            : theme.colorScheme.surfaceContainerHigh,
          borderRadius: theme.shape.small,
          paddingHorizontal: 18,
          paddingVertical: theme.spacing.sm,
          marginRight: theme.spacing.xs,
          borderWidth: showFirst ? 2 : 1,
          borderColor: showFirst ? theme.colorScheme.outlineVariant : theme.colorScheme.outline,
        }}
      >
        <Text
          style={{
            color: showFirst ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant,
            fontWeight: "bold",
          }}
        >
          前半
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange(false)}
        style={{
          backgroundColor: !showFirst
            ? theme.colorScheme.surface
            : theme.colorScheme.surfaceContainerHigh,
          borderRadius: theme.shape.small,
          paddingHorizontal: 18,
          paddingVertical: theme.spacing.sm,
          borderWidth: !showFirst ? 2 : 1,
          borderColor: !showFirst ? theme.colorScheme.outlineVariant : theme.colorScheme.outline,
        }}
      >
        <Text
          style={{
            color: !showFirst ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant,
            fontWeight: "bold",
          }}
        >
          後半
        </Text>
      </Pressable>
    </View>
  );
};
