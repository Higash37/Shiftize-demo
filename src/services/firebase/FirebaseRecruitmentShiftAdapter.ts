import type { IRecruitmentShiftService } from "../interfaces/IRecruitmentShiftService";
import { RecruitmentShiftService } from "../recruitment-shift-service/recruitmentShiftService";
import type {
  RecruitmentShift,
  RecruitmentApplication,
} from "@/common/common-models/model-shift/shiftTypes";

/**
 * Firebase adapter that delegates to the existing RecruitmentShiftService.
 * The underlying service already uses Firebase directly.
 */
export class FirebaseRecruitmentShiftAdapter implements IRecruitmentShiftService {
  async createRecruitmentShift(
    shift: Omit<RecruitmentShift, "id" | "createdAt" | "updatedAt" | "applications">,
    options?: { sendLineNotification?: boolean; masterName?: string }
  ): Promise<string> {
    return RecruitmentShiftService.createRecruitmentShift(shift, options);
  }

  async updateRecruitmentShift(shiftId: string, updates: Partial<RecruitmentShift>): Promise<void> {
    return RecruitmentShiftService.updateRecruitmentShift(shiftId, updates);
  }

  async applyToRecruitmentShift(
    shiftId: string,
    application: Omit<RecruitmentApplication, "appliedAt" | "status">
  ): Promise<void> {
    return RecruitmentShiftService.applyToRecruitmentShift(shiftId, application);
  }

  async approveApplication(
    recruitmentShiftId: string,
    userId: string,
    shiftData: { startTime: string; endTime: string }
  ): Promise<void> {
    return RecruitmentShiftService.approveApplication(recruitmentShiftId, userId, shiftData);
  }

  async rejectApplication(recruitmentShiftId: string, userId: string): Promise<void> {
    return RecruitmentShiftService.rejectApplication(recruitmentShiftId, userId);
  }

  async deleteRecruitmentShift(shiftId: string): Promise<void> {
    return RecruitmentShiftService.deleteRecruitmentShift(shiftId);
  }

  async updateRecruitmentStatus(
    shiftId: string,
    status: "open" | "closed" | "cancelled"
  ): Promise<void> {
    return RecruitmentShiftService.updateRecruitmentStatus(shiftId, status);
  }

  async getRecruitmentShift(shiftId: string): Promise<RecruitmentShift | null> {
    return RecruitmentShiftService.getRecruitmentShift(shiftId);
  }

  async getOpenRecruitmentShifts(storeId: string): Promise<RecruitmentShift[]> {
    return RecruitmentShiftService.getOpenRecruitmentShifts(storeId);
  }

  onOpenRecruitmentShifts(
    storeId: string,
    callback: (shifts: RecruitmentShift[]) => void,
    onError?: (error: any) => void
  ): () => void {
    return RecruitmentShiftService.onOpenRecruitmentShifts(storeId, callback, onError);
  }

  async getRecruitmentShifts(storeId: string): Promise<RecruitmentShift[]> {
    return RecruitmentShiftService.getRecruitmentShifts(storeId);
  }
}
