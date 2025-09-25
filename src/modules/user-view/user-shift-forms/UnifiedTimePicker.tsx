import React, { useState } from "react";
import { View, Platform, TouchableOpacity, Text, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { UnifiedTimePickerProps } from "./UnifiedTimePicker.types";
import { format } from "date-fns";
import { convertShadowForWeb } from "@/common/common-constants/ShadowConstants";
import { colors } from "@/common/common-constants/ThemeConstants";

/**
 * UnifiedTimePicker - 統一された時間選択コンポーネント
 *
 * React Native標準コンポーネントとnative date pickerを使用した軽量時間選択コンポーネントです。
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
        backgroundColor: colors.surfaceElevated,
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
      }}
    >
      <TouchableOpacity
        onPress={openPicker}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: "center",
        }}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 16, color: colors.text.primary }}>
          {format(value, "HH:mm")}
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={closePicker}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: colors.surface,
              margin: 20,
              borderRadius: 12,
              padding: 20,
              minWidth: 300,
              ...convertShadowForWeb({
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }),
            }}>
              <DateTimePicker
                value={value}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
              />
              <TouchableOpacity
                onPress={closePicker}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  marginTop: 16,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: colors.text.white, fontSize: 16, fontWeight: "600" }}>
                  完了
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={closePicker}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: colors.surface,
              margin: 20,
              borderRadius: 12,
              padding: 20,
              minWidth: 320,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}>
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
                  border: '1px solid ' + colors.border,
                  borderRadius: "8px",
                  marginBottom: "16px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                }}
              />
              <TouchableOpacity
                onPress={closePicker}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: colors.text.white, fontSize: 16, fontWeight: "600" }}>
                  完了
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
