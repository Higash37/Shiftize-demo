import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";

interface ShiftModalHeaderProps {
  mode: "create" | "edit" | "delete";
  onClose: () => void;
}

export const ShiftModalHeader: React.FC<ShiftModalHeaderProps> = ({
  mode,
  onClose,
}) => {
  const getTitle = () => {
    switch (mode) {
      case "create":
        return "シフト新規作成";
      case "edit":
        return "シフト編集";
      case "delete":
        return "シフト削除";
      default:
        return "シフト管理";
    }
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{getTitle()}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: layout.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  closeButton: {
    padding: layout.spacing.small,
  },
});