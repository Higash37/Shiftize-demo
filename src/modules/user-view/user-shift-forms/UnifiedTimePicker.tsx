import React, { useState } from "react";
import { View, Platform, TouchableOpacity, Text, Modal as RNModal, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { UnifiedTimePickerProps } from "./UnifiedTimePicker.types";
import { format } from "date-fns";

/**
 * UnifiedTimePicker - 統一された時間選択コンポーネント
 *
 * プラットフォームに応じて最適な時間選択UIを提供します。
 * iOSではモーダル表示、Androidでは直接ピッカーを表示します。
 */
const UnifiedTimePicker: React.FC<UnifiedTimePickerProps> = ({
  value,
  onChange,
  placeholder = "時間を選択",
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const openPicker = () => setShowPicker(true);
  const closePicker = () => setShowPicker(false);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    
    if (selectedTime) {
      onChange(selectedTime);
    }
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#E1E8ED",
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
      }}
    >
      <TouchableOpacity
        onPress={openPicker}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {value ? format(value, "HH:mm") : placeholder}
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <RNModal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={closePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={value || new Date()}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
              />
              <TouchableOpacity onPress={closePicker} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>完了</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RNModal>
      )}

      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    minWidth: 300,
  },
  doneButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UnifiedTimePicker;