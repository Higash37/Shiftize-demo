import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { shadows } from "@/common/common-constants/ThemeConstants";

export type ShiftRuleValuePickerProps = {
  visible: boolean;
  values: number[];
  value: number;
  unit?: string;
  onSelect: (v: number) => void;
  onClose: () => void;
  title: string;
};

export const ShiftRuleValuePicker: React.FC<ShiftRuleValuePickerProps> = ({
  visible,
  values,
  value,
  unit,
  onSelect,
  onClose,
  title,
}) => {
  const [selected, setSelected] = useState(value);
  const currentIdx = values.indexOf(selected);
  const prev = values[currentIdx - 1];
  const next = values[currentIdx + 1];

  const handleAdd = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.pickerModal}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.row2col}>
            <View style={styles.calendarCol}>
              <Text style={styles.calendarTitle}>{title}</Text>
              <View style={styles.calendarPlaceholder}>
                <Text style={{ color: "#888" }}>カレンダーUI</Text>
              </View>
            </View>
            <View style={styles.listCol}>
              <View style={styles.valueListScroll}>
                {values.map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.valueItem,
                      v === selected && styles.selectedItem,
                    ]}
                    onPress={() => setSelected(v)}
                  >
                    <Text
                      style={[
                        styles.valueText,
                        v === selected && styles.selectedText,
                      ]}
                    >
                      {v}
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.pickerFooterRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "80%",
    maxWidth: 600,
    minWidth: 320,
    maxHeight: "80%",
    alignItems: "center",
    ...shadows.modal,
  },
  row2col: {
    flexDirection: "row",
    width: "100%",
    minHeight: 320,
    marginBottom: 16,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  calendarCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: 24,
    borderRightWidth: 1,
    borderRightColor: "#eee",
    minWidth: 240,
    maxWidth: 320,
  },
  listCol: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingLeft: 24,
    minWidth: 120,
    maxWidth: 180,
    height: 320,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1976D2",
  },
  calendarPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  valueListScroll: {
    flex: 1,
    width: "100%",
    maxHeight: 180,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    paddingVertical: 4,
    overflow: "scroll",
  },
  valueItem: {
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  selectedItem: {
    backgroundColor: "#E3F2FD",
  },
  valueText: {
    fontSize: 18,
    color: "#222",
  },
  selectedText: {
    color: "#1976D2",
    fontWeight: "bold",
  },
  pickerFooterRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 24,
    marginBottom: 16,
    gap: 32,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    zIndex: 10,
  },
  addButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    minWidth: 120,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  cancelButtonText: {
    color: "#888",
    fontSize: 16,
  },
});
