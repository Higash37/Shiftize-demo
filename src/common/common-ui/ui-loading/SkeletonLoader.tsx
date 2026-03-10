/** @file SkeletonLoader.tsx @description 読み込み中のプレースホルダー表示用スケルトンコンポーネント群 */
import React from "react";
import { View, StyleSheet, ViewStyle, DimensionValue } from "react-native";

/** SkeletonBoxのProps */
interface SkeletonBoxProps {
  /** 幅 */
  width: DimensionValue;
  /** 高さ */
  height: DimensionValue;
  /** 角丸（デフォルト: 8） */
  borderRadius?: number;
  /** スタイルのオーバーライド */
  style?: ViewStyle;
}

/** 単一のスケルトンボックス */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => (
  <View
    style={[
      {
        width,
        height,
        borderRadius,
        backgroundColor: "#e0e0e0",
        marginVertical: 8,
      } as ViewStyle,
      style,
    ]}
  />
);

/** YouTube埋め込み風のスケルトン */
export const YoutubeSkeleton: React.FC = () => (
  <View style={{ padding: 16 }}>
    <SkeletonBox width={"100%"} height={200} borderRadius={12} />
    <SkeletonBox width={"60%"} height={24} />
    <SkeletonBox width={"40%"} height={18} />
    <SkeletonBox width={"80%"} height={18} />
  </View>
);

/** ガントチャート風のグリッドスケルトン */
export const GanttSkeleton: React.FC<{
  rows: number;
  columns: number;
  cellWidth: number;
  cellHeight: number;
}> = ({ rows, columns, cellWidth, cellHeight }) => {
  const rowKeys = Array.from(
    { length: rows },
    (_, i) => `gantt-row-${i}-${columns}`
  );

  return (
    <View style={{ flexDirection: "column", padding: 16 }}>
      {rowKeys.map((rowKey, rowIndex) => (
        <View key={rowKey} style={{ flexDirection: "row", marginBottom: 8 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonBox
              key={`${rowKey}-cell-${colIndex}`}
              width={cellWidth}
              height={cellHeight}
              style={{ marginRight: 8 }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({});
