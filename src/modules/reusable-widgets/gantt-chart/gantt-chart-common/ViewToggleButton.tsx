/** @file ViewToggleButton.tsx
 *  @description 表示モードを「ガントチャート」と「カレンダー」で切り替えるボタン。
 */

// 【このファイルの位置づけ】
// - import元: UnifiedButtonStyles（統一ボタンスタイル）
// - importされる先: MonthSelectorBar（ツールバー内に配置）
// - 役割: viewMode を "gantt" ⇔ "calendar" でトグルする単機能ボタン。

import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "./UnifiedButtonStyles";

interface ViewToggleButtonProps {
  viewMode: "gantt" | "calendar";  // 現在の表示モード
  onToggle: () => void;            // 切替時のコールバック
}

export const ViewToggleButton: React.FC<ViewToggleButtonProps> = ({
  viewMode,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={getButtonStyle("toolbar")}
    >
      <Ionicons
        name={viewMode === "gantt" ? "grid-outline" : "calendar-outline"}
        size={18}
        color="#2196F3"
        style={UnifiedButtonStyles.buttonIcon}
      />
      <Text style={getButtonTextStyle("toolbar")}>
        {viewMode === "gantt" ? "ガントチャート" : "カレンダー"}
      </Text>
    </TouchableOpacity>
  );
};