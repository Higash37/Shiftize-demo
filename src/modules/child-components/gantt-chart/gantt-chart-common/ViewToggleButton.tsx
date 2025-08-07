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
      style={[getButtonStyle(viewMode === "gantt" ? "toggle-active" : "toggle-inactive"), { marginTop: 0 }]}
    >
      <Ionicons
        name={viewMode === "gantt" ? "grid-outline" : "calendar-outline"}
        size={16}
        color={viewMode === "gantt" ? "#2196f3" : "#666"}
        style={UnifiedButtonStyles.buttonIcon}
      />
      <Text style={getButtonTextStyle(viewMode === "gantt" ? "toggle-active" : "toggle-inactive")}>
        {viewMode === "gantt" ? "ガントチャート" : "カレンダー"}
      </Text>
    </TouchableOpacity>
  );
};