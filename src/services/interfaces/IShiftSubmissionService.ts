export interface ShiftSubmissionPeriod {
  id: string;
  storeId: string;
  startDate: Date;
  endDate: Date;
  targetMonth: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface ShiftRequest {
  date: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
  note?: string;
}

export interface ShiftSubmission {
  id: string;
  periodId: string;
  userId: string;
  storeId: string;
  requests: ShiftRequest[];
  status: 'draft' | 'submitted';
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShiftSubmissionService {
  getActivePeriods(storeId: string): Promise<ShiftSubmissionPeriod[]>;
  getAllPeriods(storeId: string): Promise<ShiftSubmissionPeriod[]>;
  getPeriod(periodId: string): Promise<ShiftSubmissionPeriod | null>;
  getUserSubmission(periodId: string, userId: string): Promise<ShiftSubmission | null>;
  saveSubmission(periodId: string, userId: string, storeId: string, requests: ShiftRequest[]): Promise<void>;
  submitShiftRequests(periodId: string, userId: string): Promise<void>;
  subscribeToActivePeriods(storeId: string, callback: (periods: ShiftSubmissionPeriod[]) => void): () => void;
  isWithinPeriod(period: ShiftSubmissionPeriod): boolean;
  getDaysUntilDeadline(period: ShiftSubmissionPeriod): number;
  deletePeriod(periodId: string): Promise<void>;
}
