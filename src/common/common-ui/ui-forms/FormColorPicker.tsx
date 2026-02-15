import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { PRESET_COLORS } from "./FormColorPicker.constants";
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
  initialColor = PRESET_COLORS[0],
}) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const styles = useThemedStyles(createColorPickerStyles);
  const { colorScheme } = useMD3Theme();

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    onSelectColor(color);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>色を選択</Text>
          <ScrollView style={styles.colorList}>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color },
                    selectedColor === color && {
                      borderWidth: 3,
                      borderColor: colorScheme.primary,
                    },
                  ]}
                  onPress={() => handleSelectColor(color)}
                />
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      maxHeight: "80%",
    },
    title: {
      ...theme.typography.titleLarge,
      color: theme.colorScheme.onSurface,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    colorList: {
      maxHeight: 300,
    },
    colorGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    colorItem: {
      width: 40,
      height: 40,
      borderRadius: theme.shape.full,
      margin: 4,
      ...theme.elevation.level1.shadow,
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
