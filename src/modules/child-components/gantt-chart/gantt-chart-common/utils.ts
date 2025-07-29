// ガントチャート共通ユーティリティ
import { useMemo } from 'react';

// メモ化された時間選択リストを生成
const TIME_OPTIONS_CACHE = (() => {
  const options: string[] = [];
  for (let hour = 9; hour <= 22; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:15`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
    options.push(`${hour.toString().padStart(2, "0")}:45`);
  }
  return options;
})();

export function generateTimeOptions() {
  return TIME_OPTIONS_CACHE;
}

// シフトの重なりをグループ化（1人1行表示のため、各シフトを別グループに）
import { ShiftItem } from "@/common/common-models/ModelIndex";
export function groupShiftsByOverlap(shifts: ShiftItem[]): ShiftItem[][] {
  if (!shifts || shifts.length === 0) return [];
  return shifts
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((shift) => [shift]);
}

// メモ化されたシフト重複チェック用のキャッシュ
const shiftOverlapCache = new Map<string, boolean>();

// 重複しないシフトをグループ化（時間が重複しないシフトを同じ行にまとめる）
export function groupNonOverlappingShifts(shifts: ShiftItem[]): ShiftItem[][] {
  if (!shifts || shifts.length === 0) return [];
  
  // 時間順にソート（最適化：in-placeソートではなくメモ化を活用）
  const sortedShifts = [...shifts].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const groups: ShiftItem[][] = [];
  
  for (const shift of sortedShifts) {
    // 既存のグループで重複しないものを探す
    let addedToGroup = false;
    
    for (const group of groups) {
      // このグループの全シフトと重複しないかチェック（最適化：早期終了）
      const hasOverlap = group.some(existingShift => 
        shiftsOverlapCached(existingShift, shift)
      );
      
      if (!hasOverlap) {
        group.push(shift);
        addedToGroup = true;
        break;
      }
    }
    
    // どのグループにも追加できなかった場合、新しいグループを作成
    if (!addedToGroup) {
      groups.push([shift]);
    }
  }
  
  return groups;
}

// キャッシュ機能付きシフト重複チェック
function shiftsOverlapCached(shift1: ShiftItem, shift2: ShiftItem): boolean {
  // キャッシュキーを生成（ID順で統一）
  const key = shift1.id < shift2.id 
    ? `${shift1.id}-${shift2.id}` 
    : `${shift2.id}-${shift1.id}`;
    
  if (shiftOverlapCache.has(key)) {
    return shiftOverlapCache.get(key)!;
  }
  
  const result = shiftsOverlap(shift1, shift2);
  shiftOverlapCache.set(key, result);
  return result;
}

// 2つのシフトが時間的に重複するかチェック
function shiftsOverlap(shift1: ShiftItem, shift2: ShiftItem): boolean {
  const start1 = timeToMinutes(shift1.startTime);
  const end1 = timeToMinutes(shift1.endTime);
  const start2 = timeToMinutes(shift2.startTime);
  const end2 = timeToMinutes(shift2.endTime);
  
  // 重複条件: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}

// メモ化された時間変換キャッシュ
const timeToMinutesCache = new Map<string, number>();

// 時間文字列を分に変換（キャッシュ機能付き）
function timeToMinutes(time: string): number {
  if (timeToMinutesCache.has(time)) {
    return timeToMinutesCache.get(time)!;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  const result = hours * 60 + minutes;
  timeToMinutesCache.set(time, result);
  return result;
}

// 時間位置変換キャッシュ
const timePositionCache = new Map<string, number>();

// 時間(string)→位置(number) - 15分刻みに対応（キャッシュ機能付き）
export function timeToPosition(time: string): number {
  if (timePositionCache.has(time)) {
    return timePositionCache.get(time)!;
  }
  
  const [hours, minutes] = time.split(":").map(Number);
  // 15分刻みでの位置を計算 (0-51の範囲)
  const totalMinutesFromStart = (hours - 9) * 60 + minutes;
  const result = totalMinutesFromStart / 15;
  timePositionCache.set(time, result);
  return result;
}

// 位置(number)→時間(string) - 動的グリッドに対応
export function positionToTime(position: number, timeGrid?: string[]): string {
  if (!timeGrid) {
    // fallback: 15分刻みの従来ロジック
    const totalMinutesFromStart = Math.round(position) * 15;
    const hours = Math.floor(totalMinutesFromStart / 60) + 9;
    const minutes = totalMinutesFromStart % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  // 動的グリッドでの位置計算
  const index = Math.floor(position);
  if (index >= 0 && index < timeGrid.length) {
    return timeGrid[index];
  }

  // インデックスが範囲外の場合は最初または最後の時間を返す
  return index < 0 ? timeGrid[0] : timeGrid[timeGrid.length - 1];
}
