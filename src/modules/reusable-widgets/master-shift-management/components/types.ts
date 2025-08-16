import type { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";
import type { ExtendedUser } from "@/modules/reusable-widgets/user-management/user-types/components";
import type { UserData } from "@/services/firebase/firebase";

export interface MasterShiftCreateProps {
  mode: "create" | "edit";
  shiftId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  classes?: string;
}

export interface ShiftData {
  startTime: string;
  endTime: string;
  dates: string[];
  hasClass: boolean;
  classes: any[];
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

export interface MasterShiftCreateState {
  userData: UserData | null;
  existingShift: Shift | null;
  shiftData: ShiftData;
  showCalendar: boolean;
  isLoading: boolean;
  showSuccess: boolean;
  errorMessage: string;
  selectedUserId: string;
  selectedUserNickname: string;
  searchQuery: string;
  selectedStatus: ShiftStatus;
  selectedDate: string;
  selectedStartTime: string;
  selectedEndTime: string;
  selectedClasses: any[];
  connectedStoreUsers: ConnectedStoreUser[];
}

export interface UserSelectProps {
  users: ExtendedUser[];
  connectedStoreUsers: ConnectedStoreUser[];
  selectedUserId: string;
  searchQuery: string;
  onUserSelect: (userId: string, nickname: string) => void;
  onSearchChange: (query: string) => void;
}

export interface TimeSelectProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export interface DateSelectProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onCalendarOpen: () => void;
}

export interface StatusSelectProps {
  selectedStatus: ShiftStatus;
  onStatusChange: (status: ShiftStatus) => void;
}

export interface ClassTime {
  startTime: string;
  endTime: string;
}