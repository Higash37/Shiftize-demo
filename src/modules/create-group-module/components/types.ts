export interface GroupCreationForm {
  groupName: string;
  adminNickname: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
}

export interface InitialMember {
  id: string;
  nickname: string;
  password: string;
  role: "master" | "user";
  color: string;
  hourlyWage?: number;
}

export interface StoreIdState {
  generatedStoreId: string;
  customStoreId: string;
  isCustomStoreId: boolean;
  storeIdCheckLoading: boolean;
  storeIdError: string;
}

export interface CreateGroupState {
  form: GroupCreationForm;
  loading: boolean;
  storeId: StoreIdState;
  initialMembers: InitialMember[];
  showMemberForm: boolean;
}