import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { ConnectedStoreUser } from "./types";

interface UserSelectSectionProps {
  selectedUserId: string;
  setSelectedUserId: (userId: string) => void;
  users: Array<{ uid: string; nickname: string; color?: string }>;
  connectedStoreUsers: ConnectedStoreUser[];
  disabled?: boolean;
}

export const UserSelectSection: React.FC<UserSelectSectionProps> = ({
  selectedUserId,
  setSelectedUserId,
  users,
  connectedStoreUsers,
  disabled = false,
}) => {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>ユーザー選択 *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedUserId}
          onValueChange={setSelectedUserId}
          style={styles.picker}
          enabled={!disabled}
        >
          <Picker.Item label="選択してください" value="" />
          
          <Picker.Item
            label="--- 現在の店舗 ---"
            value=""
            enabled={false}
          />
          {users.map((user) => (
            <Picker.Item
              key={user.uid}
              label={user.nickname}
              value={user.uid}
            />
          ))}

          {connectedStoreUsers.length > 0 && (
            <>
              <Picker.Item
                label="--- 連携店舗 ---"
                value=""
                enabled={false}
              />
              {connectedStoreUsers.map((user) => (
                <Picker.Item
                  key={`${user.storeId}-${user.uid}`}
                  label={`${user.nickname} (${user.storeName})`}
                  value={`${user.storeId}:${user.uid}`}
                />
              ))}
            </>
          )}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: layout.spacing.medium,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.spacing.small,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    ...Platform.select({
      ios: {
        paddingVertical: layout.spacing.small,
      },
    }),
  },
  picker: {
    height: Platform.OS === "ios" ? 120 : 50,
  },
});