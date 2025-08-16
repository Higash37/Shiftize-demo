import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShiftBarProps } from "./types";
import { getShiftOpacity } from "./helpers";

export const ShiftBar: React.FC<ShiftBarProps> = ({
  shiftId,
  x,
  width,
  color,
  isOvernight,
  shiftData,
  statusConfig,
  hideLabel,
  label,
  taskType = "regular",
  taskData,
  userRole,
  onPress,
  onTimeChange,
  onTaskAdd,
  styles,
}) => {
  const isEditable = userRole === "master" && onTimeChange;
  const opacity = shiftData ? getShiftOpacity(shiftData.status || "approved") : 1;

  const getBarStyle = () => {
    const baseStyle = {
      position: "absolute" as const,
      left: x,
      width,
      backgroundColor: color,
      opacity,
      borderRadius: 4,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      paddingHorizontal: 4,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.1)",
    };

    switch (taskType) {
      case "task":
        return {
          ...baseStyle,
          height: 20,
          top: 2,
          backgroundColor: taskData?.color || color,
          borderStyle: "dashed" as const,
        };
      case "recruitment":
        return {
          ...baseStyle,
          height: 24,
          backgroundColor: "#FFE0B2",
          borderColor: "#FF9800",
          borderWidth: 2,
        };
      default:
        return {
          ...baseStyle,
          height: 28,
          borderLeftWidth: isOvernight ? 3 : 1,
          borderLeftColor: isOvernight ? "#ff4444" : "rgba(0,0,0,0.1)",
        };
    }
  };

  const getLabelStyle = () => {
    return {
      fontSize: taskType === "task" ? 10 : 11,
      color: taskType === "recruitment" ? "#FF6F00" : "#fff",
      fontWeight: taskType === "recruitment" ? "600" : "normal",
    };
  };

  return (
    <TouchableOpacity
      style={getBarStyle()}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {!hideLabel && label && (
        <Text
          style={[styles.shiftText, getLabelStyle()]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      )}

      {taskType === "task" && taskData?.icon && (
        <Ionicons
          name={taskData.icon as any}
          size={14}
          color="#fff"
          style={{ marginLeft: 2 }}
        />
      )}

      {isEditable && taskType === "regular" && (
        <TouchableOpacity
          onPress={onTaskAdd}
          style={{
            padding: 2,
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: 2,
          }}
        >
          <Ionicons name="add-circle-outline" size={14} color="#fff" />
        </TouchableOpacity>
      )}

      {statusConfig && (
        <View
          style={{
            position: "absolute",
            top: -8,
            right: 2,
            backgroundColor: statusConfig.color,
            borderRadius: 2,
            paddingHorizontal: 4,
            paddingVertical: 1,
          }}
        >
          <Text style={{ fontSize: 8, color: "#fff", fontWeight: "600" }}>
            {statusConfig.shortLabel}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};