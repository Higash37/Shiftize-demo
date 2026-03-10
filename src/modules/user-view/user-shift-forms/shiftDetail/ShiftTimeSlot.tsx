/** @file ShiftTimeSlot.tsx
 *  @description 個別のタイムスロット表示コンポーネント。
 *    「スタッフ」（勤務時間）と「授業」（class）を色分けして
 *    種別ラベル＋開始〜終了時間を1行で表示する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React / React Native / useMD3Theme / useThemedStyles /
 *          useTimeSegmentTypesContext（時間区分タイプの辞書）
 *  - 利用先: ShiftDetailsView 内でループ表示される
 *
 *  【コンポーネント概要】
 *  - 表示内容: [種別ラベル（アイコン+名前）] [開始時間 ~ 終了時間]
 *  - 主要Props: type（"user" or "class"）, startTime, endTime, typeId?, typeName?
 */
import React from "react";
import { View, Text } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useTimeSegmentTypesContext } from "@/common/common-context/TimeSegmentTypesContext";
import { ShiftTimeSlotProps } from "./types";
import { createShiftTimeSlotStyles } from "./styles";

export const ShiftTimeSlot: React.FC<ShiftTimeSlotProps> = ({
  type,
  startTime,
  endTime,
  typeId,
  typeName,
}) => {
  const theme = useMD3Theme();
  const styles = useThemedStyles(createShiftTimeSlotStyles);
  /** Context から時間区分タイプの辞書（id → TimeSegmentType）を取得 */
  const { typesMap } = useTimeSegmentTypesContext();

  // --- 表示用データの決定 ---
  // typeId が指定されていなければ「授業」という名前のデフォルトタイプを使う
  const defaultType = Object.values(typesMap).find((t) => t.name === "授業");
  // typeId があればそのタイプ、なければデフォルトタイプを使う
  const segType = typeId ? typesMap[typeId] : defaultType;
  // 表示名: タイプの名前 → typeName props → フォールバック「授業」
  const displayName = segType?.name || typeName || "授業";
  // 表示色: タイプの色 → class なら warning、user なら primary
  const displayColor = segType?.color || (type === "class" ? theme.colorScheme.warning : theme.colorScheme.primary);

  // --- Render ---
  return (
    <View style={styles.timeSlot}>
      <Text
        style={[
          styles.timeSlotText,
          styles.timeSlotType,
          {
            color: type === "class" ? displayColor : theme.colorScheme.primary,
          },
        ]}
      >
        {type === "class" ? `${segType?.icon ? segType.icon + " " : ""}${displayName}` : "スタッフ"}
      </Text>
      <Text style={styles.timeSlotTime}>
        {startTime}
        {" ~ "}
        {endTime}
      </Text>
    </View>
  );
};
