/** @file useShiftHistory.ts
 *  @description シフト変更履歴を取得するカスタムフック。
 *    ServiceProvider の onShiftHistory（リアルタイムリスナー）を使って履歴データを購読し、
 *    クライアントサイドでフィルタリング（日付範囲、アクション種別、ユーザー名、検索クエリ）を行う。
 */

// 【このファイルの位置づけ】
// - import元: ServiceProvider（Supabaseアクセス）, shiftHistoryLogger（型定義）
// - importされる先: ShiftHistoryModal
// - 役割: 「データ取得」をUIから分離するカスタムフック。
//   useEffect 内でリアルタイムリスナーを登録し、クリーンアップ関数で解除する。

import { useState, useEffect } from "react";
import { ShiftHistoryEntry, ShiftActionType } from "@/services/shift-history/shiftHistoryLogger";
import { ServiceProvider } from "@/services/ServiceProvider";

// UseShiftHistoryOptions: このフックに渡すフィルタ条件
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

// useShiftHistory: カスタムフック本体。
// 引数のフィルタ条件が変わるたびに useEffect が再実行され、リスナーを再登録する。
// 戻り値は { entries, isLoading, error } の3つ。
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

  // useEffect の依存配列にフィルタ条件を含めることで、条件変更時に自動再取得される。
  // return () => unsubscribe() でリスナーをクリーンアップ（メモリリーク防止）。
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
