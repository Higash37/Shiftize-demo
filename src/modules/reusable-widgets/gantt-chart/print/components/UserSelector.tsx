import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShiftItem } from "@/common/common-models/ModelIndex";

interface UserSelectorProps {
  users: Array<{ uid: string; nickname: string; color?: string }>;
  selectedUsers: string[];
  shifts: ShiftItem[];
  selectedDate: Date;
  onToggleUser: (userId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUsers,
  shifts,
  selectedDate,
  onToggleUser,
  onSelectAll,
  onClearSelection,
}) => {
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();

  // 該当月にシフトがあるユーザーかどうかをチェック
  const hasShiftsInMonth = (userId: string) => {
    return shifts.some((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shift.userId === userId &&
        shift.status !== "deleted" &&
        shift.status !== "rejected" &&
        shiftDate.getFullYear() === selectedYear &&
        shiftDate.getMonth() === selectedMonth
      );
    });
  };

  const usersWithShifts = users.filter((user) => hasShiftsInMonth(user.uid));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>印刷対象スタッフ</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={onSelectAll}
          >
            <Text style={styles.selectButtonText}>全て選択</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={onClearSelection}
          >
            <Text style={styles.selectButtonText}>選択解除</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.userList}>
        {usersWithShifts.map((user) => (
          <TouchableOpacity
            key={user.uid}
            style={[
              styles.userItem,
              selectedUsers.includes(user.uid) && styles.userItemSelected,
            ]}
            onPress={() => onToggleUser(user.uid)}
          >
            <Ionicons
              name={
                selectedUsers.includes(user.uid)
                  ? "checkbox"
                  : "square-outline"
              }
              size={20}
              color={selectedUsers.includes(user.uid) ? "#2563eb" : "#6b7280"}
            />
            <Text style={styles.userName}>{user.nickname}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedUsers.length > 0 && (
        <Text style={styles.selectedCount}>
          {selectedUsers.length}人選択中
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
  selectButtonText: {
    fontSize: 12,
    color: "#374151",
  },
  userList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  userItemSelected: {
    backgroundColor: "#eff6ff",
  },
  userName: {
    marginLeft: 10,
    fontSize: 14,
  },
  selectedCount: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});