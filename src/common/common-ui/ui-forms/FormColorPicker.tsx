import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { designSystem } from "../../common-constants/DesignSystem";
import { colors } from "../../common-constants/ColorConstants";
import { shadows } from "../../common-constants/ShadowConstants";
import { layout } from "../../common-constants/LayoutConstants";
import { PRESET_COLORS } from "./FormColorPicker.constants";
import type { ColorPickerProps } from "./FormColorPicker.types";

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
                    selectedColor === color && styles.selectedColor,
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

const styles = StyleSheet.create({
  modalOverlay: {
    ...designSystem.modal.overlay,
  },
  modalContent: {
    ...designSystem.modal.modal,
    width: "80%",
    maxHeight: "80%",
  },
  title: {
    ...designSystem.text.welcomeText,
    fontSize: 18,
    marginBottom: layout.padding.medium,
  },
  colorList: {
    maxHeight: 300,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: layout.padding.small,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: layout.borderRadius.full,
    margin: 4,
    ...shadows.small,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: colors.primary,
    ...shadows.medium,
  },
  closeButton: {
    ...designSystem.button.outline,
    marginTop: layout.padding.medium,
  },
  closeButtonText: {
    ...designSystem.text.outlineButtonText,
  },
});

// デフォルトエクスポートを追加
export default ColorPicker;
