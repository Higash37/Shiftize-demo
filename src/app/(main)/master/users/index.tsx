import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import type { UserRole } from "@/common/common-models/model-user/UserModel";
import { useUser } from "@/modules/reusable-widgets/user-management/user-hooks/useUser";
import { UserForm } from "@/modules/reusable-widgets/user-management/user-props/UserForm";
import { UserList } from "@/modules/reusable-widgets/user-management/user-props/UserList";

import { User } from "@/common/common-models/model-user/UserModel";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useAuth } from "@/services/auth/useAuth";


interface UserFormData {
  email: string;
  password?: string;
  nickname: string;
  furigana?: string;
  role: UserRole;
  color?: string;
  storeId?: string;
  hourlyWage?: number;
}

interface UserWithPassword extends User {
  currentPassword?: string;
}

export default function UsersScreen() {
  const { user: currentUser } = useAuth();
  const { users, loading, error, addUser, editUser, removeUser } = useUser(
    currentUser?.storeId
  );
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPassword | null>(
    null
  );
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(
    {}
  );
  
  const handleAddUser = async (data: UserFormData) => {

    if (!data.password) {
      console.error('❌ [UsersScreen.handleAddUser] No password provided');
      return;
    }

    try {
      const newUser = await addUser(
        data.email,
        data.password,
        data.nickname,
        data.role,
        data.color,
        data.storeId,
        data.hourlyWage,
        data.furigana
      );

      if (newUser) {
        // パスワード情報をローカルに保存（必要に応じて）
        setUserPasswords((prev) => ({
          ...prev,
          [newUser.uid]: data.password!,
        }));
        
        // 成功時：フォームを閉じて一覧表示に戻る
        setIsAddingUser(false);
      }
    } catch (err) {
      console.error('❌ [UsersScreen.handleAddUser] Error occurred:', err);
      // エラーの場合はフォームを開いたままにして、ユーザーが再試行できるようにする
    }
  };
  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    try {
      
      const updateData = {
        nickname: data.nickname,
        ...(data.furigana !== undefined ? { furigana: data.furigana } : {}),
        role: data.role,
        ...(data.password ? { password: data.password } : {}),
        ...(data.color ? { color: data.color } : {}),
        ...(data.storeId ? { storeId: data.storeId } : {}),
      };
      
      
      const updatedUser = await editUser(selectedUser, updateData);

      if (updatedUser) {
        // パスワードが更新された場合、新しいパスワードを保存
        if (data.password) {
          const newPasswords = { ...userPasswords };
          delete newPasswords[selectedUser.uid];
          newPasswords[updatedUser.uid] = data.password;
          setUserPasswords(newPasswords);
        }

        // 成功時：フォームを閉じて一覧表示に戻る
        setSelectedUser(null);
      }
    } catch (err) {
      // エラーの場合はフォームを開いたままにして、ユーザーが再試行できるようにする
    }
  };
  const handleDeleteUser = async (userId: string) => {
    try {
      // ServiceProvider経由で削除フラグを設定
      await ServiceProvider.users.deleteUser(userId);

      // ユーザー一覧を更新してUIから削除
      removeUser(userId);

      // パスワード情報も削除
      const newPasswords = { ...userPasswords };
      delete newPasswords[userId];
      setUserPasswords(newPasswords);
    } catch (err) {
      // Error deleting user
    }
  };

  const handleSelectUser = (user: User) => {
    const currentPassword = userPasswords[user.uid];
    setSelectedUser({
      ...user,
      ...(currentPassword ? { currentPassword } : {}),
    });
    setIsAddingUser(false);
  };

  const handleStartAddUser = () => {
    setIsAddingUser(true);
    setSelectedUser(null);
  };

  const handleCancel = () => {
    setIsAddingUser(false);
    setSelectedUser(null);
  };

  const showForm = selectedUser !== null || isAddingUser;

  return (
    <View style={styles.root}>
      <MasterHeader title="ユーザー管理" />
      <View style={styles.container}>
        <UserList
          userList={users}
          loading={loading}
          onEdit={handleSelectUser}
          onDelete={handleDeleteUser}
          onAdd={handleStartAddUser}
          userPasswords={userPasswords}
        />
      </View>

      {/* ユーザー追加/編集モーダル（中央オーバーレイ） */}
      <Modal
        visible={showForm}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={handleCancel}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <UserForm
              onSubmit={selectedUser ? handleEditUser : handleAddUser}
              onCancel={handleCancel}
              initialData={selectedUser}
              currentPassword={selectedUser?.currentPassword || ""}
              error={error}
              loading={loading}
              mode={selectedUser ? "edit" : "add"}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: layout.padding.large,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: "90%",
    maxWidth: 500,
    maxHeight: "85%",
    overflow: "hidden",
    ...shadows.large,
  },
});
