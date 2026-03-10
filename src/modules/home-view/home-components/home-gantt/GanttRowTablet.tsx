/**
 * @file GanttRowTablet.tsx
 * @description タブレット版ガントチャートの1行分。サンプルデータ用のセルを描画する。
 *
 * 【このファイルの位置づけ】
 *   home-view > home-components > home-gantt 配下の UIパーツ。
 *   HomeGanttTabletScreen で使われる。
 *   モバイル版 GanttRowMobile と同様の構造だが、タブレット向けにレイアウトを調整。
 */
import React from "react";
import { View, Text } from "react-native";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { createHomeViewStyles } from "../../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../../home-types/home-view-types";
import { MaterialIcons } from "@expo/vector-icons";

const isSlotActiveAtTime = (time: string, slot: { start: string; end: string }): boolean => {
  const isEndOfDay = time === slot.start && time === slot.end && time === "22:00";
  return isEndOfDay || (time >= slot.start && time < slot.end);
};

interface GanttRowTabletProps {
  time: string;
  names: string[];
  sampleSchedule: SampleScheduleColumn[];
  cellWidth: number;
  cellHeight: number;
  onCellPress?: (userName: string) => void;
}

export const GanttRowTablet: React.FC<GanttRowTabletProps> = ({
  time,
  names,
  sampleSchedule,
  cellWidth,
  cellHeight,
  onCellPress,
}) => {
  const styles = useThemedStyles(createHomeViewStyles);
  const theme = useMD3Theme();

  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: theme.colorScheme.outlineVariant,
      }}
    >
      <View
        style={[styles.positionCell, { width: cellWidth, height: cellHeight }]}
      >
        <Text style={styles.positionText}>{time}</Text>
      </View>
      {names.map((name) => {
        const slot = sampleSchedule
          .flatMap((col) => col.slots)
          .find((s) => s.name === name && isSlotActiveAtTime(time, s));
        return (
          <View
            key={name}
            style={[
              styles.cell,
              {
                width: cellWidth,
                height: cellHeight,
                backgroundColor: slot
                  ? slot.type === "class"
                    ? theme.colorScheme.surfaceContainerHigh
                    : undefined // スタッフのときは背景色なし
                  : undefined,
                borderColor: slot
                  ? slot.type === "class"
                    ? theme.colorScheme.outlineVariant
                    : theme.colorScheme.primary // スタッフのときは青枠
                  : undefined,
                borderWidth: slot ? 1 : 0,
                opacity: slot ? 1 : 0.1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row", // アイコンとテキストを横並び
              },
            ]}
            onTouchEnd={() => onCellPress && onCellPress(name)}
          >
            {slot && (
              <MaterialIcons
                name={slot.type === "class" ? "school" : "person"}
                size={16}
                color={
                  slot.type === "class" ? theme.colorScheme.onSurfaceVariant : theme.colorScheme.primary
                }
                style={{ marginRight: 4 }}
              />
            )}
            {slot && slot.task && (
              <Text
                style={[
                  styles.taskText,
                  slot.type !== "class" && { color: theme.colorScheme.primary }, // スタッフのときは青文字
                ]}
              >
                {slot.task}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};
