/** @file IShiftConfirmationService.ts @description シフト確認ステータスの管理インターフェース */

/** シフト確認のデータ構造 */
export interface ShiftConfirmation {
  /** 確認レコードID */
  id?: string;
  /** ユーザーID */
  userId: string;
  /** 店舗ID */
  storeId: string;
  /** 提出期間ID */
  periodId: string;
  /** 確認日時 */
  confirmedAt: Date;
  /** ステータス: 確認済み or キャンセル */
  status: "confirmed" | "cancelled";
}

/** シフト確認の登録・取消・状態取得を行うサービス */
export interface IShiftConfirmationService {
  /** シフトを確認済みにする */
  confirmShift(userId: string, storeId: string, periodId: string): Promise<void>;
  /** シフト確認を取り消す */
  cancelConfirmation(userId: string, periodId: string): Promise<void>;
  /** ユーザーの確認状態を取得する */
  getUserConfirmationStatus(userId: string, periodId: string): Promise<boolean>;
  /** 店舗内の全確認状態を取得する */
  getStoreConfirmationStatus(storeId: string, periodId: string): Promise<ShiftConfirmation[]>;
}
