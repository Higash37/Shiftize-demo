export interface TeacherInfo {
  uid: string;
  nickname: string;
  email?: string;
  storeId: string;
}

export interface ShiftStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface TeacherStatus {
  teacher: TeacherInfo;
  isConfirmed: boolean;
  shiftStats: ShiftStats;
}

export interface ITeacherStatusService {
  getTeachersByStore(storeId: string): Promise<TeacherInfo[]>;
  getTeacherShiftStats(teacherId: string, storeId: string, targetMonth: string): Promise<ShiftStats>;
  getAllTeacherStatus(storeId: string, periodId: string, targetMonth: string): Promise<TeacherStatus[]>;
}
