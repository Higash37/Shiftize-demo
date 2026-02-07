import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "./UnifiedButtonStyles";

interface ViewToggleButtonProps {
  viewMode: "gantt" | "calendar";
  onToggle: () => void;
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