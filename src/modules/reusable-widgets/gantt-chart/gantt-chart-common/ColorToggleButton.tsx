/** @file ColorToggleButton.tsx
 *  @description シフトバーの色表示モードを「ステータス色」と「講師色」で切り替えるボタン。
 */

// 【このファイルの位置づけ】
// - import元: UnifiedButtonStyles（統一ボタンスタイル）
// - importされる先: MonthSelectorBar（ツールバー内に配置）
// - 役割: colorMode を "status" ⇔ "user" でトグルする単機能ボタン。

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "./UnifiedButtonStyles";

// ColorToggleButtonProps: 現在のモードとトグル関数だけを受け取るシンプルなインターフェース。
interface ColorToggleButtonProps {
  colorMode: "status" | "user";  // "status" = ステータス色, "user" = ユーザー色
  onToggle: () => void;          // 切替時のコールバック
}

export const ColorToggleButton: React.FC<ColorToggleButtonProps> = ({
  colorMode,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={getButtonStyle("toolbar")}
    >
      <Ionicons
        name={colorMode === "status" ? "clipboard-outline" : "person-outline"}
        size={18}
        color="#2196F3"
        style={UnifiedButtonStyles.buttonIcon}
      />
      <Text style={getButtonTextStyle("toolbar")}>
        {colorMode === "status" ? "ステータス色" : "講師色"}
      </Text>
    </TouchableOpacity>
  );
};