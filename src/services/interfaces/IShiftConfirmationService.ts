export interface ShiftConfirmation {
  id?: string;
  userId: string;
  storeId: string;
  periodId: string;
  confirmedAt: Date;
  status: "confirmed" | "cancelled";
}

export interface IShiftConfirmationService {
  confirmShift(userId: string, storeId: string, periodId: string): Promise<void>;
  cancelConfirmation(userId: string, periodId: string): Promise<void>;
  getUserConfirmationStatus(userId: string, periodId: string): Promise<boolean>;
  getStoreConfirmationStatus(storeId: string, periodId: string): Promise<ShiftConfirmation[]>;
}
