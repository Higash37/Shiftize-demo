import { useState, useEffect } from "react";
import { getUsers } from "@/services/firebase/firebase-user";
import { ExtendedUser } from "../user-types/components";

export const useUsers = (storeId?: string) => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // UserServiceを利用してデータを取得
        const usersData = await getUsers(storeId);
        setUsers(usersData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [storeId]);

  return { users, loading, error };
};
