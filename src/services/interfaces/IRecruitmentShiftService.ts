import {
  RecruitmentShift,
  RecruitmentApplication,
} from "@/common/common-models/model-shift/shiftTypes";

export interface IRecruitmentShiftService {
  createRecruitmentShift(
    shift: Omit<RecruitmentShift, "id" | "createdAt" | "updatedAt" | "applications">,
    options?: {
      sendLineNotification?: boolean;
      masterName?: string;
    }
  ): Promise<string>;

  updateRecruitmentShift(shiftId: string, updates: Partial<RecruitmentShift>): Promise<void>;

  applyToRecruitmentShift(
    shiftId: string,
    application: Omit<RecruitmentApplication, "appliedAt" | "status">
  ): Promise<void>;

  approveApplication(
    recruitmentShiftId: string,
    userId: string,
    shiftData: { startTime: string; endTime: string }
  ): Promise<void>;

  rejectApplication(recruitmentShiftId: string, userId: string): Promise<void>;

  deleteRecruitmentShift(shiftId: string): Promise<void>;

  updateRecruitmentStatus(shiftId: string, status: "open" | "closed" | "cancelled"): Promise<void>;

  getRecruitmentShift(shiftId: string): Promise<RecruitmentShift | null>;

  getOpenRecruitmentShifts(storeId: string): Promise<RecruitmentShift[]>;

  onOpenRecruitmentShifts(
    storeId: string,
    callback: (shifts: RecruitmentShift[]) => void,
    onError?: (error: any) => void
  ): () => void;

  getRecruitmentShifts(storeId: string): Promise<RecruitmentShift[]>;
}
