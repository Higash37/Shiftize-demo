import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { format } from "date-fns";
import { ServiceProvider } from "@/services/ServiceProvider";

interface TodoBadgeContextValue {
  /** 今日の未完了TODO数 */
  todayUnreadCount: number;
  /** 手動リフレッシュ */
  refresh: () => void;
}

const TodoBadgeContext = createContext<TodoBadgeContextValue>({
  todayUnreadCount: 0,
  refresh: () => {},
});

export function TodoBadgeProvider({ storeId, userId, children }: { storeId: string; userId: string | undefined; children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    if (!storeId) return;
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const todos = await ServiceProvider.todos.getTodos(storeId, today);
      const visible = userId
        ? todos.filter((t) => t.visibleTo.length === 0 || t.visibleTo.includes(userId) || t.createdBy === userId)
        : todos;
      const incomplete = visible.filter((t) => !t.isCompleted);
      setCount(incomplete.length);
    } catch {
      // silent
    }
  }, [storeId, userId]);

  useEffect(() => {
    fetchCount();
    intervalRef.current = setInterval(fetchCount, 60_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchCount]);

  const value = useMemo(() => ({ todayUnreadCount: count, refresh: fetchCount }), [count, fetchCount]);

  return (
    <TodoBadgeContext.Provider value={value}>
      {children}
    </TodoBadgeContext.Provider>
  );
}

export function useTodoBadge() {
  return useContext(TodoBadgeContext);
}
