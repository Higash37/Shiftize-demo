import { User, UserData, UserRole } from "@/common/common-models/model-user/UserModel";

export interface UserEmailLookupResult {
  id: string;
  uid: string;
  nickname: string;
  email: string;
  role: UserRole;
  storeId: string;
  color?: string;
  hourlyWage?: number;
  realEmail?: string;
  realEmailUserId?: string;
}

export interface UserFullProfile {
  uid?: string;
  nickname?: string;
  role?: string;
  email?: string;
  storeId?: string;
  connectedStores?: string[];
  color?: string;
  hourlyWage?: number;
}

export interface IUserService {
  getUsers(storeId?: string): Promise<(User & { currentPassword?: string })[]>;

  deleteUser(id: string): Promise<void>;

  getUserData(userId: string): Promise<UserData | null>;

  checkMasterExists(storeId?: string): Promise<boolean>;

  checkEmailExists(email: string, storeId?: string): Promise<boolean>;

  checkEmailDuplicate(email: string): Promise<void>;

  findUserByEmail(email: string): Promise<UserEmailLookupResult | null>;

  addSecondaryEmail(userId: string, realEmail: string): Promise<void>;

  secureDeleteUser(userId: string, storeId: string): Promise<void>;

  secureDeleteUserByAdmin(targetUserId: string, storeId: string, adminUserId: string): Promise<void>;

  getUserFullProfile(userId: string): Promise<UserFullProfile | null>;
}
