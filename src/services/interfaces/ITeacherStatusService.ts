/** @file ITeacherStatusService.ts @description 講師のシフト状況・確認ステータスの取得インターフェース */

/** 講師の基本情報 */
export interface TeacherInfo {
  /** ユーザーID */
  uid: string;
  /** ニックネーム */
  nickname: string;
  /** メールアドレス */
  email?: string;
  /** 所属店舗ID */
  storeId: string;
}

/** シフト件数の集計 */
export interface ShiftStats {
  /** 未承認の件数 */
  pending: number;
  /** 承認済みの件数 */
  approved: number;
  /** 却下された件数 */
  rejected: number;
  /** 合計件数 */
  total: number;
}

/** 講師のシフト確認状況 */
export interface TeacherStatus {
  /** 講師情報 */
  teacher: TeacherInfo;
  /** シフト確認済みかどうか */
  isConfirmed: boolean;
  /** シフト件数の集計 */
  shiftStats: ShiftStats;
}

/** 講師のシフト状況を取得するサービス */
export interface ITeacherStatusService {
  /** 店舗に所属する講師一覧を取得する */
  getTeachersByStore(storeId: string): Promise<TeacherInfo[]>;
  /** 講師のシフト集計を取得する */
  getTeacherShiftStats(teacherId: string, storeId: string, targetMonth: string): Promise<ShiftStats>;
  /** 店舗内の全講師のステータスを取得する */
  getAllTeacherStatus(storeId: string, periodId: string, targetMonth: string): Promise<TeacherStatus[]>;
}
