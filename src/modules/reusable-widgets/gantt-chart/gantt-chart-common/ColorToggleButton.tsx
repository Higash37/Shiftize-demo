import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "./UnifiedButtonStyles";

interface ColorToggleButtonProps {
  colorMode: "status" | "user";
  onToggle: () => void;
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