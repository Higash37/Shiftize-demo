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
