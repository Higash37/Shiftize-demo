import React, { useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useUser } from "@/modules/child-components/user-management/user-hooks/useUser";
import { UserForm } from "@/modules/child-components/user-management/user-props/UserForm";
import { UserList } from "@/modules/child-components/user-management/user-props/UserList";

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
    if (!data.password) {
      return;
    }

    try {
      setIsAddingUser(true);
      const newUser = await addUser(
        data.email,
        data.password,
        data.nickname,
        data.role,
        data.color,
        data.storeId
      );

      if (newUser) {
        // パスワード情報をローカルに保存（必要に応じて）
        setUserPasswords((prev) => ({
          ...prev,
          [newUser.uid]: data.password!,
        }));
        // 追加後、フォームを閉じて一覧表示に戻る
        setIsAddingUser(false);
      }
    } catch (err) {
      // エラーメッセージの表示などはuseUserフック内で処理される
    } finally {
      // ローディング状態の解除はuseUserフック内で処理されるため、ここでは不要
      // setIsAddingUser(false); // ここでは解除しない
    }
  };
  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    try {
      const updatedUser = await editUser(selectedUser, {
        nickname: data.nickname,
        role: data.role,
        ...(data.password ? { password: data.password } : {}),
        color: data.color,
        storeId: data.storeId,
      });

      // パスワードが更新された場合、新しいパスワードを保存
      if (data.password && updatedUser) {
        const newPasswords = { ...userPasswords };
        delete newPasswords[selectedUser.uid];
        newPasswords[updatedUser.uid] = data.password;
        setUserPasswords(newPasswords);
      }

      setSelectedUser(null);
    } catch (err) {
      // Error handled by useUser hook
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
    setSelectedUser({
      ...user,
      currentPassword: userPasswords[user.uid],
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
        {selectedUser || isAddingUser ? (
          <View
            style={[
              styles.formContainer,
              isTablet && styles.formContainerTablet,
              isDesktop && styles.formContainerDesktop,
            ]}
          >
            <UserForm
              onSubmit={selectedUser ? handleEditUser : handleAddUser}
              onCancel={handleCancel}
              initialData={selectedUser}
              currentPassword={selectedUser?.currentPassword}
              error={error}
              loading={loading}
              mode={selectedUser ? "edit" : "add"}
            />
          </View>
        ) : (
          <UserList
            userList={users}
            loading={loading}
            onEdit={handleSelectUser}
            onDelete={handleDeleteUser}
            onAdd={handleStartAddUser}
            userPasswords={userPasswords}
          />
        )}
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
  formContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
    ...shadows.large,
  },
  formContainerTablet: {
    maxWidth: 600,
    width: "80%",
  },
  formContainerDesktop: {
    maxWidth: 700,
    width: "70%",
  },
});
