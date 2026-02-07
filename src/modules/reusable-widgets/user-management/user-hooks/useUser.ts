import { useState, useEffect } from "react";
import { User } from "@/common/common-models/model-user/UserModel";
import {
  getUsers as getUsersService,
  deleteUser,
  checkMasterExists,
  checkEmailExists,
} from "@/services/firebase/firebase-user";
import { createUser, updateUser } from "@/services/firebase/firebase-auth";

export const useUser = (storeId?: string) => {
  const [users, setUsers] = useState<(User & { currentPassword?: string })[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeId) {
      fetchUsers();
    }
  }, [storeId]);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getUsersService(storeId);
      setUsers(userData);
      setError(null);
    } catch (err) {
      setError("ユーザー情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };
  // For backward compatibility with old naming
  async function fetchUMembers() {
    await fetchUsers();
  }
  const addUser = async (
    email: string,
    password: string,
    nickname: string,
    role: "master" | "user",
    color?: string,
    storeId?: string,
    hourlyWage?: number,
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!nickname) {
        console.error("❌ [useUser.addUser] Validation failed: No nickname");
        throw new Error("ニックネームを入力してください");
      }
      if (password.length < 6) {
        console.error(
          "❌ [useUser.addUser] Validation failed: Password too short",
        );
        throw new Error("パスワードは6文字以上で入力してください");
      }
      if (!storeId) {
        console.error("❌ [useUser.addUser] Validation failed: No storeId");
        throw new Error("店舗IDを入力してください");
      }

      if (role === "master") {
        const hasMaster = await checkMasterExists();
        if (hasMaster) {
          console.error("❌ [useUser.addUser] Master user already exists");
          throw new Error("マスターユーザーは既に存在します");
        }
      }

      // 実際のメールアドレスが提供された場合はそれを使用、なければ自動生成
      // メールアドレスを正規化（Unicodeの文字/数字は維持）
      const sanitizeForEmail = (str: string) =>
        str
          .normalize("NFKC")
          .replace(/\s+/g, "")
          .replace(/[^\p{L}\p{N}]/gu, "")
          .toLowerCase();

      const userEmail =
        email ||
        (role === "master"
          ? `${sanitizeForEmail(storeId || "store")}master@example.com`
          : `${sanitizeForEmail(storeId || "store")}${sanitizeForEmail(
              nickname,
            )}@example.com`);

      // Firebase接続テスト
      try {
        await import("@/services/firebase/firebase");
      } catch (dbError) {
        console.error(
          "❌ [useUser.addUser] Firebase connection failed:",
          dbError,
        );
        throw new Error("Firebaseへの接続に失敗しました");
      }

      // メールアドレスの重複チェック（タイムアウト付き）
      try {
        const emailExists = await checkEmailExists(userEmail);
        if (emailExists) {
          console.error(
            "❌ [useUser.addUser] Email already exists:",
            userEmail,
          );
          throw new Error(
            email
              ? "このメールアドレスは既に使用されています"
              : "このニックネームは既に使用されています",
          );
        }
      } catch (emailCheckError: any) {
        if (emailCheckError.message === "Query timeout after 10 seconds") {
          console.warn(
            "⚠️ [useUser.addUser] Email check timed out, proceeding anyway",
          );
          // タイムアウトの場合は処理を継続（重複の可能性はあるがFirebase Authでエラーになる）
        } else {
          throw emailCheckError;
        }
      }

      const newUser = await createUser(
        userEmail,
        password,
        nickname,
        color,
        storeId,
        role,
        hourlyWage,
      );

      // リストを更新
      await fetchUsers();
      return newUser;
    } catch (err: any) {
      console.error("❌ [useUser.addUser] Error occurred:", err);

      const errorMessage =
        err.code === "auth/weak-password"
          ? "パスワードは6文字以上で入力してください"
          : err.code === "auth/email-already-in-use"
          ? "このメールアドレス・ニックネームは既に使用されています"
          : err.code === "auth/invalid-email"
          ? "メールアドレスの形式が無効です"
          : err.code === "auth/operation-not-allowed"
          ? "このプロジェクトでメール認証が無効になっています"
          : err.message || "ユーザーの作成に失敗しました";

      console.error("❌ [useUser.addUser] Final error message:", errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (
    user: User,
    updates: {
      nickname?: string;
      email?: string; // メールアドレス更新を追加
      password?: string;
      role?: "master" | "user";
      color?: string;
      storeId?: string;
    },
  ): Promise<User | undefined> => {
    try {
      setLoading(true);

      const updatedUser = await updateUser(user, updates);

      if (updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.uid === user.uid ? updatedUser : u)),
        );
      }

      await fetchUsers();
      return updatedUser;
    } catch (err) {
      setError("ユーザー情報の更新に失敗しました");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (uid: string) => {
    try {
      setLoading(true);
      await deleteUser(uid);
      await fetchUsers();
    } catch (err) {
      setError("ユーザーの削除に失敗しました");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return {
    users,
    loading,
    error,
    addUser,
    editUser,
    removeUser,
    refreshUsers: fetchUsers,
    setUsers,
  };
};
