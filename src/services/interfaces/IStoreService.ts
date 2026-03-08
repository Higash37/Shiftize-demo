import type { UserRole } from "@/common/common-models/model-user/UserModel";

export interface CreateGroupData {
  groupName: string;
  storeId: string;
  adminNickname: string;
  adminEmail?: string;
  adminPassword: string;
  initialMembers?: InitialMember[];
}

export interface InitialMember {
  nickname: string;
  password: string;
  role: UserRole;
  color: string;
  hourlyWage?: number;
}

export interface GroupCreationResult {
  success: boolean;
  storeId: string;
  adminUid: string;
  adminEmail?: string;
  message: string;
}

export interface StoreProfile {
  storeId: string;
  storeName: string;
  adminUid?: string;
  adminNickname?: string;
  isActive?: boolean;
}

export interface IStoreService {
  getStore(storeId: string): Promise<StoreProfile | null>;

  checkStoreIdExists(storeId: string): Promise<boolean>;

  generateUniqueStoreId(): Promise<string>;

  createGroup(data: CreateGroupData): Promise<GroupCreationResult>;

  checkGroupExists(storeId: string): Promise<{ exists: boolean; groupName?: string }>;
}
