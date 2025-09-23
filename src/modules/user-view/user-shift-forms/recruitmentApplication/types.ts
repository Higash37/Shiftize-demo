import { RecruitmentShift } from "@/common/common-models/model-shift/shiftTypes";

// 応募状態の定義
export type ApplicationStatus = "available" | "unavailable" | "time_change";

// 時間変更での応募データ
export interface TimeChangeApplication {
  requestedStartTime: string;
  requestedEndTime: string;
  notes?: string;
}

// 個別募集シフトへの応募データ
export interface RecruitmentShiftApplication {
  shiftId: string;
  status: ApplicationStatus;
  timeChange?: TimeChangeApplication | undefined;
}

// フォーム全体のデータ
export interface RecruitmentApplicationData {
  applications: RecruitmentShiftApplication[];
  generalNotes?: string;
}

// フォームのProps
export interface RecruitmentShiftApplicationFormProps {
  storeId: string;
  shiftIds?: string; // カンマ区切りのシフトID文字列（URLパラメータ用）
}

// 表示用の募集シフトデータ
export interface DisplayRecruitmentShift extends RecruitmentShift {
  application?: RecruitmentShiftApplication;
}