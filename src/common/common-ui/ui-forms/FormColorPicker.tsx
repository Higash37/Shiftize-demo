import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PRESET_COLORS, COLOR_GRID } from "./FormColorPicker.constants";
import type { ColorPickerProps } from "./FormColorPicker.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

/**
 * カラーピッカーコンポーネント
 * プリセットされた色から選択するためのモーダルUIを提供します
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  visible,
  onClose,
  onSelectColor,
  initialColor = PRESET_COLORS[0] ?? "#000000",
}) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const styles = useThemedStyles(createColorPickerStyles);
  const { colorScheme } = useMD3Theme();

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    onSelectColor(color);
  };

  const handleDone = () => {
    onSelectColor(selectedColor);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleDone}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header: icon + title */}
          <View style={styles.header}>
            <View style={[styles.previewIcon, { backgroundColor: selectedColor, borderWidth: 2, borderColor: colorScheme.outlineVariant }]} />
            <Text style={styles.title}>色を選択</Text>
          </View>
          {/* Color grid */}
          <View style={styles.colorGrid}>
            {COLOR_GRID.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.colorRow}>
                {row.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCell,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorCellSelected,
                    ]}
                    onPress={() => handleSelectColor(color)}
                  />
                ))}
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleDone}>
            <Text style={styles.closeButtonText}>決定</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createColorPickerStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.32)",
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      borderRadius: theme.shape.extraLarge,
      padding: theme.spacing.xxl,
      width: "80%",
      maxWidth: 360,
      maxHeight: "80%",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    previewIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    title: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.onSurface,
    },
    colorGrid: {
      gap: 2,
      marginBottom: theme.spacing.md,
      alignSelf: "stretch",
    },
    colorRow: {
      flexDirection: "row",
      gap: 2,
    },
    colorCell: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 3,
      maxWidth: 32,
      maxHeight: 32,
    },
    colorCellSelected: {
      borderWidth: 2,
      borderColor: theme.colorScheme.onSurface,
    },
    closeButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colorScheme.outline,
      borderRadius: theme.shape.full,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: "center",
      marginTop: theme.spacing.lg,
    },
    closeButtonText: {
      ...theme.typography.labelLarge,
      color: theme.colorScheme.primary,
    },
  });

export default ColorPicker;
