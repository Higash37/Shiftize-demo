/**
 * @file PendingShiftBadgeContext.tsx
 * @description ユーザー（講師）による変更通知バッジ用Context。
 *   shift_change_logsテーブルからteacherが行った変更を検出し、
 *   マスターが未確認の変更数をバッジ表示する。
 *   シフト編集、削除申請、タイプ追加、ステータス変更など全種類の変更が対象。
 *   既読状態はlocalStorageに永続化される。
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getSupabase } from "@/services/supabase/supabase-client";
import { ServiceProvider } from "@/services/ServiceProvider";

const STORAGE_KEY_PREFIX = "shiftize_read_changes_";

function loadReadIds(storeId: string): Map<string, number> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${storeId}`);
    if (!raw) return new Map();
    const entries: [string, number][] = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

function saveReadIds(storeId: string, readIds: Map<string, number>) {
  try {
    const entries = Array.from(readIds.entries());
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${storeId}`, JSON.stringify(entries));
  } catch {
    // storage full or unavailable
  }
}

interface PendingShiftBadgeContextValue {
  thisMonthCount: number;
  nextMonthCount: number;
  isUnreadChange: (shiftId: string) => boolean;
  markAsRead: (shiftId: string) => void;
  refresh: () => void;
}

const PendingShiftBadgeContext = createContext<PendingShiftBadgeContextValue>({
  thisMonthCount: 0,
  nextMonthCount: 0,
  isUnreadChange: () => false,
  markAsRead: () => {},
  refresh: () => {},
});

export function PendingShiftBadgeProvider({ storeId, children }: { storeId: string; children: React.ReactNode }) {
  const [thisMonthIds, setThisMonthIds] = useState<Set<string>>(new Set());
  const [nextMonthIds, setNextMonthIds] = useState<Set<string>>(new Set());
  const readIdsRef = useRef<Map<string, number>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const storeIdRef = useRef(storeId);

  useEffect(() => {
    storeIdRef.current = storeId;
    if (storeId) {
      readIdsRef.current = loadReadIds(storeId);
    }
  }, [storeId]);

  const fetchCounts = useCallback(async () => {
    if (!storeId) return;
    try {
      const now = new Date();
      const thisYear = now.getFullYear();
      const thisMonth = now.getMonth();

      // 今月の日付範囲
      const thisStart = `${thisYear}-${String(thisMonth + 1).padStart(2, "0")}-01`;
      const thisEnd = `${thisYear}-${String(thisMonth + 1).padStart(2, "0")}-31`;

      // 来月の日付範囲
      const nextDate = new Date(thisYear, thisMonth + 1, 1);
      const nextYear = nextDate.getFullYear();
      const nextMonth = nextDate.getMonth();
      const nextStart = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-01`;
      const nextEnd = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-31`;

      const supabase = getSupabase();

      // 1) teacherが行った変更のshift_idを取得（今月・来月）
      // 2) pendingステータスのシフトも取得（ログがない古いデータ対応）
      const [thisLogRes, nextLogRes, thisShifts, nextShifts] = await Promise.all([
        supabase
          .from("shift_change_logs")
          .select("shift_id")
          .eq("store_id", storeId)
          .gte("date", thisStart)
          .lte("date", thisEnd)
          .eq("actor->>role", "teacher"),
        supabase
          .from("shift_change_logs")
          .select("shift_id")
          .eq("store_id", storeId)
          .gte("date", nextStart)
          .lte("date", nextEnd)
          .eq("actor->>role", "teacher"),
        ServiceProvider.shifts.getShiftsByMonth(storeId, thisYear, thisMonth),
        ServiceProvider.shifts.getShiftsByMonth(storeId, nextYear, nextMonth),
      ]);

      // change_logsからのID
      const thisChangedIds = new Set<string>();
      if (thisLogRes.data) {
        for (const row of thisLogRes.data) {
          if (row.shift_id) thisChangedIds.add(row.shift_id as string);
        }
      }
      const nextChangedIds = new Set<string>();
      if (nextLogRes.data) {
        for (const row of nextLogRes.data) {
          if (row.shift_id) nextChangedIds.add(row.shift_id as string);
        }
      }

      // pending / deletion_requestedのシフトも追加（ログ未記録でも通知対象）
      for (const s of thisShifts) {
        if (s.status === "pending" || s.status === "deletion_requested") {
          thisChangedIds.add(s.id);
        }
      }
      for (const s of nextShifts) {
        if (s.status === "pending" || s.status === "deletion_requested") {
          nextChangedIds.add(s.id);
        }
      }

      // pendingでなくなったIDは既読リストから消す（ゴミ掃除）
      const allChangedIds = new Set([...thisChangedIds, ...nextChangedIds]);
      const readIds = readIdsRef.current;
      let changed = false;
      for (const id of readIds.keys()) {
        if (!allChangedIds.has(id)) {
          readIds.delete(id);
          changed = true;
        }
      }
      if (changed) {
        saveReadIds(storeId, readIds);
      }

      // 既読を除外
      const thisUnread = new Set<string>();
      for (const id of thisChangedIds) {
        if (!readIds.has(id)) thisUnread.add(id);
      }
      const nextUnread = new Set<string>();
      for (const id of nextChangedIds) {
        if (!readIds.has(id)) nextUnread.add(id);
      }

      setThisMonthIds(thisUnread);
      setNextMonthIds(nextUnread);
    } catch {
      // silent
    }
  }, [storeId]);

  useEffect(() => {
    fetchCounts();
    intervalRef.current = setInterval(fetchCounts, 60_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchCounts]);

  const markAsRead = useCallback((shiftId: string) => {
    readIdsRef.current.set(shiftId, Date.now());
    saveReadIds(storeIdRef.current, readIdsRef.current);
    setThisMonthIds((prev) => {
      if (!prev.has(shiftId)) return prev;
      const next = new Set(prev);
      next.delete(shiftId);
      return next;
    });
    setNextMonthIds((prev) => {
      if (!prev.has(shiftId)) return prev;
      const next = new Set(prev);
      next.delete(shiftId);
      return next;
    });
  }, []);

  const isUnreadChange = useCallback(
    (shiftId: string) => thisMonthIds.has(shiftId) || nextMonthIds.has(shiftId),
    [thisMonthIds, nextMonthIds]
  );

  const value = useMemo(
    () => ({
      thisMonthCount: thisMonthIds.size,
      nextMonthCount: nextMonthIds.size,
      isUnreadChange,
      markAsRead,
      refresh: fetchCounts,
    }),
    [thisMonthIds.size, nextMonthIds.size, isUnreadChange, markAsRead, fetchCounts]
  );

  return (
    <PendingShiftBadgeContext.Provider value={value}>
      {children}
    </PendingShiftBadgeContext.Provider>
  );
}

export function usePendingShiftBadge() {
  return useContext(PendingShiftBadgeContext);
}
