/** @file LoadingOverlay.tsx
 *  @description 読み込み中に画面全体を覆う半透明オーバーレイ。
 *    isLoading が true の場合だけ表示される。
 */

// 【このファイルの位置づけ】
// - importされる先: GanttChartMonthView
// - 役割: シフト保存中などに画面操作を一時的にブロックするオーバーレイ。
//   position: absolute で親要素全体を覆い、pointerEvents: "auto" でタッチを吸収する。

import React from "react";
import { View, StyleSheet } from "react-native";

// React.FC<{ isLoading: boolean }>: isLoading を boolean で受け取る関数コンポーネントの型。
const LoadingOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <View style={[styles.overlay, { pointerEvents: "auto" }]} />
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});

export default LoadingOverlay;
