import type { IShiftService } from "../interfaces/IShiftService";
import { ShiftService } from "./firebase-shift";

export class FirebaseShiftAdapter implements IShiftService {
  getShifts = ShiftService.getShifts;
  addShift = ShiftService.addShift;
  updateShift = ShiftService.updateShift;
  markShiftAsDeleted = ShiftService.markShiftAsDeleted;
  approveShiftChanges = ShiftService.approveShiftChanges;
  markShiftAsCompleted = ShiftService.markShiftAsCompleted;
  addShiftReport = ShiftService.addShiftReport;
  getShiftsFromMultipleStores = ShiftService.getShiftsFromMultipleStores;
  getUserAccessibleShifts = ShiftService.getUserAccessibleShifts;
}
