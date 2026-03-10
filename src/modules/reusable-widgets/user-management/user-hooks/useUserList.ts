/**
 * @file useUserList.ts
 * @description ユーザー一覧を取得するシンプルなカスタムフック。
 *   useUser.ts の簡易版で、取得のみに特化している。
 *
 * 【このファイルの位置づけ】
 *   reusable-widgets > user-management > user-hooks 配下のフック。
 *
 * 返り値:
 *   - users: ユーザー配列
 *   - loading / error: ローディング・エラー状態
 *   - refetchUsers(): 再取得関数
 */
import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { ExtendedUser } from "../user-types/components";

export const useUsers = (storeId?: string) => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const usersData = await ServiceProvider.users.getUsers(storeId);
      setUsers(usersData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetchUsers: fetchUsers };
};
