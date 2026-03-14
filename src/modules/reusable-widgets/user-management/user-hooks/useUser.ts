/**
 * @file useUser.ts
 * @description ユーザーCRUD操作を提供するカスタムフック。
 *   ユーザーの取得・追加・編集・削除をServiceProvider経由で実行する。
 *
 * 【このファイルの位置づけ】
 *   reusable-widgets > user-management > user-hooks 配下のフック。
 *   UserManagement / InfoDashboard などから利用される。
 *
 * 返り値:
 *   - users: ユーザー配列
 *   - loading / error: ローディング・エラー状態
 *   - addUser(): 新規ユーザー作成（バリデーション + メール重複チェック + Auth登録）
 *   - editUser(): ユーザー情報更新
 *   - removeUser(): ユーザー削除
 *   - refreshUsers(): 手動リフレッシュ
 */
import { useState, useEffect } from "react";
import { User, UserRole } from "@/common/common-models/model-user/UserModel";
import { ServiceProvider } from "@/services/ServiceProvider";

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
      const userData = await ServiceProvider.users.getUsers(storeId);
      setUsers(userData);
      setError(null);
    } catch (err) {
      setError("ユーザー情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // loading状態を変えずにバックグラウンドでデータを同期
  const silentRefresh = async () => {
    try {
      const userData = await ServiceProvider.users.getUsers(storeId);
      setUsers(userData);
    } catch {
      // サイレントなので無視
    }
  };
  const addUser = async (
    email: string,
    password: string,
    nickname: string,
    role: UserRole,
    color?: string,
    storeId?: string,
    hourlyWage?: number,
    furigana?: string,
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!nickname) {
        throw new Error("ニックネームを入力してください");
      }
      if (password.length < 6) {
        throw new Error("パスワードは6文字以上で入力してください");
      }
      if (!storeId) {
        throw new Error("店舗IDを入力してください");
      }

      if (role === "master") {
        const hasMaster = await ServiceProvider.users.checkMasterExists(storeId);
        if (hasMaster) {
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

      // メールアドレスの重複チェック（タイムアウト付き）
      try {
        const emailExists = await ServiceProvider.users.checkEmailExists(userEmail, storeId);
        if (emailExists) {
          throw new Error(
            email
              ? "このメールアドレスは既に使用されています"
              : "このニックネームは既に使用されています",
          );
        }
      } catch (emailCheckError: any) {
        if (emailCheckError.message === "Query timeout after 10 seconds") {
          // タイムアウトの場合は処理を継続（重複の可能性はあるがSupabase Authでエラーになる）
        } else {
          throw emailCheckError;
        }
      }

      const newUser = await ServiceProvider.auth.createUser(
        userEmail,
        password,
        nickname,
        color,
        storeId,
        role,
        hourlyWage,
        furigana,
      );

      // リストを更新
      await fetchUsers();
      return newUser;
    } catch (err: any) {
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
      furigana?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      color?: string;
      storeId?: string;
    },
  ): Promise<User | undefined> => {
    try {
      const updatedUser = await ServiceProvider.auth.updateUser(user, updates);

      if (updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.uid === user.uid ? updatedUser : u)),
        );
      }

      silentRefresh();
      return updatedUser;
    } catch (err) {
      setError("ユーザー情報の更新に失敗しました");
      throw err;
    }
  };

  const removeUser = async (uid: string) => {
    try {
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      await ServiceProvider.users.deleteUser(uid);
      silentRefresh();
    } catch (err) {
      setError("ユーザーの削除に失敗しました");
      throw err;
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
