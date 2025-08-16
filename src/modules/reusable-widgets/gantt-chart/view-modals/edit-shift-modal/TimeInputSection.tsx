import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { TimeInput } from "@/common/common-ui/ui-input/TimeInput";
import { TimeInputSectionProps } from "./types";

export const TimeInputSection: React.FC<TimeInputSectionProps> = ({
  timeOptions,
  newShiftData,
  onChange,
  isManualInput,
  manualStartTime,
  manualEndTime,
  onTimeChange,
  onToggleManualInput,
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginRight: 10 }}>
          時間設定
        </Text>
        <TouchableOpacity
          onPress={onToggleManualInput}
          style={{
            backgroundColor: isManualInput ? "#007AFF" : "#f0f0f0",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 15,
          }}
        >
          <Text
            style={{
              color: isManualInput ? "white" : "#333",
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            手動入力
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ marginBottom: 5 }}>開始時間</Text>
          {isManualInput ? (
            <TimeInput
              value={manualStartTime}
              onChangeText={(value) => onTimeChange(value, true)}
              placeholder="HH:MM"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 10,
                backgroundColor: "white",
              }}
            />
          ) : (
            <Picker
              selectedValue={newShiftData.startTime}
              onValueChange={(value) => onChange("startTime", value)}
              style={{ backgroundColor: "white" }}
            >
              {timeOptions.map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ marginBottom: 5 }}>終了時間</Text>
          {isManualInput ? (
            <TimeInput
              value={manualEndTime}
              onChangeText={(value) => onTimeChange(value, false)}
              placeholder="HH:MM"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                padding: 10,
                backgroundColor: "white",
              }}
            />
          ) : (
            <Picker
              selectedValue={newShiftData.endTime}
              onValueChange={(value) => onChange("endTime", value)}
              style={{ backgroundColor: "white" }}
            >
              {timeOptions.map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>
          )}
        </View>
      </View>
    </View>
  );
};