import React, { useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useUser } from "@/modules/reusable-widgets/user-management/user-hooks/useUser";
import { UserForm } from "@/modules/reusable-widgets/user-management/user-props/UserForm";
import { UserList } from "@/modules/reusable-widgets/user-management/user-props/UserList";

import { User } from "@/common/common-models/model-user/UserModel";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { db } from "@/services/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/services/auth/useAuth";


interface UserFormData {
  email: string;
  password?: string;
  nickname: string;
  role: "master" | "user";
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
  const { width } = useWindowDimensions();
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPassword | null>(
    null
  );
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(
    {}
  );
  
  const handleAddUser = async (data: UserFormData) => {
    console.log('🚀 [UsersScreen.handleAddUser] Starting user addition', data);

    if (!data.password) {
      console.error('❌ [UsersScreen.handleAddUser] No password provided');
      return;
    }

    try {
      console.log('🔥 [UsersScreen.handleAddUser] Calling addUser hook');
      const newUser = await addUser(
        data.email,
        data.password,
        data.nickname,
        data.role,
        data.color,
        data.storeId,
        data.hourlyWage
      );
      console.log('✅ [UsersScreen.handleAddUser] User added successfully:', newUser);

      if (newUser) {
        // パスワード情報をローカルに保存（必要に応じて）
        setUserPasswords((prev) => ({
          ...prev,
          [newUser.uid]: data.password!,
        }));
        
        // 成功時：フォームを閉じて一覧表示に戻る
        console.log('✅ [UsersScreen.handleAddUser] Closing form');
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
        email: data.email, // メールアドレス更新を追加
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
      // Firestoreで削除フラグを設定
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { deleted: true }, { merge: true });

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

  return (
    <View style={styles.root}>
      <MasterHeader title="ユーザー管理" />
      <View style={styles.container}>
        <View style={[
          styles.mainContent,
          isDesktop && styles.mainContentDesktop
        ]}>
          {/* ユーザーリスト：常に表示 */}
          <View style={[
            styles.listContainer,
            isDesktop && styles.listContainerDesktop,
            (selectedUser || isAddingUser) && isDesktop && styles.listContainerWithPanel,
            (selectedUser || isAddingUser) && !isDesktop && styles.listContainerHidden,
          ]}>
            <UserList
              userList={users}
              loading={loading}
              onEdit={handleSelectUser}
              onDelete={handleDeleteUser}
              onAdd={handleStartAddUser}
              userPasswords={userPasswords}
            />
          </View>

          {/* フォームパネル：サイドパネルとして表示 */}
          {(selectedUser || isAddingUser) && (
            <View style={[
              styles.panelContainer,
              isDesktop ? styles.panelContainerDesktop : styles.panelContainerMobile,
            ]}>
              <UserForm
                onSubmit={selectedUser ? handleEditUser : handleAddUser}
                onCancel={handleCancel}
                initialData={selectedUser}
                currentPassword={selectedUser?.currentPassword || ""}
                error={error}
                loading={loading}
                mode={selectedUser ? "edit" : "add"}
              />
            </View>
          )}
        </View>
      </View>
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
  
  // メインコンテンツコンテナ
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  mainContentDesktop: {
    flexDirection: "row",
    gap: layout.padding.large,
  },

  // ユーザーリストコンテナ
  listContainer: {
    flex: 1,
  },
  listContainerDesktop: {
    flex: 1,
    minWidth: 400,
  },
  listContainerWithPanel: {
    flex: 1,
    maxWidth: "60%", // デスクトップでパネル表示時はリストを60%に制限
  },
  listContainerHidden: {
    display: "none", // モバイルでパネル表示時はリストを非表示
  },

  // フォームパネルコンテナ
  panelContainer: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.large,
  },
  panelContainerDesktop: {
    flex: 1,
    maxWidth: 500,
    minWidth: 400,
  },
  panelContainerMobile: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    margin: layout.padding.medium,
  },
});
