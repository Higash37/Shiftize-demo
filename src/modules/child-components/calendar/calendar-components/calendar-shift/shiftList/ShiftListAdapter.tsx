import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { ShiftDetails } from "../shiftDetails/ShiftDetails";
import { ShiftAdapterProps } from "../../../calendar-types/shift.types";
import { Shift } from "@/common/common-models/ModelIndex";

/**
 * シフト詳細表示用のアダプターコンポーネント
 */
export const ShiftDetailsAdapter = memo<ShiftAdapterProps>(
  ({ shift, isOpen }) => {
    // isOpenがfalseの場合は何も表示しない
    if (!isOpen) {
      return null;
    }
    return (
      <View style={styles.detailsContainer}>
        <ShiftDetails shift={shift} isOpen={true} maxHeight={150} />
      </View>
    );
  }
);

// スタイルを定義
const styles = StyleSheet.create({
  detailsContainer: {
    marginHorizontal: 5,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
});
