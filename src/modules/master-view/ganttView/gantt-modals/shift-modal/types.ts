import {
  ShiftStatus,
  ClassTimeSlot,
  ShiftTaskSlot,
} from "@/common/common-models/ModelIndex";

export interface ShiftData {
  id?: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  subject?: string;
  status?: ShiftStatus;
  classes?: ClassTimeSlot[];
  extendedTasks?: ShiftTaskSlot[];
}

export interface ShiftModalProps {
  visible: boolean;
  mode: "create" | "edit" | "delete";
  shiftData?: ShiftData;
  date?: string;
  users: Array<{ uid: string; nickname: string; color?: string }>;
  onClose: () => void;
  onSave?: (data: ShiftData) => void;
  onDelete?: (shiftId: string) => void;
}

export interface ConnectedStoreUser {
  uid: string;
  nickname: string;
  email: string;
  role: string;
  storeId: string;
  storeName: string;
  isFromOtherStore: boolean;
}

export interface ClassFormData {
  startTime: string;
  endTime: string;
  studentId: string;
  studentName: string;
  subject: string;
  location?: string;
}