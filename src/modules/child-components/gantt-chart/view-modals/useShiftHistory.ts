import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
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

    // クエリの構築
    let q: Query<DocumentData> = collection(db, "shiftChangeLogs");
    
    // 基本的なフィルタ
    const constraints: any[] = [
      where("storeId", "==", storeId),
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      where("timestamp", "<=", Timestamp.fromDate(endDate)),
    ];
    
    // アクションフィルタ
    if (actionFilter !== "all") {
      constraints.push(where("action", "==", actionFilter));
    }
    
    // ソート
    constraints.push(orderBy("timestamp", "desc"));
    
    q = query(q, ...constraints);

    // リアルタイムリスナーの設定
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const historyData: ShiftHistoryEntry[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const entry: ShiftHistoryEntry = {
            id: doc.id,
            storeId: data.storeId,
            shiftId: data.shiftId,
            action: data.action,
            actor: data.actor,
            timestamp: data.timestamp,
            date: data.date,
            prev: data.prev,
            next: data.next,
            summary: data.summary,
            notes: data.notes,
          };
          
          // クライアント側でのフィルタリング
          let shouldInclude = true;
          
          // ユーザーフィルタ
          if (userFilter && !entry.actor.nickname.includes(userFilter)) {
            shouldInclude = false;
          }
          
          // 検索クエリフィルタ
          if (searchQuery && !entry.summary.includes(searchQuery)) {
            shouldInclude = false;
          }
          
          if (shouldInclude) {
            historyData.push(entry);
          }
        });
        
        setEntries(historyData);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to fetch shift history:", err);
        setError("履歴データの取得に失敗しました");
        setIsLoading(false);
      }
    );

    // クリーンアップ
    return () => unsubscribe();
  }, [storeId, startDate, endDate, actionFilter, userFilter, searchQuery]);

  return { entries, isLoading, error };
};