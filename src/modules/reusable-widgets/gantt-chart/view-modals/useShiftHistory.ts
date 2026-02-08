import { useState, useEffect } from "react";
import { ShiftHistoryEntry, ShiftActionType } from "@/services/shift-history/shiftHistoryLogger";
import { ServiceProvider } from "@/services/ServiceProvider";

export interface UseShiftHistoryOptions {
  storeId: string;
  startDate: Date;
  endDate: Date;
  actionFilter?: ShiftActionType | "all";
  userFilter?: string;
  searchQuery?: string;
}

export interface UseShiftHistoryReturn {
  entries: ShiftHistoryEntry[];
  isLoading: boolean;
  error: string | null;
}

export const useShiftHistory = ({
  storeId,
  startDate,
  endDate,
  actionFilter = "all",
  userFilter = "",
  searchQuery = "",
}: UseShiftHistoryOptions): UseShiftHistoryReturn => {
  const [entries, setEntries] = useState<ShiftHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 日付文字列を取得（nullチェック付き）
    const startDateString = startDate?.toISOString()?.split("T")[0] ?? "";
    const endDateString = endDate?.toISOString()?.split("T")[0] ?? "";

    if (!startDateString || !endDateString) {
      setIsLoading(false);
      setError("日付の取得に失敗しました");
      return;
    }

    const unsubscribe = ServiceProvider.audit.onShiftHistory(
      {
        storeId,
        actionFilter,
      },
      (allEntries) => {
        // クライアントサイドフィルタリング
        const filteredEntries = allEntries.filter((entry) => {
          const entryDate = entry.date;
          if (entryDate && (entryDate < startDateString || entryDate > endDateString)) {
            return false;
          }
          if (userFilter && !entry.actor?.nickname?.includes(userFilter)) {
            return false;
          }
          if (searchQuery && !entry.summary?.includes(searchQuery)) {
            return false;
          }
          return true;
        });

        setEntries(filteredEntries);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message || "履歴データの取得に失敗しました");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [storeId, startDate, endDate, actionFilter, userFilter, searchQuery]);

  return { entries, isLoading, error };
};
