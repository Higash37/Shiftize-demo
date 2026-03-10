/** @file IShiftService.ts @description シフトのCRUD・リアルタイム監視・月別取得のインターフェース */

import { Shift, ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftHistoryActor } from "@/services/shift-history/shiftHistoryLogger";

/** シフトデータの管理・取得・監視を行うサービス */
export interface IShiftService {
  /** シフトを1件取得する */
  getShift(id: string): Promise<Shift | null>;

  /** 店舗のシフト一覧を取得する */
  getShifts(storeId?: string): Promise<Shift[]>;

  /** シフトを追加する */
  addShift(shift: Omit<Shift, "id">, actor?: ShiftHistoryActor): Promise<string>;

  /** シフトを更新する */
  updateShift(id: string, shift: Partial<Shift>, actor?: ShiftHistoryActor): Promise<void>;

  /** シフトを論理削除する */
  markShiftAsDeleted(id: string, deletedBy?: ShiftHistoryActor, reason?: string): Promise<void>;

  /** シフト変更を承認する */
  approveShiftChanges(id: string, approver?: ShiftHistoryActor): Promise<void>;

  /** シフトを完了済みにする */
  markShiftAsCompleted(id: string): Promise<void>;

  /** シフトに業務報告を追加する */
  addShiftReport(
    shiftId: string,
    reportData: {
      taskCounts: Record<string, { count: number; time: number }>;
      comments: string;
    }
  ): Promise<void>;

  /** 複数店舗のシフトを一括取得する */
  getShiftsFromMultipleStores(storeIds: string[]): Promise<Shift[]>;

  /** ユーザーがアクセス可能なシフトを取得する */
  getUserAccessibleShifts(userData: {
    storeId?: string;
    connectedStores?: string[];
  }): Promise<Shift[]>;

  /** 店舗のシフトアイテム一覧を取得する */
  getShiftItems(storeId: string): Promise<ShiftItem[]>;

  /** シフト変更をリアルタイム監視する */
  onShiftsChanged(
    storeId: string,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void;

  /** 月別のシフト一覧を取得する */
  getShiftsByMonth(
    storeId: string,
    year: number,
    month: number
  ): Promise<ShiftItem[]>;

  /** 月別シフトの変更をリアルタイム監視する */
  onShiftsByMonth(
    storeId: string,
    year: number,
    month: number,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void;
}
