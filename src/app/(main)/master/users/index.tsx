/**
 * @file master/users/index.tsx
 * @description マスター用ユーザー管理画面。ユーザーの追加・編集・削除を行う。
 *
 * 【このファイルの構成】
 * - UserList: ユーザー一覧表示（左側 or メインコンテンツ）
 * - UserForm: ユーザー追加/編集フォーム（Modal で表示）
 *
 * 【Modal の使い方】
 * React Native の Modal コンポーネントでオーバーレイ表示を実現する。
 * - visible: true で表示
 * - transparent: true で背景を透過（半透明のオーバーレイ）
 * - animationType: 表示/非表示のアニメーション方式
 * - onRequestClose: Android の「戻る」ボタン押下時のハンドラー
 *
 * 【TouchableOpacity のイベント伝播制御】
 * モーダルの背景タップで閉じる（handleCancel）が、
 * フォーム内のタップは閉じない（e.stopPropagation()）ようにしている。
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import type { UserRole } from "@/common/common-models/model-user/UserModel";
// useUser: ユーザーCRUD操作を提供するフック
import { useUser } from "@/modules/reusable-widgets/user-management/user-hooks/useUser";
// UserForm: ユーザー追加/編集フォーム
import { UserForm } from "@/modules/reusable-widgets/user-management/user-props/UserForm";
// UserList: ユーザー一覧表示
import { UserList } from "@/modules/reusable-widgets/user-management/user-props/UserList";

import { User } from "@/common/common-models/model-user/UserModel";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useAuth } from "@/services/auth/useAuth";

/** ユーザーフォームの入力データ型 */
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

/** User型にパスワード情報を追加した拡張型 */
interface UserWithPassword extends User {
  currentPassword?: string;
}

/**
 * UsersScreen: ユーザー管理画面。
 */
export default function UsersScreen() {
  // 現在のログインユーザー（店舗ID取得用）
  const { user: currentUser } = useAuth();
  // useUser: ユーザーCRUD操作（addUser, editUser, removeUser）を提供
  const { users, loading, error, addUser, editUser, removeUser } = useUser(
    currentUser?.storeId
  );
  // UI状態管理
  const [isAddingUser, setIsAddingUser] = useState(false);           // 追加モード
  const [selectedUser, setSelectedUser] = useState<UserWithPassword | null>(null);  // 編集中のユーザー
  // パスワード情報のローカルキャッシュ（DBには保存されない一時的な情報）
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({});

  /**
   * handleAddUser: 新しいユーザーを追加するハンドラー。
   */
  const handleAddUser = async (data: UserFormData) => {
    if (!data.password) {
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
        // パスワード情報をローカルに保存
        setUserPasswords((prev) => ({
          ...prev,
          [newUser.uid]: data.password!,
        }));
        // 成功時: フォームを閉じる
        setIsAddingUser(false);
      }
    } catch (err) {
      // エラー時: フォームを開いたまま（ユーザーが再試行できるように）
    }
  };

  /**
   * handleEditUser: 既存ユーザーを編集するハンドラー。
   */
  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    try {
      // 更新データの構築: 変更されたフィールドだけ含める
      // スプレッド構文 ...() で条件付きプロパティ追加
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
        // パスワードが更新された場合、ローカルキャッシュを更新
        if (data.password) {
          const newPasswords = { ...userPasswords };
          delete newPasswords[selectedUser.uid];
          newPasswords[updatedUser.uid] = data.password;
          setUserPasswords(newPasswords);
        }
        // 成功時: フォームを閉じる
        setSelectedUser(null);
      }
    } catch (err) {
      // エラー時: フォームを開いたまま
    }
  };

  /**
   * handleDeleteUser: ユーザーを削除するハンドラー（論理削除）。
   */
  const handleDeleteUser = async (userId: string) => {
    try {
      // ServiceProvider 経由で削除フラグを設定
      await ServiceProvider.users.deleteUser(userId);
      // UIからも削除
      removeUser(userId);
      // パスワード情報も削除
      const newPasswords = { ...userPasswords };
      delete newPasswords[userId];
      setUserPasswords(newPasswords);
    } catch (err) {
      // エラー処理
    }
  };

  /** ユーザーを選択して編集モードに入る */
  const handleSelectUser = (user: User) => {
    const currentPassword = userPasswords[user.uid];
    setSelectedUser({
      ...user,
      // パスワードキャッシュがあれば付与
      ...(currentPassword ? { currentPassword } : {}),
    });
    setIsAddingUser(false);
  };

  /** 追加モードを開始 */
  const handleStartAddUser = () => {
    setIsAddingUser(true);
    setSelectedUser(null);
  };

  /** フォームを閉じる */
  const handleCancel = () => {
    setIsAddingUser(false);
    setSelectedUser(null);
  };

  // フォームを表示するかどうか
  const showForm = selectedUser !== null || isAddingUser;

  return (
    <View style={styles.root}>
      <MasterHeader title="ユーザー管理" />
      <View style={styles.container}>
        {/* ユーザー一覧 */}
        <UserList
          userList={users}
          loading={loading}
          onEdit={handleSelectUser}
          onDelete={handleDeleteUser}
          onAdd={handleStartAddUser}
          userPasswords={userPasswords}
        />
      </View>

      {/* ── ユーザー追加/編集モーダル（中央オーバーレイ） ── */}
      <Modal
        visible={showForm}
        transparent={true}             // 背景を透過にする
        animationType="fade"           // フェードイン/アウトアニメーション
        onRequestClose={handleCancel}  // Androidの「戻る」ボタン
      >
        {/* 背景のオーバーレイ: タップで閉じる */}
        <TouchableOpacity
          activeOpacity={1}           // タップ時の透明度変化を無効化
          style={styles.modalOverlay}
          onPress={handleCancel}
        >
          {/* フォームのコンテナ: タップしても閉じない */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}  // イベント伝播を停止
          >
            {/* UserForm: mode="add" で追加、mode="edit" で編集 */}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",  // 半透明の黒背景
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: "90%",
    maxWidth: 500,          // 最大幅を制限（大画面でも広がりすぎない）
    maxHeight: "85%",       // 最大高さを制限
    overflow: "hidden",     // 角丸の外側をクリップ
    ...shadows.large,       // 大きなシャドウを適用
  },
});
