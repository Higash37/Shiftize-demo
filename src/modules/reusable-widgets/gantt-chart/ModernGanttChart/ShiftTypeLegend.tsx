import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { ShiftTypeConfig } from "./types";

interface ShiftTypeLegendProps {
  shiftTypes: ShiftTypeConfig[];
  style?: any;
}

export const ShiftTypeLegend: React.FC<ShiftTypeLegendProps> = ({
  shiftTypes,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>シフト種別</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.legendContainer}
      >
        {shiftTypes.map((shiftType) => (
          <View key={shiftType.id} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: shiftType.backgroundColor },
              ]}
            />
            <Text style={styles.legendText}>{shiftType.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
  },
  legendContainer: {
    flexDirection: "row",
    gap: layout.padding.medium,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: layout.borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: "500",
  },
});
