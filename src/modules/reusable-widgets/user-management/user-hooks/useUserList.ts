import { useState, useEffect } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { ExtendedUser } from "../user-types/components";

export const useUsers = (storeId?: string) => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // ServiceProviderを利用してデータを取得
        const usersData = await ServiceProvider.users.getUsers(storeId);
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
