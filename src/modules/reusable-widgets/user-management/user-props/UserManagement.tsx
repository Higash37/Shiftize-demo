import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { User } from "@/common/common-models/model-user/UserModel";
import { UserList } from "./UserList";
import { UserForm } from "./UserForm";
import { InviteUserForm } from "./InviteUserForm";
import { UserManagementProps } from "../user-types/components";
import { colors, typography } from "@/common/common-constants/ThemeConstants";
import { AntDesign, Ionicons } from "@expo/vector-icons";

/**
 * ユーザー管理コンポーネント
 * ユーザー一覧の表示、追加、編集、削除などの管理機能を提供します
 */
const UserManagement: React.FC<UserManagementProps> = ({ userId }) => {
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(
    {}
  );
  // ユーザーデータを取得する
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList: User[] = [];
      usersSnapshot.forEach((doc) => {
        usersList.push({ uid: doc.id, ...doc.data() } as User);
      });
      setUserList(usersList);
      setError(null);
    } catch (err: any) {
      setError("ユーザーデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  // ユーザーを編集する
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  // ユーザーを削除する
  const handleDeleteUser = async (userId: string) => {
    // 削除処理は実際には実装しないでダミー実装とする
    setLoading(true);
    try {
      // 実際にFirebaseからユーザーを削除する処理が入る

      // 削除後に一覧を更新
      setUserList(userList.filter((user: User) => user.uid !== userId));
    } catch (err) {
      setError("ユーザーの削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // ユーザーの追加/更新
  const handleSubmitUser = async (data: {
    email: string;
    password?: string;
    nickname: string;
    role: "master" | "user";
  }) => {
    setLoading(true);
    try {
      if (selectedUser) {
        // 既存ユーザーの更新処理（実際には実装しない）

        // ユーザー一覧を更新
        const updatedUsers = userList.map((user: User) =>
          user.uid === selectedUser.uid
            ? { ...user, nickname: data.nickname, role: data.role }
            : user
        );
        setUserList(updatedUsers);
      } else {
        // 新規ユーザーの追加処理（実際には実装しない）
        const newUserId = `user_${Date.now()}`;

        // 追加したユーザーを一覧に追加
        const newUser: User = {
          uid: newUserId,
          nickname: data.nickname,
          role: data.role,
        };
        setUserList([...userList, newUser]);

        // 仮パスワードを保存
        if (data.password) {
          setUserPasswords({
            ...userPasswords,
            [newUserId]: data.password,
          });
        }
      }

      // フォームを閉じる
      setShowForm(false);
      setSelectedUser(null);
    } catch (err) {
      setError("ユーザーの保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 招待成功時の処理
  const handleInviteSuccess = () => {
    setShowInviteForm(false);
    // ユーザーリストを再読み込み
    fetchUsers();
  };

  // フォームのキャンセル処理
  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedUser(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>ユーザー管理</Text>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => setShowInviteForm(true)}
        >
          <Ionicons name="person-add" size={20} color={colors.background} />
          <Text style={styles.inviteButtonText}>ユーザー招待</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showForm ? (
        <UserForm
          onSubmit={handleSubmitUser}
          onCancel={handleCancelForm}
          initialData={selectedUser}
          mode={selectedUser ? "edit" : "add"}
          loading={loading}
          error={error}
          currentPassword={
            selectedUser ? userPasswords[selectedUser.uid] ?? "" : ""
          }
        />
      ) : (
        <UserList
          userList={userList}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onAdd={() => setShowForm(true)}
          loading={loading}
          userPasswords={userPasswords}
        />
      )}

      {/* 招待フォームのモーダル */}
      <Modal
        visible={showInviteForm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInviteForm(false)}
      >
        <InviteUserForm
          onSuccess={handleInviteSuccess}
          onCancel={() => setShowInviteForm(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: "700",
    color: colors.text.primary,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  inviteButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.medium,
    fontWeight: "600",
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.error + "15",
    borderRadius: 8,
  },
});

export default UserManagement;
