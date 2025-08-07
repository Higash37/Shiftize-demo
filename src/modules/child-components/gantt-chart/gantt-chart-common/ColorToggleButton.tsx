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
      style={getButtonStyle(colorMode === "status" ? "toggle-active" : "toggle-inactive")}
    >
      <Ionicons
        name={colorMode === "status" ? "clipboard-outline" : "person-outline"}
        size={16}
        color={colorMode === "status" ? "#2196f3" : "#666"}
        style={UnifiedButtonStyles.buttonIcon}
      />
      <Text style={getButtonTextStyle(colorMode === "status" ? "toggle-active" : "toggle-inactive")}>
        {colorMode === "status" ? "ステータス色" : "講師色"}
      </Text>
    </TouchableOpacity>
  );
};