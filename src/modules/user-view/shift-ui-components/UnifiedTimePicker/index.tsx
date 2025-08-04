import React, { useState } from "react";
import { View, Platform } from "react-native";
import { Button, Portal, Modal } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { UnifiedTimePickerProps } from "./types";
import { format } from "date-fns";

/**
 * UnifiedTimePicker - 統一された時間選択コンポーネント
 *
 * React Native Paper と native date pickerを使用した時間選択コンポーネントです。
 * iOS、Android、Web環境で動作します。
 */
export default function UnifiedTimePicker({
  value,
  onChange,
}: Readonly<UnifiedTimePickerProps>) {
  const [showPicker, setShowPicker] = useState(false);

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const openPicker = () => {
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  return (
    <View
      style={{
        backgroundColor: "#F4F6FA",
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
      }}
    >
      <Button
        mode="outlined"
        onPress={openPicker}
        style={{
          backgroundColor: "white",
        }}
      >
        {format(value, "HH:mm")}
      </Button>

      {Platform.OS === "ios" && (
        <Portal>
          <Modal
            visible={showPicker}
            onDismiss={closePicker}
            contentContainerStyle={{
              backgroundColor: "white",
              margin: 20,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <DateTimePicker
              value={value}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
            />
            <Button onPress={closePicker} style={{ marginTop: 16 }}>
              完了
            </Button>
          </Modal>
        </Portal>
      )}

      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {Platform.OS === "web" && showPicker && (
        <Portal>
          <Modal
            visible={showPicker}
            onDismiss={closePicker}
            contentContainerStyle={{
              backgroundColor: "white",
              margin: 20,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <input
              type="time"
              value={format(value, "HH:mm")}
              onChange={(e) => {
                const timeValue = e.target.value;
                if (timeValue) {
                  const [hoursStr, minutesStr] = timeValue.split(":");
                  if (hoursStr && minutesStr) {
                    const newDate = new Date(value);
                    newDate.setHours(parseInt(hoursStr, 10), parseInt(minutesStr, 10));
                    onChange(newDate);
                  }
                }
              }}
              aria-label="時刻を選択"
              placeholder="00:00"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            />
            <Button onPress={closePicker}>完了</Button>
          </Modal>
        </Portal>
      )}
    </View>
  );
}
