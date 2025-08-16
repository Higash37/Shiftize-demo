import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { styles } from "../../MasterShiftCreate.styles";
import type { ExtendedUser } from "@/modules/reusable-widgets/user-management/user-types/components";
import { ConnectedStoreUser } from "../types";

interface UserSelectSectionProps {
  users: ExtendedUser[];
  connectedStoreUsers: ConnectedStoreUser[];
  selectedUserId: string;
  searchQuery: string;
  onUserSelect: (userId: string, nickname: string) => void;
  onSearchChange: (query: string) => void;
}

export const UserSelectSection: React.FC<UserSelectSectionProps> = ({
  users,
  connectedStoreUsers,
  selectedUserId,
  searchQuery,
  onUserSelect,
  onSearchChange,
}) => {
  const filteredUsers = [...users, ...connectedStoreUsers].filter((user) =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ユーザー選択</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ユーザー検索..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
      <View style={styles.userListContainer}>
        {searchQuery.trim() === "" ? (
          <>
            <TouchableOpacity
              style={[
                styles.userItem,
                styles.recruitmentItem,
                selectedUserId === "recruitment" && styles.selectedUserItem,
              ]}
              onPress={() => {
                if (selectedUserId === "recruitment") {
                  onUserSelect("", "");
                } else {
                  onUserSelect("recruitment", "募集");
                }
              }}
            >
              <AntDesign 
                name="bells" 
                size={20} 
                color={selectedUserId === "recruitment" ? "#fff" : colors.primary} 
              />
              <Text style={[
                styles.userItemText, 
                styles.recruitmentText,
                selectedUserId === "recruitment" && styles.selectedUserItemText
              ]}>
                募集シフトとして作成
              </Text>
            </TouchableOpacity>
            <Text style={styles.noResultsText}>
              またはユーザー名で検索してください
            </Text>
          </>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <TouchableOpacity
              key={user.uid}
              style={[
                styles.userItem,
                selectedUserId === user.uid && styles.selectedUserItem,
              ]}
              onPress={() => {
                onUserSelect(user.uid, user.nickname);
              }}
            >
              <Text
                style={[
                  styles.userItemText,
                  selectedUserId === user.uid &&
                    styles.selectedUserItemText,
                ]}
              >
                {user.nickname} (
                {user.role === "master" ? "管理者" : "ユーザー"})
                {"storeName" in user &&
                  user.storeName &&
                  user.isFromOtherStore && (
                    <Text style={styles.storeNameText}>
                      {" "}
                      - {user.storeName}
                    </Text>
                  )}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResultsText}>
            ユーザーが見つかりません
          </Text>
        )}
      </View>
    </View>
  );
};