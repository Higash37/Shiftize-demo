import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { UserSelectSectionProps } from "./types";

export const UserSelectSection: React.FC<UserSelectSectionProps> = ({
  users,
  newShiftData,
  onChange,
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}>
        ユーザー
      </Text>
      <Picker
        selectedValue={newShiftData.userId}
        onValueChange={(value) => onChange("userId", value)}
        style={{ backgroundColor: "white" }}
      >
        <Picker.Item label="ユーザーを選択" value="" />
        {users.map((user) => (
          <Picker.Item
            key={user.uid}
            label={user.nickname}
            value={user.uid}
          />
        ))}
      </Picker>
    </View>
  );
};