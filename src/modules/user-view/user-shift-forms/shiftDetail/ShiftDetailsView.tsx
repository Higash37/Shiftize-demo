/** @file ShiftDetailsView.tsx
 *  @description シフト詳細表示コンポーネント。
 *    シフトに含まれるタイムスロット（勤務時間 / 授業時間）の一覧を
 *    ShiftTimeSlot コンポーネントで表示する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React / React Native / useThemedStyles / ShiftTimeSlot /
 *          types / styles（同ディレクトリ）
 *  - 利用先: ShiftListItem のアコーディオン展開時に表示される
 *
 *  【コンポーネント概要】
 *  - 表示内容: タイムスロットの縦並びリスト
 *  - 主要Props: timeSlots（TimeSlot[] 型の配列）
 */
import React from "react";
import { View } from "react-native";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { ShiftTimeSlot } from "./ShiftTimeSlot";
import { ShiftDetailsViewProps } from "./types";
import { createShiftDetailsViewStyles } from "./styles";

export const ShiftDetailsView: React.FC<ShiftDetailsViewProps> = ({
  timeSlots,
}) => {
  const styles = useThemedStyles(createShiftDetailsViewStyles);

  // --- Render ---
  // timeSlots 配列を map で展開し、各スロットを ShiftTimeSlot で表示
  return (
    <View style={styles.detailsContainer}>
      {timeSlots.map((slot, index) => (
        <ShiftTimeSlot
          key={index}
          type={slot.type}
          startTime={slot.startTime}
          endTime={slot.endTime}
          typeId={slot.typeId}
          typeName={slot.typeName}
        />
      ))}
    </View>
  );
};
