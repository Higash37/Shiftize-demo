import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  Query,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { ShiftHistoryEntry, ShiftActionType } from "@/services/shift-history/shiftHistoryLogger";

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

    // クエリ制約を構築
    // Firestoreの制約: where句はorderBy句の前に来る必要がある
    const constraints: any[] = [
      where("storeId", "==", storeId),
    ];

    // actionFilterが指定されている場合は追加
    // 注意: 複合インデックス (storeId, action, timestamp) が必要になる可能性がある
    if (actionFilter !== "all") {
      constraints.push(where("action", "==", actionFilter));
    }

    // orderByは最後に追加
    constraints.push(orderBy("timestamp", "desc"));
    constraints.push(limit(250));

    const historyQuery: Query<DocumentData> = query(
      collection(db, "shiftChangeLogs"),
      ...constraints
    );

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        const historyData: ShiftHistoryEntry[] = [];
        let filteredOutCount = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const entry: ShiftHistoryEntry = {
            id: doc.id,
            storeId: data["storeId"],
            shiftId: data["shiftId"],
            action: data["action"],
            actor: data["actor"],
            timestamp: data["timestamp"],
            date: data["date"],
            prev: data["prev"],
            next: data["next"],
            prevSnapshot: data["prevSnapshot"],
            nextSnapshot: data["nextSnapshot"],
            summary: data["summary"],
            notes: data["notes"],
          };

          let shouldInclude = true;
          let filterReason = "";

          const entryDate = entry.date;
          if (entryDate && (entryDate < startDateString || entryDate > endDateString)) {
            shouldInclude = false;
            filterReason = `date filter (${entryDate} not in ${startDateString} to ${endDateString})`;
          }

          if (shouldInclude && userFilter && !entry.actor?.nickname?.includes(userFilter)) {
            shouldInclude = false;
            filterReason = `user filter (${entry.actor?.nickname} doesn't match ${userFilter})`;
          }

          if (shouldInclude && searchQuery && !entry.summary?.includes(searchQuery)) {
            shouldInclude = false;
            filterReason = `search query (summary doesn't match ${searchQuery})`;
          }

          if (shouldInclude) {
            historyData.push(entry);
          } else {
            filteredOutCount++;
          }
        });

        setEntries(historyData);
        setIsLoading(false);
      },
      (error) => {
        // エラーの詳細をログに記録
        console.error("Shift history fetch error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        let errorMessage = "履歴データの取得に失敗しました";
        
        // エラーの種類に応じてメッセージを変更
        if (error.code === "permission-denied") {
          errorMessage = "履歴データへのアクセス権限がありません。教室長としてログインしているか確認してください。";
        } else if (error.code === "failed-precondition") {
          // インデックス作成用のリンクを取得
          const indexLink = error.message?.includes("https://") 
            ? error.message.match(/https:\/\/[^\s]+/)?.[0]
            : null;
          
          if (indexLink) {
            errorMessage = `Firestoreのインデックスが必要です。以下のリンクからインデックスを作成してください:\n${indexLink}`;
            console.error("Index creation link:", indexLink);
          } else {
            errorMessage = `Firestoreのインデックスが必要です。エラー詳細: ${error.message || "インデックスが不足しています"}`;
          }
        } else if (error.message) {
          errorMessage = `履歴データの取得に失敗しました: ${error.message}`;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [storeId, startDate, endDate, actionFilter, userFilter, searchQuery]);

  return { entries, isLoading, error };
};
