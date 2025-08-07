import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { ColorPicker } from "@/common/common-ui/ui-forms/FormColorPicker";
import { shiftStatusSettingsViewStyles as styles } from "./ShiftStatusSettingsView.styles";
import type { ShiftStatusSettingsViewProps } from "./ShiftStatusSettingsView.types";

export const ShiftStatusSettingsView: React.FC<
  ShiftStatusSettingsViewProps
> = ({
  statusConfigs,
  selectedStatus,
  isColorPickerVisible,
  onColorChange,
  onOpenColorPicker,
  onCloseColorPicker,
}) => {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "シフトステータス設定",
          headerShown: true,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ width: "70%", alignSelf: "center" }}
        showsVerticalScrollIndicator={false}
      >
        {statusConfigs.map((config) => (
          <View key={config.status} style={styles.statusItem}>
            <View style={styles.statusHeader}>
              <View
                style={[styles.colorPreview, { backgroundColor: config.color }]}
              />
              <Text style={styles.statusLabel}>{config.label}</Text>
            </View>
            <Text style={styles.description}>{config.description}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.colorButton}
                onPress={() => onOpenColorPicker(config.status)}
              >
                <Text style={styles.colorButtonText}>色を変更</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <ColorPicker
          visible={isColorPickerVisible}
          onClose={onCloseColorPicker}
          onSelectColor={(color: string) => {
            if (selectedStatus) {
              onColorChange(selectedStatus, color);
            }
          }}
          initialColor={
            selectedStatus
              ? statusConfigs.find((c) => c.status === selectedStatus)?.color
              : undefined
          }
        />
      </ScrollView>
    </View>
  );
};
