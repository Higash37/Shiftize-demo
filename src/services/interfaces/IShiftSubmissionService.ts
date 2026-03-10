/** @file IShiftSubmissionService.ts @description シフト希望提出の期間管理・提出処理のインターフェース */

/** シフト希望提出期間のデータ構造 */
export interface ShiftSubmissionPeriod {
  /** 期間ID */
  id: string;
  /** 店舗ID */
  storeId: string;
  /** 受付開始日 */
  startDate: Date;
  /** 受付終了日 */
  endDate: Date;
  /** 対象月（YYYY-MM形式） */
  targetMonth: string;
  /** 受付中かどうか */
  isActive: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 作成者のユーザーID */
  createdBy: string;
}

/** シフト希望リクエストの1件分 */
export interface ShiftRequest {
  /** 希望日 */
  date: string;
  /** 開始時刻 */
  startTime: string;
  /** 終了時刻 */
  endTime: string;
  /** 優先度 */
  priority: 'high' | 'medium' | 'low';
  /** 備考 */
  note?: string;
}

/** シフト希望提出のデータ構造 */
export interface ShiftSubmission {
  /** 提出ID */
  id: string;
  /** 提出期間ID */
  periodId: string;
  /** ユーザーID */
  userId: string;
  /** 店舗ID */
  storeId: string;
  /** 希望リクエスト一覧 */
  requests: ShiftRequest[];
  /** 提出状態: 下書き or 提出済み */
  status: 'draft' | 'submitted';
  /** 提出日時 */
  submittedAt?: Date;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}

/** シフト希望提出の期間管理と提出処理を行うサービス */
export interface IShiftSubmissionService {
  /** 有効な提出期間を取得する */
  getActivePeriods(storeId: string): Promise<ShiftSubmissionPeriod[]>;
  /** すべての提出期間を取得する */
  getAllPeriods(storeId: string): Promise<ShiftSubmissionPeriod[]>;
  /** 指定の提出期間を取得する */
  getPeriod(periodId: string): Promise<ShiftSubmissionPeriod | null>;
  /** ユーザーの提出内容を取得する */
  getUserSubmission(periodId: string, userId: string): Promise<ShiftSubmission | null>;
  /** 希望シフトを保存する（下書き） */
  saveSubmission(periodId: string, userId: string, storeId: string, requests: ShiftRequest[]): Promise<void>;
  /** 希望シフトを提出する */
  submitShiftRequests(periodId: string, userId: string): Promise<void>;
  /** 有効な提出期間をリアルタイム監視する */
  subscribeToActivePeriods(storeId: string, callback: (periods: ShiftSubmissionPeriod[]) => void): () => void;
  /** 現在が提出期間内かどうか判定する */
  isWithinPeriod(period: ShiftSubmissionPeriod): boolean;
  /** 締切までの残り日数を計算する */
  getDaysUntilDeadline(period: ShiftSubmissionPeriod): number;
  /** 提出期間を削除する */
  deletePeriod(periodId: string): Promise<void>;
}
