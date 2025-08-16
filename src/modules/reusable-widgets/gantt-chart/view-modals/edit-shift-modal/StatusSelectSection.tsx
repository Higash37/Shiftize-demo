import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StatusSelectSectionProps } from "./types";

export const StatusSelectSection: React.FC<StatusSelectSectionProps> = ({
  statusConfigs,
  newShiftData,
  onChange,
  userRole,
}) => {
  // ステータスピッカーはroleがmasterのときのみ表示
  if (userRole !== "master") {
    return null;
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}>
        ステータス
      </Text>
      <Picker
        selectedValue={newShiftData.status}
        onValueChange={(value) => onChange("status", value)}
        style={{ backgroundColor: "white" }}
      >
        {statusConfigs.map((config) => (
          <Picker.Item
            key={config.status}
            label={config.label}
            value={config.status}
          />
        ))}
      </Picker>
    </View>
  );
};